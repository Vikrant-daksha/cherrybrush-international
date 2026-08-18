"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import {
  buildShelfGroup,
  buildProductBox,
  SHELF_H,
  BASE_H,
  ShelfMaterials,
} from "../utils/shelfBuilder";
import { textureManager } from "../utils/textureManager";
import styles from "./Wardrobe3D.module.css";

export interface ProductItem {
  name: string;
  price: string;
}

const PRODUCTS: ProductItem[] = [
  { name: "Velvet Oud", price: "$180" },
  { name: "Gold Leather", price: "$240" },
  { name: "Silk Jasmine", price: "$160" },
  { name: "Sandalwood Rose", price: "$195" },
  { name: "Amber Iris", price: "$210" },
  { name: "Noir Neroli", price: "$175" },
  { name: "Royal Patchouli", price: "$225" },
  { name: "Ivory Musk", price: "$150" },
];

export interface Wardrobe3DProps {
  onProductClick?: (product: ProductItem) => void;
  onQuizClick?: () => void;
}

export default function Wardrobe3D({
  onProductClick,
  onQuizClick,
}: Wardrobe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    price: string;
    type?: string;
  } | null>(null);

  // Pre-load the Montserrat font for 2D Canvas rendering
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.fonts
        .load("bold 36px Montserrat")
        .then(() => setFontLoaded(true))
        .catch(() => setFontLoaded(true));
    } else {
      setFontLoaded(true);
    }
  }, []);

  // Lock body scroll while full-page loader is active
  useEffect(() => {
    if (!isLoaded && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isLoaded]);

  const handleCloseToast = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  useEffect(() => {
    if (!fontLoaded) return;
    const container = mountRef.current;
    if (!container) return;

    // ── Grid Dimensions ──────────────────────────────────────────────────────
    interface ProductSizeConfig {
      width?: number;
      height?: number;
      depth?: number;
      tiltAngle?: number;
      productScale?: number;
    }

    interface ColumnConfig {
      width: number;
      rowHeights: number[];
      customProductSizes?: {
        [rowIndex: number]: ProductSizeConfig;
      };
    }

    const customSizeForMiddleRows = {
      width: 2,
      height: 1.6,
      depth: 0.3,
      tiltAngle: -12,
      productScale: 1,
    };

    const customSizeForLastRows = {
      width: 2.8,
      height: 2.0,
      depth: 0.3,
      tiltAngle: -12,
      productScale: 1.4,
    };

    const columnsConfig: ColumnConfig[] = [
      { width: 2.5, rowHeights: [4, 4], customProductSizes: [] },
      {
        width: 3.2,
        rowHeights: [2.6, 2.6, 2.6],
        customProductSizes: [
          customSizeForMiddleRows,
          customSizeForMiddleRows,
          customSizeForMiddleRows,
        ],
      },
      {
        width: 3.2,
        rowHeights: [2.6, 2.6, 2.6],
        customProductSizes: [
          customSizeForMiddleRows,
          customSizeForMiddleRows,
          customSizeForMiddleRows,
        ],
      },
      {
        width: 4.5,
        rowHeights: [0.8, 3.6, 3.6],
        customProductSizes: [{}, customSizeForLastRows, customSizeForLastRows],
      },
    ];

    const T = 0.18; // Divider thickness
    const D = 1.2; // Depth
    const cols = columnsConfig.length;

    const TOTAL_W =
      columnsConfig.reduce((sum, col) => sum + col.width, 0) + (cols + 1) * T;

    const columnHeights = columnsConfig.map(
      (col) =>
        col.rowHeights.reduce((sum, h) => sum + h, 0) +
        (col.rowHeights.length + 1) * T,
    );
    const TOTAL_H = Math.max(...columnHeights);

    // Pre-calculate column center coordinates
    const colCenters: number[] = [];
    {
      let currentX = -TOTAL_W / 2 + T;
      for (let c = 0; c < cols; c++) {
        colCenters.push(currentX + columnsConfig[c].width / 2);
        currentX += columnsConfig[c].width + T;
      }
    }

    // ── Scene Setup ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera Setup ─────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, -0.7, 16.2);
    camera.lookAt(0, -0.7, 0);

    // ── WebGL Renderer Setup ─────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Cap pixel ratio at 1.75 for ideal retina sharpness without GPU overhead
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Static shadow map optimization: render shadows only when needed
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // ── Loading Manager ───────────────────────────────────────────────────────
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const percentage = Math.min(
        Math.round((itemsLoaded / itemsTotal) * 100),
        99,
      );
      setProgress(percentage);
    };

    manager.onLoad = () => {
      renderer.shadowMap.needsUpdate = true;
      setProgress(100);
      setTimeout(() => {
        setIsSlidingOut(true);
        setTimeout(() => {
          setIsLoaded(true);
        }, 900);
      }, 350);
    };

    // ── Shared Texture Loader via TextureManager ───────────────────────────────
    const woodTextureFolder = "Plaster001_2K-JPG";

    // 1. Shared product & kit textures
    const productTex = textureManager.loadTexture("/product.webp", manager, {
      colorSpace: THREE.SRGBColorSpace,
    });
    const kitTex = textureManager.loadTexture("/complete_kit.webp", manager, {
      colorSpace: THREE.SRGBColorSpace,
    });

    // 2. Shared Wood PBR Textures (Optimized 1K WebP - Single network request per map)
    const colorTexHoriz = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_Color.webp`,
      manager,
      {
        colorSpace: THREE.SRGBColorSpace,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 2.5,
        repeatY: 1.0,
      },
    );
    const normalTexHoriz = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.webp`,
      manager,
      {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 2.5,
        repeatY: 1.0,
      },
    );
    const roughTexHoriz = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_Roughness.webp`,
      manager,
      {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 2.5,
        repeatY: 1.0,
      },
    );

    const colorTexVert = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_Color.webp`,
      manager,
      {
        colorSpace: THREE.SRGBColorSpace,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 1.0,
        repeatY: 2.5,
      },
    );
    const normalTexVert = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.webp`,
      manager,
      {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 1.0,
        repeatY: 2.5,
      },
    );
    const roughTexVert = textureManager.loadTexture(
      `/${woodTextureFolder}/${woodTextureFolder}_Roughness.webp`,
      manager,
      {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeatX: 1.0,
        repeatY: 2.5,
      },
    );

    // ── Shared Materials ─────────────────────────────────────────────────────
    const woodMatHoriz = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: colorTexHoriz,
      normalMap: normalTexHoriz,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: roughTexHoriz,
      roughness: 0.3,
      metalness: 0.1,
      emissiveMap: colorTexHoriz,
      emissive: 0xefe8d6,
      emissiveIntensity: 0.1,
    });

    const woodMatVert = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: colorTexVert,
      normalMap: normalTexVert,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: roughTexVert,
      roughness: 0.3,
      metalness: 0.1,
      emissiveMap: colorTexVert,
      emissive: 0xffffff,
      emissiveIntensity: 0.1,
    });

    const ledMat = new THREE.MeshBasicMaterial({ color: 0xf6ecdc });

    const goldCapMat = new THREE.MeshStandardMaterial({
      color: 0xc8973a,
      roughness: 0.15,
      metalness: 0.95,
      emissive: new THREE.Color(0x7a5010),
      emissiveIntensity: 0.4,
    });

    const defaultShelfTopMat = woodMatHoriz.clone();
    defaultShelfTopMat.roughness = 0.12;

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xfff4e3,
      roughness: 0.3,
      metalness: 0.05,
      emissive: new THREE.Color(0xfff4e3),
      emissiveIntensity: 0.5,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4b373,
      roughness: 0.35,
      metalness: 0.3,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

    const sharedShelfMaterials: ShelfMaterials = {
      shelfTopMat: defaultShelfTopMat,
      shelfBodyMat: woodMatHoriz,
      plateMat,
      goldMat,
    };

    const buildDrawerGroup = (
      width: number,
      height: number,
      depth: number,
      woodMaterial: THREE.Material,
      goldMaterial: THREE.Material,
      hasHandle: boolean = true,
      zOffset: number = 0,
    ) => {
      const group = new THREE.Group();

      if (hasHandle) {
        const drawerFaceW = width - 0.04;
        const drawerFaceH = height - 0.04;
        const drawerFaceGeo = new THREE.BoxGeometry(
          drawerFaceW,
          drawerFaceH,
          0.06,
        );
        const drawerFaceMesh = new THREE.Mesh(drawerFaceGeo, woodMaterial);
        drawerFaceMesh.position.set(0, 0, depth / 2 - 0.02 + zOffset);
        drawerFaceMesh.castShadow = true;
        drawerFaceMesh.receiveShadow = true;
        group.add(drawerFaceMesh);

        const handleW = Math.min(width * 0.4, 0.8);
        const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, handleW, 16);
        const handleMesh = new THREE.Mesh(handleGeo, goldMaterial);
        handleMesh.rotation.z = Math.PI / 2;
        handleMesh.position.set(0, 0, depth / 2 + 0.03 + zOffset);
        handleMesh.castShadow = true;
        group.add(handleMesh);

        const pegGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 16);
        const peg1 = new THREE.Mesh(pegGeo, goldMaterial);
        peg1.rotation.x = Math.PI / 2;
        peg1.position.set(-handleW / 2 + 0.05, 0, depth / 2 + 0.015 + zOffset);
        peg1.castShadow = true;
        group.add(peg1);

        const peg2 = peg1.clone();
        peg2.position.x = handleW / 2 - 0.05;
        group.add(peg2);
      } else {
        const drawerFaceW = width;
        const drawerFaceH = height;
        const drawerFaceGeo = new THREE.BoxGeometry(
          drawerFaceW,
          drawerFaceH,
          0.06,
        );
        const drawerFaceMesh = new THREE.Mesh(drawerFaceGeo, woodMaterial);
        drawerFaceMesh.position.set(0, 0, depth / 2 + 0.01 + zOffset);
        drawerFaceMesh.castShadow = true;
        drawerFaceMesh.receiveShadow = true;
        group.add(drawerFaceMesh);
      }

      return group;
    };

    // Shared Product Plane Geometry & Material
    const productGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const productMat = new THREE.MeshBasicMaterial({
      map: productTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      alphaTest: 0.05,
    });

    // ── Interactivity & Click Setup ──────────────────────────────────────────
    const interactiveObjects: THREE.Object3D[] = [];
    const hoveredObjects = new Set<THREE.Object3D>();

    // ── Build Wardrobe Structure ─────────────────────────────────────────────
    const wardrobeGroup = new THREE.Group();

    const addFramePart = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      isVertical: boolean,
    ) => {
      const mat = isVertical ? woodMatVert : woodMatHoriz;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      wardrobeGroup.add(mesh);
    };

    const PANEL_H = 1.2;

    // 1. Outer Frame (Boundary Walls)
    addFramePart(TOTAL_W, T, D, 0, TOTAL_H / 2 - T / 2, 0.04, false);
    addFramePart(TOTAL_W, T, D, 0, -TOTAL_H / 2 + T / 2, 0.04, false);
    addFramePart(
      T,
      TOTAL_H - T + PANEL_H,
      D,
      -TOTAL_W / 2 + T / 2,
      -(T + PANEL_H) / 2,
      0.04,
      true,
    );
    addFramePart(
      T,
      TOTAL_H - T + PANEL_H,
      D,
      TOTAL_W / 2 - T / 2,
      -(T + PANEL_H) / 2,
      0.04,
      true,
    );

    // ── Brand Values Bottom Panel ───────────────────────────────────────────
    const panelTex = textureManager.getBottomPanelTexture();
    const bottomPanel = new THREE.Mesh(
      new THREE.BoxGeometry(TOTAL_W - 2 * T, PANEL_H, D),
      woodMatHoriz,
    );
    bottomPanel.position.set(0, -TOTAL_H / 2 - PANEL_H / 2, 0);
    bottomPanel.receiveShadow = true;
    bottomPanel.castShadow = true;
    wardrobeGroup.add(bottomPanel);

    const overlayGeo = new THREE.PlaneGeometry(TOTAL_W - 2 * T, PANEL_H);
    const overlayMat = new THREE.MeshStandardMaterial({
      map: panelTex,
      transparent: true,
      roughness: 0.18,
      metalness: 0.05,
      depthWrite: false,
    });
    const textOverlay = new THREE.Mesh(overlayGeo, overlayMat);
    textOverlay.position.set(0, -TOTAL_H / 2 - PANEL_H / 2, D / 2 + 0.002);
    textOverlay.receiveShadow = true;
    textOverlay.castShadow = true;
    wardrobeGroup.add(textOverlay);

    // 2. Inner Vertical Dividers
    let currentXForDividers = -TOTAL_W / 2 + T;
    for (let c = 0; c < cols - 1; c++) {
      currentXForDividers += columnsConfig[c].width;
      addFramePart(
        T,
        TOTAL_H - 2 * T,
        D,
        currentXForDividers + T / 2,
        0,
        0.03,
        true,
      );
      currentXForDividers += T;
    }

    // 3. Inner Horizontal Dividers
    for (let c = 0; c < cols; c++) {
      const colX = colCenters[c];
      const compW = columnsConfig[c].width;
      const rowHeightsForCol = columnsConfig[c].rowHeights;
      let currentYForDividers = -TOTAL_H / 2 + T;
      for (let r = 0; r < rowHeightsForCol.length - 1; r++) {
        currentYForDividers += rowHeightsForCol[r];
        addFramePart(compW, T, D, colX, currentYForDividers + T / 2, 0, false);
        currentYForDividers += T;
      }
    }

    // 4. Back Board Panel
    const backMesh = new THREE.Mesh(
      new THREE.BoxGeometry(TOTAL_W - 2 * T, TOTAL_H - 2 * T, 0.08),
      woodMatVert,
    );
    backMesh.position.set(0, 0, -D / 2 + 0.04);
    backMesh.receiveShadow = true;
    wardrobeGroup.add(backMesh);

    // ── Build Compartments (LED Glows, Dynamic Shelves, Local Lighting) ─────
    RectAreaLightUniformsLib.init();

    const glowTex = textureManager.getGlowTexture();
    const baseGlowW = 2.2;
    const glowGeo = new THREE.PlaneGeometry(baseGlowW, 0.2);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const totalCompartments = columnsConfig.reduce(
      (sum, col) => sum + col.rowHeights.length,
      0,
    );
    const instancedGlows = new THREE.InstancedMesh(
      glowGeo,
      glowMat,
      totalCompartments,
    );
    const dummy = new THREE.Object3D();

    // Cache Map for Product Label Materials to prevent redundant allocations
    const productLabelMaterials = new Map<string, THREE.MeshStandardMaterial>();

    let compartmentIndex = 0;
    for (let c = 0; c < cols; c++) {
      const colX = colCenters[c];
      const compW = columnsConfig[c].width;
      const rowHeightsForCol = columnsConfig[c].rowHeights;
      const colHeight =
        rowHeightsForCol.reduce((sum, h) => sum + h, 0) +
        (rowHeightsForCol.length + 1) * T;
      const heightDiff = TOTAL_H - colHeight;

      let currentY = -TOTAL_H / 2 + T;
      for (let r = 0; r < rowHeightsForCol.length; r++) {
        const isTopRow = r === rowHeightsForCol.length - 1;
        const compH = rowHeightsForCol[r] + (isTopRow ? heightDiff : 0);
        const rowY = currentY + compH / 2;
        currentY += compH + T;

        const isNormalDrawer = c === cols - 1 && r === 0;
        const compGroup = new THREE.Group();
        compGroup.position.set(colX, rowY, 0);

        if (isNormalDrawer) {
          const drawerGroup = buildDrawerGroup(
            compW,
            compH,
            D,
            woodMatHoriz,
            goldMat,
            true,
            0,
          );
          compGroup.add(drawerGroup);

          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          instancedGlows.setMatrixAt(compartmentIndex, dummy.matrix);
        } else if (c === 0) {
          // ── Column 0: Brand Showcase & Interactive Quiz ────────────────────
          const drawerZOffset = -0.15;
          const drawerZFront = D / 2 + 0.04 + drawerZOffset;

          const drawerGroup = buildDrawerGroup(
            compW,
            compH,
            D,
            woodMatHoriz,
            goldMat,
            false,
            drawerZOffset,
          );
          compGroup.add(drawerGroup);

          // LED Strip light bar
          const LED_W = compW - 0.6;
          const LED_Y = (compH / 2) * 0.95;
          const LED_Z = D * 0.13;

          const ledBar = new THREE.Mesh(
            new THREE.BoxGeometry(LED_W, 0.04, 0.1),
            ledMat,
          );
          ledBar.position.set(0, LED_Y, LED_Z);
          compGroup.add(ledBar);

          const CAP_W = 0.07;
          const CAP_H = 0.1;
          const CAP_D = 0.14;

          const leftCap = new THREE.Mesh(
            new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
            goldCapMat,
          );
          leftCap.position.set(-(LED_W / 2) - CAP_W / 2, LED_Y, LED_Z);
          compGroup.add(leftCap);

          const rightCap = new THREE.Mesh(
            new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
            goldCapMat,
          );
          rightCap.position.set(LED_W / 2 + CAP_W / 2, LED_Y, LED_Z);
          compGroup.add(rightCap);

          dummy.position.set(colX, rowY + LED_Y, LED_Z + 0.06);
          dummy.scale.set((compW - 0.6) / baseGlowW, 1, 1);
          dummy.updateMatrix();
          instancedGlows.setMatrixAt(compartmentIndex, dummy.matrix);

          if (r === 1) {
            // ── Row 1 (Top): Find Your Perfect Set (Take A Quiz) ────────────
            const labelTex = textureManager.getQuizLabelTexture();
            const labelMat = new THREE.MeshStandardMaterial({
              map: labelTex,
              transparent: true,
              roughness: 0.2,
              metalness: 0.05,
              depthWrite: false,
            });
            const labelPlane = new THREE.Mesh(
              new THREE.PlaneGeometry(compW, compH),
              labelMat,
            );
            labelPlane.position.set(0, 0, drawerZFront + 0.15);
            labelPlane.userData = {
              type: "quiz",
              name: "Find Your Perfect Set",
              price: "Take the Quiz",
            };
            compGroup.add(labelPlane);
            interactiveObjects.push(labelPlane);
          } else {
            // ── Row 0 (Bottom): The Complete Kit ────────────────────────────
            const labelTex = textureManager.getKitLabelTexture();
            const labelMat = new THREE.MeshStandardMaterial({
              map: labelTex,
              transparent: true,
              roughness: 0.2,
              metalness: 0.05,
              depthWrite: false,
            });
            const labelPlane = new THREE.Mesh(
              new THREE.PlaneGeometry(compW, compH),
              labelMat,
            );
            labelPlane.position.set(0, 0, drawerZFront + 0.15);
            labelPlane.userData = {
              type: "kit",
              name: "The Complete Kit",
              price: "₹599",
            };
            compGroup.add(labelPlane);
            interactiveObjects.push(labelPlane);

            // Shelf for Complete Kit Box
            const shelfDepth = Math.max(0.1, D / 2 - drawerZFront);
            const shelfGeo = new THREE.BoxGeometry(compW, 0.08, shelfDepth);
            const shelfMesh = new THREE.Mesh(shelfGeo, woodMatHoriz);
            const shelfY = -compH / 2 + 0.8;
            shelfMesh.position.set(0, shelfY, drawerZFront + shelfDepth / 2);
            shelfMesh.receiveShadow = true;
            shelfMesh.castShadow = true;
            compGroup.add(shelfMesh);

            // Tilted complete kit box
            const kitBoxW = compW - 0.4;
            const kitBoxH = 1.4;
            const kitBoxD = 0.08;
            const kitFrontMat = new THREE.MeshStandardMaterial({
              map: kitTex,
              roughness: 0.25,
              metalness: 0.05,
            });
            const kitSideMat = new THREE.MeshStandardMaterial({
              color: 0xf3ede4,
              roughness: 0.4,
              metalness: 0.0,
            });
            const kitMaterials = [
              kitSideMat,
              kitSideMat,
              kitSideMat,
              kitSideMat,
              kitFrontMat,
              kitSideMat,
            ];
            const kitBoxGeo = new THREE.BoxGeometry(kitBoxW, kitBoxH, kitBoxD);
            const kitBoxMesh = new THREE.Mesh(kitBoxGeo, kitMaterials);

            const tiltAngle = -0.1;
            kitBoxMesh.rotation.x = tiltAngle;
            kitBoxMesh.position.set(
              0,
              shelfY +
                0.12 +
                (kitBoxH / 2) * Math.cos(Math.abs(tiltAngle)) -
                0.05,
              drawerZFront + shelfDepth - 0.03,
            );
            kitBoxMesh.castShadow = true;
            kitBoxMesh.receiveShadow = true;
            kitBoxMesh.userData = {
              type: "kit",
              name: "The Complete Kit",
              price: "₹599",
            };
            compGroup.add(kitBoxMesh);
            interactiveObjects.push(kitBoxMesh);

            const subDrawerGroup = buildDrawerGroup(
              kitBoxW + 0.6,
              kitBoxH - 0.6,
              kitBoxD,
              woodMatHoriz,
              goldMat,
              false,
              drawerZOffset,
            );
            subDrawerGroup.position.set(-0.1, -1.6, 0.67);
            compGroup.add(subDrawerGroup);
          }
        } else {
          // ── Columns 1-3: Standard Product Shelves ─────────────────────────
          const LED_W = compW - 0.6;
          const LED_Y = (compH / 2) * 0.95;
          const LED_Z = D * 0.13;

          const ledBar = new THREE.Mesh(
            new THREE.BoxGeometry(LED_W, 0.04, 0.1),
            ledMat,
          );
          ledBar.position.set(0, LED_Y, LED_Z);
          compGroup.add(ledBar);

          const CAP_W = 0.07;
          const CAP_H = 0.1;
          const CAP_D = 0.14;

          const leftCap = new THREE.Mesh(
            new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
            goldCapMat,
          );
          leftCap.position.set(-(LED_W / 2) - CAP_W / 2, LED_Y, LED_Z);
          compGroup.add(leftCap);

          const rightCap = new THREE.Mesh(
            new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
            goldCapMat,
          );
          rightCap.position.set(LED_W / 2 + CAP_W / 2, LED_Y, LED_Z);
          compGroup.add(rightCap);

          dummy.position.set(colX, rowY + LED_Y, LED_Z + 0.06);
          dummy.scale.set((compW - 0.6) / baseGlowW, 1, 1);
          dummy.updateMatrix();
          instancedGlows.setMatrixAt(compartmentIndex, dummy.matrix);

          const productIndex = compartmentIndex % PRODUCTS.length;
          const product = PRODUCTS[productIndex];
          const productKey = `${product.name}_${product.price}`;

          // Reusable product label material from cache
          let uniqueRecessMat = productLabelMaterials.get(productKey);
          if (!uniqueRecessMat) {
            const recessTex = textureManager.getProductLabelTexture(
              product.name,
              product.price,
            );
            uniqueRecessMat = new THREE.MeshStandardMaterial({
              map: recessTex,
              color: 0xfff7f2,
              roughness: 0.3,
              metalness: 0.05,
              emissiveMap: recessTex,
              emissive: new THREE.Color(0x000000),
              emissiveIntensity: 0.8,
            });
            productLabelMaterials.set(productKey, uniqueRecessMat);
          }

          const shelfMaterials = {
            ...sharedShelfMaterials,
            plateMat: uniqueRecessMat,
          };

          const shelfGroup = buildShelfGroup({
            width: compW,
            depth: D,
            woodMaterial: woodMatHoriz,
            materials: shelfMaterials,
          });
          const SHELF_INSET_Z = -0.06;
          shelfGroup.position.set(0, -compH / 2, SHELF_INSET_Z);

          const customSize = columnsConfig[c].customProductSizes?.[r];
          const boxWidth = customSize?.width ?? Math.max(compW - 0.9, 1.0);
          const boxHeight = customSize?.height ?? 1.0;
          const boxDepth = customSize?.depth ?? 0.4;
          const boxTilt = customSize?.tiltAngle ?? -14;

          const boxResult = buildProductBox({
            width: boxWidth,
            depth: boxDepth,
            height: boxHeight,
            thickness: 0.04,
            tiltAngle: boxTilt,
            woodMaterial: woodMatHoriz,
          });
          const shelfTopY = BASE_H + SHELF_H + 0.2;
          boxResult.group.position.set(0, shelfTopY + boxResult.yOffset, 0);

          const productMesh = new THREE.Mesh(productGeo, productMat);
          productMesh.position.set(0, 0, 0.08);

          const baseScale = customSize?.productScale ?? boxHeight / 1.5;
          productMesh.scale.setScalar(baseScale);

          boxResult.group.add(productMesh);

          // Attach interactive user metadata to box and product
          boxResult.group.userData = {
            type: "product",
            name: product.name,
            price: product.price,
            productIndex,
          };
          productMesh.userData = boxResult.group.userData;

          shelfGroup.add(boxResult.group);
          compGroup.add(shelfGroup);

          // Register for Raycasting clicks
          interactiveObjects.push(productMesh);
          interactiveObjects.push(shelfGroup);

          // Warm local RectAreaLights (Optimized count & intensity)
          const rectLight = new THREE.RectAreaLight(
            0xffdaa6,
            3.2,
            compW - 0.2,
            compH * 0.45,
          );
          rectLight.position.set(0, compH / 2 - 0.15, D * 0.13);
          rectLight.lookAt(0, -compH * 0.8, -D / 2);
          compGroup.add(rectLight);

          // If last column, render custom status plate
          if (c === cols - 1) {
            const plateTitle = r - 1 ? "BEST SELLER" : "TRENDING NOW";
            const customPlateTex =
              textureManager.getPlateLabelTexture(plateTitle);

            const customPlateMat = new THREE.MeshStandardMaterial({
              map: customPlateTex,
              color: 0xffffff,
              roughness: 0.8,
              metalness: 0.5,
              emissiveMap: customPlateTex,
              emissiveIntensity: 1.8,
            });

            const customPlateGroup = new THREE.Group();
            const plateW = 2.4;
            const plateH = 0.6;
            const borderT = 0.012;

            const plateBackMesh = new THREE.Mesh(
              new THREE.BoxGeometry(plateW, plateH, 0.008),
              customPlateMat,
            );
            customPlateGroup.add(plateBackMesh);

            const goldBorderMat = new THREE.MeshStandardMaterial({
              color: 0xd4b373,
              roughness: 0.35,
              metalness: 0.8,
            });

            const borderTop = new THREE.Mesh(
              new THREE.BoxGeometry(plateW, borderT, 0.012),
              goldBorderMat,
            );
            borderTop.position.set(0, plateH / 2 - borderT / 2, 0.004);
            customPlateGroup.add(borderTop);

            const borderBottom = new THREE.Mesh(
              new THREE.BoxGeometry(plateW, borderT, 0.012),
              goldBorderMat,
            );
            borderBottom.position.set(0, -plateH / 2 + borderT / 2, 0.004);
            customPlateGroup.add(borderBottom);

            const borderLeft = new THREE.Mesh(
              new THREE.BoxGeometry(borderT, plateH, 0.012),
              goldBorderMat,
            );
            borderLeft.position.set(-plateW / 2 + borderT / 2, 0, 0.004);
            customPlateGroup.add(borderLeft);

            const borderRight = new THREE.Mesh(
              new THREE.BoxGeometry(borderT, plateH, 0.012),
              goldBorderMat,
            );
            borderRight.position.set(plateW / 2 - borderT / 2, 0, 0.004);
            customPlateGroup.add(borderRight);

            const posX = 0;
            const posY = -compH / 2 + shelfTopY + boxHeight + plateH / 2 - 0.1;
            const posZ = -D / 2 + 0.082;
            customPlateGroup.position.set(posX, posY, posZ);

            compGroup.add(customPlateGroup);
          }
        }

        wardrobeGroup.add(compGroup);
        compartmentIndex++;
      }
    }

    wardrobeGroup.add(instancedGlows);
    scene.add(wardrobeGroup);

    // ── Global Optimized Lights & Shadows ────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0e0806, 1.8));

    // Primary Shadow Casting Directional Light
    const globalLight = new THREE.DirectionalLight(0xefe8d6, 2.4);
    globalLight.position.set(0, 1.4, 3);
    globalLight.castShadow = true;
    globalLight.shadow.mapSize.set(2048, 2048);
    globalLight.shadow.camera.near = 0.5;
    globalLight.shadow.camera.far = 30;
    const dVal = 10;
    globalLight.shadow.camera.left = -dVal;
    globalLight.shadow.camera.right = dVal;
    globalLight.shadow.camera.top = dVal;
    globalLight.shadow.camera.bottom = -dVal;
    globalLight.shadow.bias = -0.0003;
    scene.add(globalLight);

    // // Secondary Fill Light (castShadow disabled to save 50% shadow render time)
    // const globalLightLeft = new THREE.DirectionalLight(0xffead9, 2.0);
    // globalLightLeft.position.set(-5, 0, 3);
    // globalLightLeft.castShadow = false;
    // scene.add(globalLightLeft);

    // ── Raycasting & Mouse Interaction ───────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    let isMouseInside = false;
    let activeHoveredMesh: THREE.Object3D | null = null;

    const onPointerMove = (e: MouseEvent) => {
      if (!container) return;
      isMouseInside = true;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.type && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj?.userData?.type) {
          const { type, name, price } = hitObj.userData;
          setSelectedProduct({ name, price, type });

          if (type === "product" && onProductClick) {
            onProductClick({ name, price });
          } else if (type === "quiz" && onQuizClick) {
            onQuizClick();
          }
        }
      }
    };

    const onPointerLeave = () => {
      isMouseInside = false;
      if (container) container.style.cursor = "default";
      activeHoveredMesh = null;
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("click", onPointerDown);
    container.addEventListener("mouseleave", onPointerLeave);

    // ── Resize & Render Loop ──────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.needsUpdate = true;
    };
    window.addEventListener("resize", handleResize);

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip render calculations when scrolled out of view to save battery and GPU
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Evaluate raycaster smoothly once per frame when pointer is inside container
      if (isMouseInside) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
          let hitObj: THREE.Object3D | null = intersects[0].object;
          while (hitObj && !hitObj.userData?.type && hitObj.parent) {
            hitObj = hitObj.parent;
          }

          if (hitObj?.userData?.type) {
            container.style.cursor = "pointer";
            activeHoveredMesh = hitObj;
          } else {
            container.style.cursor = "default";
            activeHoveredMesh = null;
          }
        } else {
          container.style.cursor = "default";
          activeHoveredMesh = null;
        }
      }

      // Subtle breathing float animation for hovered item
      if (activeHoveredMesh) {
        const floatDelta = Math.sin(elapsedTime * 4) * 0.003;
        activeHoveredMesh.position.y +=
          (floatDelta - activeHoveredMesh.position.y * 0.05) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("click", onPointerDown);
      container.removeEventListener("mouseleave", onPointerLeave);

      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Cleanup all meshes & geometries inside wardrobeGroup
      wardrobeGroup.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });

      productGeo.dispose();
      productMat.dispose();
      Object.values(sharedShelfMaterials).forEach((m) => m?.dispose());
      productLabelMaterials.forEach((m) => m.dispose());
      glowGeo.dispose();
      glowMat.dispose();
      overlayGeo.dispose();
      overlayMat.dispose();
      textureManager.dispose();
    };
  }, [fontLoaded, onProductClick, onQuizClick]);

  return (
    <div ref={mountRef} className={styles.sceneContainer}>
      {/* ── Screen Loader with 100% Slide-out Transition ── */}
      {!isLoaded && (
        <div
          className={`${styles.screenLoader} ${
            isSlidingOut ? styles.slidingOut : ""
          }`}
        >
          <div className={styles.loaderContent}>
            <p className={styles.loaderSubtitle}>The Atelier Experience</p>
            <h2 className={styles.loaderBrand}>CHERRYBRUSH</h2>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressText}>{progress}%</p>
          </div>
        </div>
      )}

      {/* Interactive Product Selection Toast Notification */}
      {selectedProduct && (
        <div className={styles.productToast}>
          <div className={styles.toastText}>
            <span className={styles.toastSub}>
              {selectedProduct.type === "quiz"
                ? "Custom Experience"
                : "Added to Selection"}
            </span>
            <span className={styles.toastTitle}>
              {selectedProduct.name} • {selectedProduct.price}
            </span>
          </div>
          <button
            className={styles.toastBtn}
            onClick={() => {
              if (selectedProduct.type === "quiz") {
                onQuizClick?.();
              } else {
                onProductClick?.({
                  name: selectedProduct.name,
                  price: selectedProduct.price,
                });
              }
              handleCloseToast();
            }}
          >
            {selectedProduct.type === "quiz" ? "Start Quiz" : "View Set"}
          </button>
          <button
            className={styles.toastClose}
            onClick={handleCloseToast}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
