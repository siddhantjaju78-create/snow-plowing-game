/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface SnowPlowEvent {
  clearedSqMeters: number;
  isPlowingFreshSnow: boolean;
  bladeCenterWorld: THREE.Vector3;
}

export class SnowSystem {
  public static readonly WORLD_SIZE = 120; // 120m x 120m town area
  public static readonly TEXTURE_SIZE = 512;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snowTexture: THREE.CanvasTexture;
  private groundMesh: THREE.Mesh;
  private roadMesh: THREE.Mesh;
  private scene: THREE.Scene;

  // Snow clearing statistics
  private totalRoadPixels: number = 0;
  private clearedRoadPixels: number = 0;
  private pixelRoadMask: Uint8Array; // 1 if pixel is a plowing road/driveway zone, 0 if yard/building
  private pixelSnowState: Uint8Array; // 255 = full snow, 0 = fully cleared

  // Snow spray particle system (flies off the blade when plowing)
  private sprayParticles: THREE.Points;
  private sprayPositions: Float32Array;
  private sprayVelocities: Float32Array;
  private sprayLifetimes: Float32Array;
  private sprayCount: number = 400;
  private nextSprayIndex: number = 0;

  // Falling ambient snowflakes system
  private ambientSnow: THREE.Points;
  private ambientPositions: Float32Array;
  private ambientVelocities: Float32Array;
  private ambientCount: number = 800;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Offscreen Canvas for Dynamic Snow Deformation Mask
    this.canvas = document.createElement('canvas');
    this.canvas.width = SnowSystem.TEXTURE_SIZE;
    this.canvas.height = SnowSystem.TEXTURE_SIZE;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    this.pixelRoadMask = new Uint8Array(SnowSystem.TEXTURE_SIZE * SnowSystem.TEXTURE_SIZE);
    this.pixelSnowState = new Uint8Array(SnowSystem.TEXTURE_SIZE * SnowSystem.TEXTURE_SIZE);

    this.initRoadLayout();

    // Create CanvasTexture
    this.snowTexture = new THREE.CanvasTexture(this.canvas);
    this.snowTexture.colorSpace = THREE.SRGBColorSpace;
    this.snowTexture.minFilter = THREE.LinearFilter;
    this.snowTexture.magFilter = THREE.LinearFilter;
    this.snowTexture.anisotropy = 4;

    // 2. Base Ground Mesh (Dark asphalt/cobblestone roads + winter grass)
    const groundGeo = new THREE.PlaneGeometry(SnowSystem.WORLD_SIZE + 40, SnowSystem.WORLD_SIZE + 40, 1, 1);
    groundGeo.rotateX(-Math.PI / 2);

    // Procedural terrain texture
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark wet road asphalt
      roughness: 0.65,
      metalness: 0.2,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.position.y = 0.0;
    this.groundMesh.receiveShadow = true;
    scene.add(this.groundMesh);

    // 3. Dynamic Snow Blanket Mesh (Sits slightly above road, uses alpha mask from canvas)
    const snowGeo = new THREE.PlaneGeometry(SnowSystem.WORLD_SIZE, SnowSystem.WORLD_SIZE, 64, 64);
    snowGeo.rotateX(-Math.PI / 2);

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Bright crisp winter snow
      roughness: 0.75,
      metalness: 0.02,
      alphaMap: this.snowTexture,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.roadMesh = new THREE.Mesh(snowGeo, snowMat);
    this.roadMesh.position.y = 0.04;
    this.roadMesh.receiveShadow = true;
    scene.add(this.roadMesh);

    // 4. Initialize Particle Systems
    const { spray, sprayPos, sprayVel, sprayLife } = this.createSpraySystem();
    this.sprayParticles = spray;
    this.sprayPositions = sprayPos;
    this.sprayVelocities = sprayVel;
    this.sprayLifetimes = sprayLife;
    scene.add(this.sprayParticles);

