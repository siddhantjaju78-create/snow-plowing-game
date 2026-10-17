/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural materials cache
export class GameMaterials {
  public static truckBody: THREE.MeshStandardMaterial;
  public static truckChassis: THREE.MeshStandardMaterial;
  public static bladeMetal: THREE.MeshStandardMaterial;
  public static bladeEdge: THREE.MeshStandardMaterial;
  public static tireRubber: THREE.MeshStandardMaterial;
  public static wheelRim: THREE.MeshStandardMaterial;
  public static windowGlass: THREE.MeshPhysicalMaterial;
  public static beaconGlass: THREE.MeshPhysicalMaterial;
  public static beaconLight: THREE.MeshBasicMaterial;
  public static headlightOn: THREE.MeshBasicMaterial;
  public static woodCabin: THREE.MeshStandardMaterial;
  public static woodTrim: THREE.MeshStandardMaterial;
  public static roofSnow: THREE.MeshStandardMaterial;
  public static windowGlow: THREE.MeshBasicMaterial;
  public static chimneyStone: THREE.MeshStandardMaterial;
  public static pineBark: THREE.MeshStandardMaterial;
  public static pineNeedles: THREE.MeshStandardMaterial;
  public static snowFoliage: THREE.MeshStandardMaterial;
  public static lampPostMetal: THREE.MeshStandardMaterial;
  public static lampGlow: THREE.MeshBasicMaterial;
  public static fenceWood: THREE.MeshStandardMaterial;
  public static giftBox: THREE.MeshStandardMaterial;
  public static giftRibbon: THREE.MeshStandardMaterial;
  public static snowmanSnow: THREE.MeshStandardMaterial;
  public static snowmanHat: THREE.MeshStandardMaterial;
  public static carrotNose: THREE.MeshStandardMaterial;

  public static init() {
    if (this.truckBody) return;

    // Snowplow materials
    this.truckBody = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm safety orange/amber
      roughness: 0.28,
      metalness: 0.15,
    });

    this.truckChassis = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.4,
    });

    this.bladeMetal = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber steel plow blade
      roughness: 0.35,
      metalness: 0.7,
    });

    this.bladeEdge = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Scraped silver cutting edge
      roughness: 0.2,
      metalness: 0.9,
    });

    this.tireRubber = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.wheelRim = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85,
    });

    this.windowGlass = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      thickness: 0.5,
    });

    this.beaconGlass = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.8,
    });

    this.beaconLight = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });

    this.headlightOn = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
    });

    // Environment materials
    this.woodCabin = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm log brown
      roughness: 0.85,
      metalness: 0.05,
    });

    this.woodTrim = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.8,
      metalness: 0.05,
    });

    this.roofSnow = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.75,
      metalness: 0.02,
    });

    this.windowGlow = new THREE.MeshBasicMaterial({
      color: 0xfef08a, // Warm 2700K cozy lamp light
    });

    this.chimneyStone = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.1,
    });

    this.pineBark = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.pineNeedles = new THREE.MeshStandardMaterial({
      color: 0x1b4332, // Deep cozy evergreen
      roughness: 0.8,
      metalness: 0.05,
    });

    this.snowFoliage = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
      metalness: 0.02,
    });

    this.lampPostMetal = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.8,
    });

    this.lampGlow = new THREE.MeshBasicMaterial({
      color: 0xfde047,
    });

    this.fenceWood = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.giftBox = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.35,
      metalness: 0.2,
    });

    this.giftRibbon = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.8,
    });

    this.snowmanSnow = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.02,
    });

    this.snowmanHat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2,
    });

    this.carrotNose = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.6,
      metalness: 0.05,
    });
  }
}

export interface SnowplowVehicleMesh {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  frontWheelPivots: THREE.Group[];
  bladeGroup: THREE.Group;
  bladeMesh: THREE.Mesh;
  bladeEdgeMesh: THREE.Mesh;
  beaconLight: THREE.Mesh;
  exhaustPipe: THREE.Mesh;
  headlightSpots: THREE.SpotLight[];
}

/**
 * Creates a detailed composite 10-part procedural 3D Snowplow Truck
 */
