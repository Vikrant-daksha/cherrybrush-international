import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Sizing Constants - Exported for geometry sharing
// ─────────────────────────────────────────────────────────────────────────────
export const SHELF_H = 0.08; // thickness of the main shelf body
export const BASE_H = 0.6; // height of the bottom base board
export const PLATE_H = 0.6; // total height of the front label plate face
export const PLATE_INSET = 0.4; // gap between shelf edge and plate frame
export const BORDER_T = 0.012; // thickness of gold border stripes
export const RECESS_INSET = 0.05; // gap between gold border and inner recess

export interface ShelfGeometries {
  baseBoardGeo: THREE.BufferGeometry;
  shelfBodyGeo: THREE.BufferGeometry;
  shelfTopGeo: THREE.BufferGeometry;
  plateBackGeo: THREE.BufferGeometry;
  goldTopBottomGeo: THREE.BufferGeometry;
  goldLeftRightGeo: THREE.BufferGeometry;
  recessGeo: THREE.BufferGeometry;
  bottomShadowGeo: THREE.BufferGeometry;
}

export interface ShelfMaterials {
  shelfTopMat: THREE.Material;
  shelfBodyMat: THREE.Material;
  plateMat: THREE.Material;
  goldMat: THREE.Material;
  recessMat?: THREE.Material;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildShelfGroup — shared geometry builder for the ProductShelf
// ─────────────────────────────────────────────────────────────────────────────
// Returns a THREE.Group centred at local (0, 0, 0) with Y=0 at the shelf FLOOR.
// The caller is responsible for positioning the returned group in its scene.
//
// Dimensions the caller can override:
export interface ShelfOptions {
  width?: number; // shelf opening width       (default: 3.0)
  depth?: number; // front-to-back depth        (default: 1.4)
  woodMaterial?: THREE.Material; // custom PBR wood material
  geometries?: ShelfGeometries; // optional pre-instantiated geometries
  materials?: ShelfMaterials; // optional pre-instantiated materials
}

export function buildShelfGroup({
  width = 3.0,
  depth = 1.4,
  woodMaterial,
  geometries,
  materials,
}: ShelfOptions = {}): THREE.Group {
  const W = width;
  const D = depth;

  // ── Materials ─────────────────────────────────────────────────────────────

  // Assign final materials based on whether shared materials or a custom woodMaterial was supplied
  let shelfBodyMat = materials?.shelfBodyMat;
  if (!shelfBodyMat) {
    const defaultShelfBodyMat = new THREE.MeshStandardMaterial({
      color: 0x5a3318,
      roughness: 0.4,
      metalness: 0.05,
      emissive: new THREE.Color(0x3d1f0a),
      emissiveIntensity: 1.0,
    });
    shelfBodyMat = woodMaterial || defaultShelfBodyMat;
  }

  let shelfTopMat = materials?.shelfTopMat;
  if (!shelfTopMat) {
    const defaultShelfTopMat = new THREE.MeshStandardMaterial({
      color: 0x6b3d1e,
      roughness: 0.05, // ← TUNE: 0 = mirror gloss, 0.3 = satin
      metalness: 0.08,
      emissive: new THREE.Color(0x2a1005),
      emissiveIntensity: 0.25,
    });
    if (woodMaterial) {
      // Clone custom material and make it glossy for the top shelf mat
      const glossyClone = (woodMaterial as THREE.MeshStandardMaterial).clone();
      glossyClone.roughness = 0.12; // lacquered look
      shelfTopMat = glossyClone;
    } else {
      shelfTopMat = defaultShelfTopMat;
    }
  }

  // Label plate — dark lacquered panel
  const plateMat = materials?.plateMat; //||
  // new THREE.MeshStandardMaterial({
  //   color: 0x4d372c,
  //   roughness: 0.3,
  //   metalness: 0.05,
  //   emissive: new THREE.Color(0x2f1d15),
  //   emissiveIntensity: 0.5,
  // });

  // Gold border
  const goldMat =
    materials?.goldMat ||
    new THREE.MeshStandardMaterial({
      color: 0xd4b373, // warm satin gold
      roughness: 0.35,
      metalness: 0.3,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

  // ── Build geometry ────────────────────────────────────────────────────────
  const group = new THREE.Group();

  // A. Base board (bottom strip, rests at Y=0)
  const baseBoard = new THREE.Mesh(
    geometries?.baseBoardGeo || new THREE.BoxGeometry(W, BASE_H, D),
    shelfBodyMat,
  );
  baseBoard.position.set(0, BASE_H / 2, 0);
  baseBoard.castShadow = true;
  baseBoard.receiveShadow = true;
  group.add(baseBoard);

  // B. Shelf body (sits on top of base board)
  const shelfBody = new THREE.Mesh(
    geometries?.shelfBodyGeo || new THREE.BoxGeometry(W, SHELF_H, D),
    shelfBodyMat,
  );
  shelfBody.position.set(0, BASE_H + SHELF_H / 2, 0);
  shelfBody.castShadow = true;
  shelfBody.receiveShadow = true;
  group.add(shelfBody);

  // C. Polished top surface (thin glossy veneer on top of shelf body)
  const shelfTop = new THREE.Mesh(
    geometries?.shelfTopGeo || new THREE.BoxGeometry(W, 0.012, D),
    shelfTopMat,
  );
  shelfTop.position.set(0, BASE_H + SHELF_H + 0.006, 0);
  shelfTop.receiveShadow = true;
  group.add(shelfTop);

  // D. Label plate system (on the front face of the shelf body)
  const plateY = (BASE_H + SHELF_H) / 2; // centred vertically on shelf body
  const plateZ = D / 2 + 0.002; // flush with front face
  const plateW = Math.min(W - PLATE_INSET * 2, 2.4);

  // Dark background plate
  const plateBack = new THREE.Mesh(
    geometries?.plateBackGeo || new THREE.BoxGeometry(plateW, PLATE_H, 0.008),
    plateMat,
  );
  plateBack.position.set(0, plateY, plateZ);
  group.add(plateBack);

  // Gold border — top
  const goldTop = new THREE.Mesh(
    geometries?.goldTopBottomGeo ||
      new THREE.BoxGeometry(plateW, BORDER_T, 0.012),
    goldMat,
  );
  goldTop.position.set(0, plateY + PLATE_H / 2 - BORDER_T / 2, plateZ + 0.004);
  group.add(goldTop);

  // Gold border — bottom
  const goldBottom = new THREE.Mesh(
    geometries?.goldTopBottomGeo ||
      new THREE.BoxGeometry(plateW, BORDER_T, 0.012),
    goldMat,
  );
  goldBottom.position.set(
    0,
    plateY - PLATE_H / 2 + BORDER_T / 2,
    plateZ + 0.004,
  );
  group.add(goldBottom);

  // Gold border — left
  const goldLeft = new THREE.Mesh(
    geometries?.goldLeftRightGeo ||
      new THREE.BoxGeometry(BORDER_T, PLATE_H, 0.012),
    goldMat,
  );
  goldLeft.position.set(-plateW / 2 + BORDER_T / 2, plateY, plateZ + 0.004);
  group.add(goldLeft);

  // Gold border — right
  const goldRight = new THREE.Mesh(
    geometries?.goldLeftRightGeo ||
      new THREE.BoxGeometry(BORDER_T, PLATE_H, 0.012),
    goldMat,
  );
  goldRight.position.set(plateW / 2 - BORDER_T / 2, plateY, plateZ + 0.004);
  group.add(goldRight);

  return group;
}

// Convenience: total height of the shelf assembly (base + body + veneer)
// Use this to offset other objects sitting on top of the shelf.
export const SHELF_TOTAL_HEIGHT = 0.08 + 0.12 + 0.012; // BASE_H + SHELF_H + veneer

// ─────────────────────────────────────────────────────────────────────────────
// buildProductBox — creates a 3D tray without a bottom, slanted backwards
// ─────────────────────────────────────────────────────────────────────────────
export interface ProductBoxOptions {
  width?: number; // default: 1.8
  depth?: number; // default: 0.9
  height?: number; // default: 0.22
  thickness?: number; // default: 0.06
  tiltAngle?: number; // in degrees, default: -16 (tilted backwards)
  woodMaterial?: THREE.Material; // custom wood material (optional)
}

export interface ProductBoxResult {
  group: THREE.Group;
  yOffset: number; // offset to align bottom-front edge to shelf top mat
}

export function buildProductBox({
  width = 1.8,
  depth = 0.4,
  height = 0.22,
  thickness = 0.06,
  tiltAngle = -10,
  woodMaterial,
}: ProductBoxOptions = {}): ProductBoxResult {
  const W = width;
  const D = depth;
  const H = height;
  const T = thickness;

  const alpha = (tiltAngle * Math.PI) / 180;
  const cos = Math.cos(alpha);
  const sin = Math.sin(alpha);

  // Height offset to keep the bottom-front edge of the tilted box exactly on the shelf surface
  const yOffset = (H / 2 - 0.25) * cos + (D / 2) * sin;

  const group = new THREE.Group();

  // Materials
  const boxRimMat = new THREE.MeshStandardMaterial({
    color: 0xd4b373, // warm satin gold/brass matching the shelf borders
    roughness: 0.1,
    metalness: 0.8,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0,
  });

  const boxInteriorMat = new THREE.MeshStandardMaterial({
    color: 0x000000, // ultra-dark black velvet interior lining
    roughness: 0.8, // very matte to absorb light and create depth
    metalness: 0.02,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 1.5,
  });

  // #080808ff

  const boxMaterial = woodMaterial;

  /*
   * ─────────────────────────────────────────────────────────────────────────────
   * EDITING TRAY BORDERS (GOLD vs. BOARD-LIKE):
   * By default, the front wall is commented out. To make the front border golden:
   * 1. Uncomment the frontWall mesh below.
   * 2. Notice it uses `boxRimMat` which has the golden/brass material properties (color #d4b373).
   * 3. If you want the side walls (leftWall, rightWall, topWall) to also be golden,
   *    change their materials from `boxInteriorMat` to `boxRimMat` below.
   * ─────────────────────────────────────────────────────────────────────────────
   */
  // // 1. FRONT GOLD WALL (THICK RIM)
  // const frontWall = new THREE.Mesh(
  //   new THREE.BoxGeometry(W, H, T),
  //   boxRimMat
  // );
  // frontWall.position.set(0, 0, D / 2 - T / 2);
  // frontWall.castShadow = true;
  // frontWall.receiveShadow = true;
  // group.add(frontWall);

  // 2. BACK GOLD WALL (THICK RIM)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), boxMaterial);
  backWall.position.set(0, 0, -D / 2 + T / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  group.add(backWall);

  // 3. LEFT GOLD WALL (THICK RIM)
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(T, H, D - 2 * T),
    boxMaterial,
  );
  leftWall.position.set(-W / 2 + T / 2, 0, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // 4. RIGHT GOLD WALL (THICK RIM)
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(T, H, D - 2 * T),
    boxMaterial,
  );
  rightWall.position.set(W / 2 - T / 2, 0, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // 5. TOP GOLD WALL (THICK RIM)
  const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(W, T, D - 2 * T),
    boxMaterial,
  );
  topWall.position.set(0, H / 2 - T / 2, 0);
  topWall.castShadow = true;
  topWall.receiveShadow = true;
  group.add(topWall);

  // // 5. BOTTOM LINING PANEL (creating the dark interior floor inside the rims)
  // const bottomPanel = new THREE.Mesh(
  //   new THREE.BoxGeometry(W - 2 * T, 0.02, D - 2 * T),
  //   boxInteriorMat,
  // );
  // bottomPanel.position.set(0, -H / 2 + 0.01, 0);
  // bottomPanel.castShadow = true;
  // bottomPanel.receiveShadow = true;
  // group.add(bottomPanel);

  // Apply tilt rotation
  // 6. THIN GOLD RIM HIGHLIGHTS (Overlaying the front edges of the velvet borders)
  const rimThickness = 0.025; // Thin elegant gold line
  const rimDepth = 0.004;

  // Top Rim
  const topRim = new THREE.Mesh(
    new THREE.BoxGeometry(W, rimThickness, rimDepth),
    boxRimMat,
  );
  topRim.position.set(0, H / 2 - rimThickness / 2, D / 2 - T + rimDepth / 2);
  topRim.castShadow = true;
  group.add(topRim);

  // Left Rim
  const leftRim = new THREE.Mesh(
    new THREE.BoxGeometry(rimThickness, H - rimThickness, rimDepth),
    boxRimMat,
  );
  leftRim.position.set(
    -W / 2 + rimThickness / 2,
    -rimThickness / 2,
    D / 2 - T + rimDepth / 2,
  );
  leftRim.castShadow = true;
  group.add(leftRim);

  // Right Rim
  const rightRim = new THREE.Mesh(
    new THREE.BoxGeometry(rimThickness, H - rimThickness, rimDepth),
    boxRimMat,
  );
  rightRim.position.set(
    W / 2 - rimThickness / 2,
    -rimThickness / 2,
    D / 2 - T + rimDepth / 2,
  );
  rightRim.castShadow = true;
  group.add(rightRim);

  group.rotation.x = alpha;

  return { group, yOffset };
}