    const { ambient, ambPos, ambVel } = this.createAmbientSnowSystem();
    this.ambientSnow = ambient;
    this.ambientPositions = ambPos;
    this.ambientVelocities = ambVel;
    scene.add(this.ambientSnow);
  }

  /**
   * Initializes town road, avenue, and driveway zones on the snow mask
   */
  private initRoadLayout() {
    const w = SnowSystem.TEXTURE_SIZE;
    const h = SnowSystem.TEXTURE_SIZE;

    // Fill entire canvas with pure white (100% snow)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, w, h);

    // Define town road network in normalized coordinates (-1 to 1)
    // Roads, cross avenues, town square, driveway branches
    const roads = [
      // Main Highway / Street (North-South)
      { x1: -4, z1: -48, x2: -4, z2: 48, width: 9 },
      // East-West Boulevard
      { x1: -48, z1: 0, x2: 48, z2: 0, width: 9 },
      // Secondary Loop Road (North loop)
      { x1: -32, z1: -28, x2: 32, z2: -28, width: 7 },
      // Secondary Loop Road (South loop)
      { x1: -35, z1: 26, x2: 35, z2: 26, width: 7 },
      // West Connector
      { x1: -32, z1: -28, x2: -32, z2: 26, width: 7 },
      // East Connector
      { x1: 32, z1: -28, x2: 32, z2: 26, width: 7 },
      // Town Square Plaza (Center)
      { x1: -12, z1: -12, x2: 12, z2: 12, isRect: true },
      // Cabin Driveways
      { x1: 6, z1: -16, x2: 20, z2: -16, width: 5 },
      { x1: 6, z1: 16, x2: 20, z2: 16, width: 5 },
      { x1: -24, z1: -16, x2: -8, z2: -16, width: 5 },
      { x1: -24, z1: 16, x2: -8, z2: 16, width: 5 },
      { x1: -20, z1: -38, x2: -20, z2: -28, width: 5 },
      { x1: 18, z1: -38, x2: 18, z2: -28, width: 5 },
      { x1: -18, z1: 26, x2: -18, z2: 38, width: 5 },
      { x1: 18, z1: 26, x2: 18, z2: 38, width: 5 },
    ];

    // Helper to map world coordinates to texture pixels
    const worldToPix = (val: number) => {
      const norm = (val + SnowSystem.WORLD_SIZE / 2) / SnowSystem.WORLD_SIZE;
      return Math.floor(norm * w);
    };

    // Draw the road network onto our road mask buffer
    roads.forEach((road) => {
      if (road.isRect) {
        const px1 = worldToPix(road.x1);
        const pz1 = worldToPix(road.z1);
        const px2 = worldToPix(road.x2);
        const pz2 = worldToPix(road.z2);
        for (let py = Math.min(pz1, pz2); py <= Math.max(pz1, pz2); py++) {
          for (let px = Math.min(px1, px2); px <= Math.max(px1, px2); px++) {
            if (px >= 0 && px < w && py >= 0 && py < h) {
              const idx = py * w + px;
              this.pixelRoadMask[idx] = 1;
            }
          }
        }
      } else {
        const px1 = worldToPix(road.x1);
        const pz1 = worldToPix(road.z1);
        const px2 = worldToPix(road.x2);
        const pz2 = worldToPix(road.z2);
        const radius = Math.floor((road.width! / SnowSystem.WORLD_SIZE) * w * 0.5);

        const dx = px2 - px1;
        const dz = pz2 - pz1;
        const steps = Math.max(Math.abs(dx), Math.abs(dz), 1);

        for (let s = 0; s <= steps; s++) {
          const cx = Math.floor(px1 + (dx * s) / steps);
          const cy = Math.floor(pz1 + (dz * s) / steps);

          for (let ry = -radius; ry <= radius; ry++) {
            for (let rx = -radius; rx <= radius; rx++) {
              if (rx * rx + ry * ry <= radius * radius) {
                const px = cx + rx;
                const py = cy + ry;
                if (px >= 0 && px < w && py >= 0 && py < h) {
                  const idx = py * w + px;
                  this.pixelRoadMask[idx] = 1;
                }
              }
            }
          }
        }
      }
    });

    // Count total plowing road pixels and initialize snow state
    this.totalRoadPixels = 0;
    for (let i = 0; i < w * h; i++) {
      this.pixelSnowState[i] = 255;
      if (this.pixelRoadMask[i] === 1) {
        this.totalRoadPixels++;
      }
    }
  }

  /**
   * Clears snow in world coordinates along the plow blade footprint
   */
  public plowSnow(
    worldX: number,
    worldZ: number,
    bladeAngle: number,
    bladeWidthWorld: number,
    heatedBladeBonus: number = 0
  ): SnowPlowEvent {
    const w = SnowSystem.TEXTURE_SIZE;
    const h = SnowSystem.TEXTURE_SIZE;

    const totalWidth = bladeWidthWorld + heatedBladeBonus * 0.45;

    // Convert world position to texture space
    const centerNormX = (worldX + SnowSystem.WORLD_SIZE / 2) / SnowSystem.WORLD_SIZE;
    const centerNormZ = (worldZ + SnowSystem.WORLD_SIZE / 2) / SnowSystem.WORLD_SIZE;

    const cx = Math.floor(centerNormX * w);
    const cy = Math.floor(centerNormZ * h);

    // Calculate blade segment in pixel coords
    const bladeRadiusPix = Math.floor(((totalWidth * 0.5) / SnowSystem.WORLD_SIZE) * w);
    const bladeDepthPix = Math.max(3, Math.floor((1.2 / SnowSystem.WORLD_SIZE) * w));

    // Perpendicular angle for plow blade
    const perpAngle = bladeAngle + Math.PI / 2;
    const cosA = Math.cos(perpAngle);
    const sinA = Math.sin(perpAngle);

    let newlyClearedPixels = 0;
    let freshSnowPlowed = false;

    // Draw clear streak on canvas
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(bladeAngle);

    // Clear snow where blade cuts through (rgba 0,0,0,0)
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';

    // Rounded rectangle stamp
    this.ctx.beginPath();
    const halfW = bladeRadiusPix;
    const halfD = bladeDepthPix;
    this.ctx.roundRect(-halfW, -halfD, halfW * 2, halfD * 2, 4);
    this.ctx.fill();
    this.ctx.restore();

    // Check pixel changes in the bounding box
    const checkRadius = bladeRadiusPix + 2;
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
      const py = cy + dy;
      if (py < 0 || py >= h) continue;

      for (let dx = -checkRadius; dx <= checkRadius; dx++) {
        const px = cx + dx;
        if (px < 0 || px >= w) continue;

        // Check if inside oriented blade box
        const localX = dx * Math.cos(-bladeAngle) - dy * Math.sin(-bladeAngle);
        const localY = dx * Math.sin(-bladeAngle) + dy * Math.cos(-bladeAngle);

        if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfD) {
          const idx = py * w + px;
          if (this.pixelRoadMask[idx] === 1 && this.pixelSnowState[idx] > 40) {
            this.pixelSnowState[idx] = 0;
            newlyClearedPixels++;
            freshSnowPlowed = true;
          }
        }
      }
    }

    if (newlyClearedPixels > 0) {
      this.clearedRoadPixels += newlyClearedPixels;
      this.snowTexture.needsUpdate = true;
    }

    // Convert cleared pixels to square meters
    const sqMetersPerPixel = (SnowSystem.WORLD_SIZE * SnowSystem.WORLD_SIZE) / (w * h);
    const clearedSqMeters = newlyClearedPixels * sqMetersPerPixel;

    // Spawn spray particles off blade edges
    if (freshSnowPlowed) {
      const leftTipX = worldX - Math.sin(perpAngle) * (totalWidth * 0.45);
      const leftTipZ = worldZ - Math.cos(perpAngle) * (totalWidth * 0.45);
      const rightTipX = worldX + Math.sin(perpAngle) * (totalWidth * 0.45);
      const rightTipZ = worldZ + Math.cos(perpAngle) * (totalWidth * 0.45);

      this.spawnSnowSpray(leftTipX, leftTipZ, bladeAngle - 0.7, 4);
      this.spawnSnowSpray(rightTipX, rightTipZ, bladeAngle + 0.7, 4);
    }

    return {
      clearedSqMeters,
      isPlowingFreshSnow: freshSnowPlowed,
      bladeCenterWorld: new THREE.Vector3(worldX, 0.3, worldZ),
    };
  }

  /**
   * Spawns snow spray particles bursting from plow wings
   */
  public spawnSnowSpray(worldX: number, worldZ: number, burstAngle: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      const idx = this.nextSprayIndex;
      this.nextSprayIndex = (this.nextSprayIndex + 1) % this.sprayCount;

      const pIdx = idx * 3;
      this.sprayPositions[pIdx] = worldX + (Math.random() - 0.5) * 0.3;
      this.sprayPositions[pIdx + 1] = 0.3 + Math.random() * 0.2;
      this.sprayPositions[pIdx + 2] = worldZ + (Math.random() - 0.5) * 0.3;

      const speed = 3.5 + Math.random() * 3.0;
      const angle = burstAngle + (Math.random() - 0.5) * 0.4;
      this.sprayVelocities[pIdx] = Math.sin(angle) * speed;
      this.sprayVelocities[pIdx + 1] = 2.0 + Math.random() * 2.5; // Upward arc
      this.sprayVelocities[pIdx + 2] = Math.cos(angle) * speed;

      this.sprayLifetimes[idx] = 0.65; // seconds
    }
    this.sprayParticles.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Update particle physics (snow spray + ambient flakes)
   */
  public update(delta: number) {
    // 1. Update Snow Spray
    const pos = this.sprayPositions;
    const vel = this.sprayVelocities;
    const life = this.sprayLifetimes;
    const gravity = -9.8;

    for (let i = 0; i < this.sprayCount; i++) {
      if (life[i] > 0) {
        life[i] -= delta;
        const pIdx = i * 3;

        // Apply velocity & gravity
        vel[pIdx + 1] += gravity * delta;
        pos[pIdx] += vel[pIdx] * delta;
        pos[pIdx + 1] += vel[pIdx + 1] * delta;
        pos[pIdx + 2] += vel[pIdx + 2] * delta;

        // Ground impact
        if (pos[pIdx + 1] < 0.05) {
          pos[pIdx + 1] = 0.05;
          vel[pIdx] *= 0.5;
          vel[pIdx + 2] *= 0.5;
        }

        if (life[i] <= 0) {
          pos[pIdx + 1] = -100; // Hide below ground
        }
      }
    }
    this.sprayParticles.geometry.attributes.position.needsUpdate = true;

    // 2. Update Ambient Falling Snow
    const ambPos = this.ambientPositions;
    const ambVel = this.ambientVelocities;
    for (let i = 0; i < this.ambientCount; i++) {
      const pIdx = i * 3;
      ambPos[pIdx] += ambVel[pIdx] * delta;
      ambPos[pIdx + 1] += ambVel[pIdx + 1] * delta;
      ambPos[pIdx + 2] += ambVel[pIdx + 2] * delta;

      // Wrap around sky
      if (ambPos[pIdx + 1] < 0.1) {
        ambPos[pIdx + 1] = 22 + Math.random() * 5;
        ambPos[pIdx] = (Math.random() - 0.5) * (SnowSystem.WORLD_SIZE + 20);
        ambPos[pIdx + 2] = (Math.random() - 0.5) * (SnowSystem.WORLD_SIZE + 20);
      }
    }
    this.ambientSnow.geometry.attributes.position.needsUpdate = true;
  }

  public getPercentCleared(): number {
    if (this.totalRoadPixels === 0) return 0;
    const pct = (this.clearedRoadPixels / this.totalRoadPixels) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  public getClearedSqMeters(): number {
    const sqMetersPerPixel = (SnowSystem.WORLD_SIZE * SnowSystem.WORLD_SIZE) / (SnowSystem.TEXTURE_SIZE * SnowSystem.TEXTURE_SIZE);
    return Math.round(this.clearedRoadPixels * sqMetersPerPixel);
  }

  public isPointOnRoad(worldX: number, worldZ: number): boolean {
    const w = SnowSystem.TEXTURE_SIZE;
    const h = SnowSystem.TEXTURE_SIZE;
    const px = Math.floor(((worldX + SnowSystem.WORLD_SIZE / 2) / SnowSystem.WORLD_SIZE) * w);
    const py = Math.floor(((worldZ + SnowSystem.WORLD_SIZE / 2) / SnowSystem.WORLD_SIZE) * h);
    if (px < 0 || px >= w || py < 0 || py >= h) return false;
    return this.pixelRoadMask[py * w + px] === 1;
  }

  private createSpraySystem() {
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(this.sprayCount * 3);
    const sprayVel = new Float32Array(this.sprayCount * 3);
    const sprayLife = new Float32Array(this.sprayCount);

    for (let i = 0; i < this.sprayCount; i++) {
      sprayPos[i * 3 + 1] = -100; // Initialize off-screen
    }

    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));

    const sprayMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
    });

    const spray = new THREE.Points(sprayGeo, sprayMat);
    spray.frustumCulled = false;

    return { spray, sprayPos, sprayVel, sprayLife };
  }

  private createAmbientSnowSystem() {
    const ambGeo = new THREE.BufferGeometry();
    const ambPos = new Float32Array(this.ambientCount * 3);
    const ambVel = new Float32Array(this.ambientCount * 3);

    for (let i = 0; i < this.ambientCount; i++) {
      const pIdx = i * 3;
      ambPos[pIdx] = (Math.random() - 0.5) * (SnowSystem.WORLD_SIZE + 20);
      ambPos[pIdx + 1] = Math.random() * 25;
      ambPos[pIdx + 2] = (Math.random() - 0.5) * (SnowSystem.WORLD_SIZE + 20);

      ambVel[pIdx] = (Math.random() - 0.5) * 0.8;
      ambVel[pIdx + 1] = -1.2 - Math.random() * 1.5; // Gentle flutter
      ambVel[pIdx + 2] = (Math.random() - 0.5) * 0.8;
    }

    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));

    const ambMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
    });

    const ambient = new THREE.Points(ambGeo, ambMat);
    ambient.frustumCulled = false;

    return { ambient, ambPos, ambVel };
  }

  public resetSnow() {
    this.initRoadLayout();
    this.clearedRoadPixels = 0;
    this.snowTexture.needsUpdate = true;
  }

  public dispose() {
    this.snowTexture.dispose();
    this.groundMesh.geometry.dispose();
    this.roadMesh.geometry.dispose();
    this.sprayParticles.geometry.dispose();
    this.ambientSnow.geometry.dispose();
  }
}