export function createSnowplowMesh(bladeTier: number = 1): SnowplowVehicleMesh {
  GameMaterials.init();
  const group = new THREE.Group();

  // 1. Chassis Frame (heavy steel underside)
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.45, 3.2);
  const chassis = new THREE.Mesh(chassisGeo, GameMaterials.truckChassis);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // 2. Main Cabin & Engine Hood
  // Hood (front)
  const hoodGeo = new THREE.BoxGeometry(1.5, 0.65, 1.3);
  const hood = new THREE.Mesh(hoodGeo, GameMaterials.truckBody);
  hood.position.set(0, 1.0, 0.85);
  hood.castShadow = true;
  group.add(hood);

  // Cabin (middle/driver)
  const cabGeo = new THREE.BoxGeometry(1.55, 0.95, 1.3);
  const cab = new THREE.Mesh(cabGeo, GameMaterials.truckBody);
  cab.position.set(0, 1.45, -0.3);
  cab.castShadow = true;
  group.add(cab);

  // 3. Windshield & Windows
  const windshieldGeo = new THREE.BoxGeometry(1.42, 0.55, 0.08);
  const windshield = new THREE.Mesh(windshieldGeo, GameMaterials.windowGlass);
  windshield.position.set(0, 1.6, 0.36);
  windshield.rotation.x = -0.25;
  group.add(windshield);

  // Side windows
  const sideWinGeo = new THREE.BoxGeometry(1.58, 0.45, 0.7);
  const sideWin = new THREE.Mesh(sideWinGeo, GameMaterials.windowGlass);
  sideWin.position.set(0, 1.55, -0.3);
  group.add(sideWin);

  // 4. Rear Salt Hopper / Utility Bed
  const bedGeo = new THREE.BoxGeometry(1.5, 0.65, 1.0);
  const bed = new THREE.Mesh(bedGeo, GameMaterials.truckChassis);
  bed.position.set(0, 1.05, -1.35);
  bed.castShadow = true;
  group.add(bed);

  // Salt grit in hopper
  const saltGeo = new THREE.BoxGeometry(1.3, 0.15, 0.8);
  const saltMesh = new THREE.Mesh(saltGeo, GameMaterials.roofSnow);
  saltMesh.position.set(0, 1.3, -1.35);
  group.add(saltMesh);

  // 5. Rooftop Amber Warning Beacon
  const beaconBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.1, 8);
  const beaconBase = new THREE.Mesh(beaconBaseGeo, GameMaterials.truckChassis);
  beaconBase.position.set(0, 1.97, -0.3);
  group.add(beaconBase);

  const beaconGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 12);
  const beaconLight = new THREE.Mesh(beaconGeo, GameMaterials.beaconLight);
  beaconLight.position.set(0, 2.08, -0.3);
  group.add(beaconLight);

  // 6. Chrome Exhaust Stack
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
  const exhaustPipe = new THREE.Mesh(exhaustGeo, GameMaterials.wheelRim);
  exhaustPipe.position.set(0.72, 1.8, -0.85);
  exhaustPipe.castShadow = true;
  group.add(exhaustPipe);

  // Exhaust top bend
  const bendGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
  const exhaustBend = new THREE.Mesh(bendGeo, GameMaterials.wheelRim);
  exhaustBend.position.set(0.72, 2.38, -0.92);
  exhaustBend.rotation.x = -0.55;
  group.add(exhaustBend);

  // 7. Headlights
  const headlightSpots: THREE.SpotLight[] = [];
  [-0.55, 0.55].forEach((hx) => {
    const hlMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.1), GameMaterials.headlightOn);
    hlMesh.position.set(hx, 0.95, 1.51);
    group.add(hlMesh);

    // Warm headlight beam
    const spot = new THREE.SpotLight(0xfff7ed, 3.5, 18, Math.PI / 5, 0.4, 1.2);
    spot.position.set(hx, 0.95, 1.55);
    spot.target.position.set(hx * 0.3, 0.1, 7.0);
    group.add(spot);
    group.add(spot.target);
    headlightSpots.push(spot);
  });

  // 8. Wheels (4 Heavy Offroad Tires)
  const wheels: THREE.Mesh[] = [];
  const frontWheelPivots: THREE.Group[] = [];
  const tireRadius = 0.44;
  const tireWidth = 0.32;
  const tirePositions = [
    { x: -0.92, z: 0.9, isFront: true },
    { x: 0.92, z: 0.9, isFront: true },
    { x: -0.92, z: -0.9, isFront: false },
    { x: 0.92, z: -0.9, isFront: false },
  ];

  tirePositions.forEach((pos) => {
    const tireGroup = new THREE.Group();
    tireGroup.position.set(pos.x, tireRadius, pos.z);

    // Wheel pivot for steering (front wheels turn)
    if (pos.isFront) {
      frontWheelPivots.push(tireGroup);
    }
    group.add(tireGroup);

    // Rubber tire
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, GameMaterials.tireRubber);
    tireMesh.castShadow = true;
    tireGroup.add(tireMesh);
    wheels.push(tireMesh);

    // Steel Hub & Rim
    const rimGeo = new THREE.CylinderGeometry(tireRadius * 0.55, tireRadius * 0.55, tireWidth + 0.02, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, GameMaterials.wheelRim);
    tireGroup.add(rimMesh);
  });

  // 9. Front Snowplow Assembly (Blade + Hydraulic Mounting Arms)
  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(0, 0.28, 1.85);

  // Mounting frame / hydraulics
  const mountArmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
  [-0.45, 0.45].forEach((mx) => {
    const arm = new THREE.Mesh(mountArmGeo, GameMaterials.truckChassis);
    arm.position.set(mx, 0.25, -0.3);
    arm.rotation.x = Math.PI / 4;
    bladeGroup.add(arm);
  });

  // Dynamic blade width calculation
  const bladeWidths = [2.2, 2.7, 3.3, 4.0];
  const initialWidth = bladeWidths[Math.min(bladeTier - 1, bladeWidths.length - 1)];

  // Curved heavy steel plow blade
  const bladeGeo = new THREE.BoxGeometry(initialWidth, 0.65, 0.15);
  const bladeMesh = new THREE.Mesh(bladeGeo, GameMaterials.bladeMetal);
  bladeMesh.position.set(0, 0.22, 0);
  bladeMesh.castShadow = true;
  bladeGroup.add(bladeMesh);

  // Cutting edge scraping bar
  const edgeGeo = new THREE.BoxGeometry(initialWidth + 0.05, 0.12, 0.18);
  const bladeEdgeMesh = new THREE.Mesh(edgeGeo, GameMaterials.bladeEdge);
  bladeEdgeMesh.position.set(0, -0.06, 0.02);
  bladeGroup.add(bladeEdgeMesh);

  // Side deflector wings
  const wingGeo = new THREE.BoxGeometry(0.12, 0.65, 0.4);
  const leftWing = new THREE.Mesh(wingGeo, GameMaterials.bladeMetal);
  leftWing.position.set(-initialWidth / 2, 0.22, -0.15);
  leftWing.rotation.y = 0.35;
  bladeGroup.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, GameMaterials.bladeMetal);
  rightWing.position.set(initialWidth / 2, 0.22, -0.15);
  rightWing.rotation.y = -0.35;
  bladeGroup.add(rightWing);

  // Slight plow sweep angle
  bladeGroup.rotation.y = 0.15;
  group.add(bladeGroup);

  // Ground shadow contact plane
  const shadowGeo = new THREE.PlaneGeometry(2.4, 4.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x07111e,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  return {
    group,
    wheels,
    frontWheelPivots,
    bladeGroup,
    bladeMesh,
    bladeEdgeMesh,
    beaconLight,
    exhaustPipe,
    headlightSpots,
  };
}

