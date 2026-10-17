/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createSnowplowMesh,
  createChaletMesh,
  createPineTreeMesh,
  createStreetlampMesh,
  createSnowmanMesh,
  createGiftMesh,
  SnowplowVehicleMesh,
} from './models.ts';
import { SnowSystem } from './snowSystem.ts';

export interface SceneGiftItem {
  id: string;
  mesh: THREE.Group;
  x: number;
  z: number;
  collected: boolean;
}

export class ThreeSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public snowSystem: SnowSystem;
  public vehicleMesh: SnowplowVehicleMesh;
  public giftItems: SceneGiftItem[] = [];
  public chalets: THREE.Group[] = [];
  public obstacles: { x: number; z: number; radius: number }[] = [];

  private container: HTMLDivElement;
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private cameraOffset: THREE.Vector3 = new THREE.Vector3(-24, 26, 24); // Isometric angle
  private beaconAngle: number = 0;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Scene & Atmosphere Fog
    this.scene = new THREE.Scene();
    const fogColor = new THREE.Color(0xb0c8e2); // Pale crisp winter atmospheric fog
    this.scene.background = fogColor;
    this.scene.fog = new THREE.FogExp2(0xb0c8e2, 0.012);

    // 2. Camera Setup (Isometric projection angle)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 300);
    this.camera.position.set(-24, 26, 24);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with PBR Pipeline
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Procedural Studio Reflection Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Balanced Lighting Rig
    this.setupLighting();

    // 6. Dynamic Snow Field & Road Network
    this.snowSystem = new SnowSystem(this.scene);

    // 7. Hero Snowplow Vehicle
    this.vehicleMesh = createSnowplowMesh(1);
    this.scene.add(this.vehicleMesh.group);

    // 8. Populate Cozy Winter Town Environment
    this.populateTown();

    // Pre-warm renderer shaders
    this.renderer.compile(this.scene, this.camera);
  }

  private setupLighting() {
    // Warm winter key light (low golden afternoon sun)
    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(45, 60, -35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    // Cool sky hemisphere ambient fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x64748b, 1.1);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Subtle soft rim fill
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rimLight.position.set(-35, 30, 45);
    this.scene.add(rimLight);
  }

  private populateTown() {
    // Cozy Chalets along neighborhood roads
    const chaletConfigs = [
      { x: 16, z: -16, rot: 0, w: 5.5, d: 5.2, h: 3.4 },
      { x: 16, z: 16, rot: Math.PI, w: 5.0, d: 4.8, h: 3.2 },
      { x: -16, z: -16, rot: 0, w: 5.2, d: 5.0, h: 3.3 },
      { x: -16, z: 16, rot: Math.PI, w: 5.6, d: 5.2, h: 3.5 },
      { x: -28, z: -38, rot: 0.2, w: 5.0, d: 4.6, h: 3.1 },
      { x: 26, z: -38, rot: -0.2, w: 5.2, d: 5.0, h: 3.2 },
      { x: -26, z: 38, rot: 3.0, w: 5.0, d: 4.8, h: 3.2 },
      { x: 26, z: 38, rot: -3.0, w: 5.4, d: 5.1, h: 3.4 },
    ];

    chaletConfigs.forEach((c) => {
      const house = createChaletMesh(c.w, c.d, c.h);
      house.position.set(c.x, 0, c.z);
      house.rotation.y = c.rot;
      this.scene.add(house);
      this.chalets.push(house);

      // Add to collision obstacles
      this.obstacles.push({
        x: c.x,
        z: c.z,
        radius: Math.max(c.w, c.d) * 0.55,
      });
    });

    // Town Square Centerpiece - Festive Town Christmas Tree & Gazebo
    const centerTree = createPineTreeMesh(2.2);
    centerTree.position.set(0, 0, 0);
    this.scene.add(centerTree);
    this.obstacles.push({ x: 0, z: 0, radius: 1.8 });

    // Streetlamps along main roads
    const lampPositions = [
      { x: -8.5, z: -10 },
      { x: 8.5, z: -10 },
      { x: -8.5, z: 10 },
      { x: 8.5, z: 10 },
      { x: -8.5, z: -30 },
      { x: 8.5, z: -30 },
      { x: -8.5, z: 30 },
      { x: 8.5, z: 30 },
      { x: -28, z: 6 },
      { x: 28, z: 6 },
      { x: -28, z: -6 },
      { x: 28, z: -6 },
    ];

    lampPositions.forEach((pos) => {
      const lamp = createStreetlampMesh();
      lamp.position.set(pos.x, 0, pos.z);
      this.scene.add(lamp);
      this.obstacles.push({ x: pos.x, z: pos.z, radius: 0.6 });
    });

    // Cute Snowmen in front yards
    const snowmanPositions = [
      { x: 11, z: -12 },
      { x: -11, z: 12 },
      { x: -20, z: -32 },
      { x: 20, z: 32 },
    ];

    snowmanPositions.forEach((pos) => {
      const snowman = createSnowmanMesh();
      snowman.position.set(pos.x, 0, pos.z);
      this.scene.add(snowman);
      this.obstacles.push({ x: pos.x, z: pos.z, radius: 0.8 });
    });

    // Pine Tree Groves (lining the village periphery and yard corners)
    const treePositions = [
      { x: -44, z: -44, s: 1.4 },
      { x: -42, z: -36, s: 1.1 },
      { x: -38, z: -46, s: 1.3 },
      { x: 44, z: -44, s: 1.3 },
      { x: 38, z: -46, s: 1.5 },
      { x: 42, z: -36, s: 1.0 },
      { x: -44, z: 44, s: 1.4 },
      { x: -36, z: 42, s: 1.2 },
      { x: 44, z: 44, s: 1.5 },
      { x: 36, z: 42, s: 1.1 },
      // Inner yard clusters
      { x: 24, z: -12, s: 1.2 },
      { x: -24, z: -12, s: 1.1 },
      { x: 24, z: 12, s: 1.3 },
      { x: -24, z: 12, s: 1.2 },
      { x: -12, z: -40, s: 1.3 },
      { x: 12, z: -40, s: 1.2 },
      { x: -12, z: 40, s: 1.2 },
      { x: 12, z: 40, s: 1.3 },
    ];

    treePositions.forEach((tp) => {
      const tree = createPineTreeMesh(tp.s);
      tree.position.set(tp.x, 0, tp.z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
      this.obstacles.push({ x: tp.x, z: tp.z, radius: 1.0 * tp.s });
    });

    // Hidden Holiday Gift Boxes buried in snow drifts
    const giftLocations = [
      { id: 'gift-1', x: -18, z: -8 },
      { id: 'gift-2', x: 22, z: 6 },
      { id: 'gift-3', x: -6, z: 28 },
      { id: 'gift-4', x: 14, z: -32 },
      { id: 'gift-5', x: 2, z: -20 },
    ];

    giftLocations.forEach((loc) => {
      const gift = createGiftMesh();
      gift.position.set(loc.x, 0.05, loc.z);
      this.scene.add(gift);
      this.giftItems.push({
        id: loc.id,
        mesh: gift,
        x: loc.x,
        z: loc.z,
        collected: false,
      });
    });
  }

  /**
   * Update blade geometry scale when player upgrades plow width
   */
  public updateBladeUpgrade(tier: number) {
    const bladeWidths = [2.2, 2.7, 3.3, 4.0];
    const newWidth = bladeWidths[Math.min(tier - 1, bladeWidths.length - 1)];
    const scaleFactor = newWidth / 2.2;
    this.vehicleMesh.bladeMesh.scale.x = scaleFactor;
    this.vehicleMesh.bladeEdgeMesh.scale.x = scaleFactor;
  }

  /**
   * Smoothly follow vehicle with isometric camera
   */
  public updateCamera(targetX: number, targetZ: number, delta: number, isTitleScreen = false) {
    if (isTitleScreen) {
      // Gentle cinematic orbit for Title Screen
      const time = performance.now() * 0.0003;
      const radius = 32;
      const camX = Math.sin(time) * radius;
      const camZ = Math.cos(time) * radius;
      this.camera.position.set(camX, 24, camZ);
      this.camera.lookAt(0, 2, 0);
      return;
    }

    // Follow vehicle with smooth exponential damping
    this.cameraTarget.x = THREE.MathUtils.damp(this.cameraTarget.x, targetX, 5.0, delta);
    this.cameraTarget.z = THREE.MathUtils.damp(this.cameraTarget.z, targetZ, 5.0, delta);

    const desiredCamPos = new THREE.Vector3(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredCamPos.x, 5.0, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredCamPos.y, 5.0, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredCamPos.z, 5.0, delta);

    this.camera.lookAt(this.cameraTarget.x, 0.8, this.cameraTarget.z);
  }

  /**
   * Animate vehicle wheels, beacon light, and gifts
   */
  public animateVisuals(speed: number, delta: number, isBoosting: boolean) {
    // 1. Roll wheels based on vehicle speed
    const wheelRollSpeed = (speed / 0.44) * delta;
    this.vehicleMesh.wheels.forEach((wheel) => {
      wheel.rotation.x += wheelRollSpeed;
    });

    // 2. Rotate rooftop emergency beacon light
    this.beaconAngle += delta * (isBoosting ? 14 : 7);
    this.vehicleMesh.beaconLight.rotation.y = this.beaconAngle;

    // 3. Floating animation on uncollected gifts
    const time = performance.now() * 0.003;
    this.giftItems.forEach((gift) => {
      if (!gift.collected) {
        gift.mesh.position.y = 0.15 + Math.sin(time + gift.x) * 0.08;
        gift.mesh.rotation.y += delta * 1.5;
      }
    });

    // 4. Update snow system particles
    this.snowSystem.update(delta);
  }

  public handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.snowSystem.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