/**
 * Procedural Cozy Alpine Chalet Cabin with snow roof & glowing windows
 */
export function createChaletMesh(width = 4.5, depth = 5.0, height = 3.2): THREE.Group {
  GameMaterials.init();
  const group = new THREE.Group();

  // 1. Foundation / Porch
  const foundationGeo = new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4);
  const foundation = new THREE.Mesh(foundationGeo, GameMaterials.chimneyStone);
  foundation.position.y = 0.15;
  foundation.receiveShadow = true;
  group.add(foundation);

  // 2. Timber Log Walls
  const wallGeo = new THREE.BoxGeometry(width, height, depth);
  const walls = new THREE.Mesh(wallGeo, GameMaterials.woodCabin);
  walls.position.y = height / 2 + 0.3;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 3. Steep Alpine Gabled Roof
  const roofHeight = 1.8;
  const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.8, roofHeight, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, GameMaterials.woodTrim);
  roof.position.y = height + 0.3 + roofHeight / 2;
  roof.scale.set(width / (width + depth) * 1.8, 1, depth / (width + depth) * 1.8);
  roof.castShadow = true;
  group.add(roof);

  // 4. Thick Fluffy Snow Blanket on Roof
  const snowRoofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.82, roofHeight * 0.7, 4);
  snowRoofGeo.rotateY(Math.PI / 4);
  const snowRoof = new THREE.Mesh(snowRoofGeo, GameMaterials.roofSnow);
  snowRoof.position.y = height + 0.3 + roofHeight * 0.65;
  snowRoof.scale.set(width / (width + depth) * 1.82, 1, depth / (width + depth) * 1.82);
  snowRoof.castShadow = true;
  group.add(snowRoof);

  // 5. Stone Chimney with Cap
  const chimneyGeo = new THREE.BoxGeometry(0.7, height + 1.2, 0.7);
  const chimney = new THREE.Mesh(chimneyGeo, GameMaterials.chimneyStone);
  chimney.position.set(width * 0.3, height / 2 + 0.9, -depth * 0.25);
  chimney.castShadow = true;
  group.add(chimney);

  const chimneySnowGeo = new THREE.BoxGeometry(0.85, 0.2, 0.85);
  const chimneySnow = new THREE.Mesh(chimneySnowGeo, GameMaterials.roofSnow);
  chimneySnow.position.set(width * 0.3, height + 1.55, -depth * 0.25);
  group.add(chimneySnow);

  // 6. Cozy Glowing Windows (Front & Side)
  const winGeo = new THREE.BoxGeometry(0.9, 1.0, 0.08);
  const win1 = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
  win1.position.set(-width * 0.25, height * 0.55 + 0.3, depth / 2 + 0.02);
  group.add(win1);

  const win2 = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
  win2.position.set(width * 0.25, height * 0.55 + 0.3, depth / 2 + 0.02);
  group.add(win2);

  // Window mullions (cross frames)
  [-width * 0.25, width * 0.25].forEach((wx) => {
    const frameGeo = new THREE.BoxGeometry(0.92, 0.06, 0.1);
    const frame = new THREE.Mesh(frameGeo, GameMaterials.woodTrim);
    frame.position.set(wx, height * 0.55 + 0.3, depth / 2 + 0.03);
    group.add(frame);
  });

  // Front Rustic Door
  const doorGeo = new THREE.BoxGeometry(0.9, 1.8, 0.08);
  const door = new THREE.Mesh(doorGeo, GameMaterials.woodTrim);
  door.position.set(0, 1.2, depth / 2 + 0.02);
  group.add(door);

  return group;
}

/**
 * Procedural Pine/Evergreen Tree with snow dusted tiers
 */
export function createPineTreeMesh(scale = 1.0): THREE.Group {
  GameMaterials.init();
  const group = new THREE.Group();

  // Trunk
  const trunkRadius = 0.22 * scale;
  const trunkHeight = 1.2 * scale;
  const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 7);
  const trunk = new THREE.Mesh(trunkGeo, GameMaterials.pineBark);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 Tiers of Pine Needle Foliage with Snow Caps
  const tiers = [
    { radius: 1.6 * scale, height: 1.4 * scale, y: 1.1 * scale },
    { radius: 1.25 * scale, height: 1.2 * scale, y: 1.9 * scale },
    { radius: 0.85 * scale, height: 1.1 * scale, y: 2.6 * scale },
  ];

  tiers.forEach((tier) => {
    // Green foliage cone
    const coneGeo = new THREE.ConeGeometry(tier.radius, tier.height, 7);
    const foliage = new THREE.Mesh(coneGeo, GameMaterials.pineNeedles);
    foliage.position.y = tier.y + tier.height / 2;
    foliage.castShadow = true;
    group.add(foliage);

    // Snow layer on top of cone
    const snowConeGeo = new THREE.ConeGeometry(tier.radius * 0.88, tier.height * 0.45, 7);
    const snowCone = new THREE.Mesh(snowConeGeo, GameMaterials.snowFoliage);
    snowCone.position.y = tier.y + tier.height * 0.75;
    snowCone.castShadow = true;
    group.add(snowCone);
  });

  return group;
}

/**
 * Procedural Streetlamp with warm glowing lantern
 */
export function createStreetlampMesh(): THREE.Group {
  GameMaterials.init();
  const group = new THREE.Group();

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
  const base = new THREE.Mesh(baseGeo, GameMaterials.lampPostMetal);
  base.position.y = 0.2;
  base.castShadow = true;
  group.add(base);

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8);
  const pole = new THREE.Mesh(poleGeo, GameMaterials.lampPostMetal);
  pole.position.y = 1.6;
  pole.castShadow = true;
  group.add(pole);

  // Arched top arm
  const armGeo = new THREE.BoxGeometry(0.6, 0.08, 0.08);
  const arm = new THREE.Mesh(armGeo, GameMaterials.lampPostMetal);
  arm.position.set(0.25, 3.0, 0);
  group.add(arm);

  // Lantern Cap & Base
  const capGeo = new THREE.ConeGeometry(0.26, 0.2, 6);
  const cap = new THREE.Mesh(capGeo, GameMaterials.lampPostMetal);
  cap.position.set(0.5, 3.08, 0);
  group.add(cap);

  // Snow on lamp cap
  const lampSnowGeo = new THREE.ConeGeometry(0.28, 0.1, 6);
  const lampSnow = new THREE.Mesh(lampSnowGeo, GameMaterials.roofSnow);
  lampSnow.position.set(0.5, 3.16, 0);
  group.add(lampSnow);

  // Glowing lantern glass
  const lanternGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.28, 6);
  const lantern = new THREE.Mesh(lanternGeo, GameMaterials.lampGlow);
  lantern.position.set(0.5, 2.88, 0);
  group.add(lantern);

  // Soft warm pointlight for the streetlamp
  const light = new THREE.PointLight(0xfde047, 1.8, 8, 1.5);
  light.position.set(0.5, 2.8, 0);
  group.add(light);

  return group;
}

/**
 * Procedural Snowman with carrot nose, top hat and pebble eyes
 */
export function createSnowmanMesh(): THREE.Group {
  GameMaterials.init();
  const group = new THREE.Group();

  // Bottom sphere
  const bottomGeo = new THREE.SphereGeometry(0.6, 12, 10);
  const bottom = new THREE.Mesh(bottomGeo, GameMaterials.snowmanSnow);
  bottom.position.y = 0.55;
  bottom.castShadow = true;
  group.add(bottom);

  // Middle sphere
  const midGeo = new THREE.SphereGeometry(0.42, 12, 10);
  const mid = new THREE.Mesh(midGeo, GameMaterials.snowmanSnow);
  mid.position.y = 1.35;
  mid.castShadow = true;
  group.add(mid);

  // Head sphere
  const headGeo = new THREE.SphereGeometry(0.3, 12, 10);
  const head = new THREE.Mesh(headGeo, GameMaterials.snowmanSnow);
  head.position.y = 1.9;
  head.castShadow = true;
  group.add(head);

  // Top hat
  const hatBrimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.05, 12);
  const hatBrim = new THREE.Mesh(hatBrimGeo, GameMaterials.snowmanHat);
  hatBrim.position.y = 2.18;
  group.add(hatBrim);

  const hatTopGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12);
  const hatTop = new THREE.Mesh(hatTopGeo, GameMaterials.snowmanHat);
  hatTop.position.y = 2.34;
  group.add(hatTop);

  // Carrot nose
  const noseGeo = new THREE.ConeGeometry(0.06, 0.25, 6);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, GameMaterials.carrotNose);
  nose.position.set(0, 1.9, 0.35);
  group.add(nose);

  // Stick arms
  const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5);
  armGeo.rotateZ(Math.PI / 3);
  const leftArm = new THREE.Mesh(armGeo, GameMaterials.pineBark);
  leftArm.position.set(-0.55, 1.45, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, GameMaterials.pineBark);
  rightArm.position.set(0.55, 1.45, 0);
  rightArm.rotation.z = -Math.PI / 3;
  group.add(rightArm);

  return group;
}

/**
 * Procedural Hidden Holiday Gift Box to discover in snowdrifts
 */
export function createGiftMesh(): THREE.Group {
  GameMaterials.init();
  const group = new THREE.Group();

  const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const box = new THREE.Mesh(boxGeo, GameMaterials.giftBox);
  box.position.y = 0.4;
  box.castShadow = true;
  group.add(box);

  // Ribbons
  const ribbon1Geo = new THREE.BoxGeometry(0.82, 0.82, 0.16);
  const r1 = new THREE.Mesh(ribbon1Geo, GameMaterials.giftRibbon);
  r1.position.y = 0.4;
  group.add(r1);

  const ribbon2Geo = new THREE.BoxGeometry(0.16, 0.82, 0.82);
  const r2 = new THREE.Mesh(ribbon2Geo, GameMaterials.giftRibbon);
  r2.position.y = 0.4;
  group.add(r2);

  // Bow
  const bowGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const bow = new THREE.Mesh(bowGeo, GameMaterials.giftRibbon);
  bow.position.y = 0.88;
  group.add(bow);

  return group;
}
