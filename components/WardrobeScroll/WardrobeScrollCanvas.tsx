"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildShelfGroup,
  buildProductBox,
  SHELF_H,
  BASE_H,
  PLATE_H,
  PLATE_INSET,
  BORDER_T,
  RECESS_INSET,
  ShelfGeometries,
  ShelfMaterials,
} from "../utils/shelfBuilder";
import styles from "./WardrobeScroll.module.css";

interface Product {
  name: string;
  price: string;
  image?: string;
}

interface WardrobeScrollCanvasProps {
  products: Product[];
  title?: string;
  headerText?: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  { name: "Oud Wood", price: "$210", image: "/product.webp" },
  { name: "Tuscan Leather", price: "$250", image: "/product.webp" },
  { name: "Tobacco Vanille", price: "$235", image: "/product.webp" },
  { name: "Lost Cherry", price: "$280", image: "/product.webp" },
  { name: "Soleil Blanc", price: "$195", image: "/product.webp" },
  { name: "Neroli Portofino", price: "$180", image: "/product.webp" },
  { name: "Rose Prick", price: "$260", image: "/product.webp" },
  { name: "Bitter Peach", price: "$275", image: "/product.webp" },
  { name: "White Suede", price: "$200", image: "/product.webp" },
  { name: "Fucking Fabulous", price: "$310", image: "/product.webp" },
];

export default function WardrobeScrollCanvas({
  products = DEFAULT_PRODUCTS,
  title,
  headerText = "BEST SELLER",
}: WardrobeScrollCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);

  const targetCameraX = useRef(0);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.fonts
        .load("bold 36px Montserrat")
        .then(() => {
          setFontLoaded(true);
        })
        .catch(() => {
          setFontLoaded(true);
        });
    } else {
      setFontLoaded(true);
    }
  }, []);

  const W = 2.8;
  const T = 0.18;
  const compartmentSpacing = W + T;

  useEffect(() => {
    // Midpoint of 4 visible compartments is exactly in the middle of compartment index + 1.5
    targetCameraX.current = (activeScrollIndex + 1.5) * compartmentSpacing;
  }, [activeScrollIndex, compartmentSpacing]);

  useEffect(() => {
    if (!fontLoaded) return;
    const container = mountRef.current;
    if (!container) return;

    const H = 2.85;
    const D = 1;
    const cols = 8;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(compartmentSpacing * 1.5, 0.4, 8);
    camera.lookAt(compartmentSpacing * 1.5, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setLoading(false);
    };

    const woodTextureFolder = "Plaster001_2K-JPG";
    const textureLoader = new THREE.TextureLoader(manager);

    const dynamicMaterials: THREE.Material[] = [];
    const dynamicTextures: THREE.Texture[] = [];

    const colorTexHoriz = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_Color.webp`,
    );
    const normalTexHoriz = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.webp`,
    );
    const roughTexHoriz = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_Roughness.webp`,
    );

    const colorTexVert = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_Color.webp`,
    );
    const normalTexVert = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.webp`,
    );
    const roughTexVert = textureLoader.load(
      `/${woodTextureFolder}/${woodTextureFolder}_Roughness.webp`,
    );

    colorTexHoriz.colorSpace = THREE.SRGBColorSpace;
    colorTexVert.colorSpace = THREE.SRGBColorSpace;

    [colorTexHoriz, normalTexHoriz, roughTexHoriz].forEach((t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2.5, 1.0);
    });

    [colorTexVert, normalTexVert, roughTexVert].forEach((t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.0, 2.5);
    });

    const woodMatHoriz = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: colorTexHoriz,
      normalMap: normalTexHoriz,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: roughTexHoriz,
      roughness: 0.3,
      metalness: 0.1,
      emissiveMap: colorTexHoriz,
      emissive: 0xffffff,
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

    const goldCapMat = new THREE.MeshStandardMaterial({
      color: 0xc8973a,
      roughness: 0.15,
      metalness: 0.95,
      emissive: new THREE.Color(0x7a5010),
      emissiveIntensity: 0.4,
    });

    const plateW = W - PLATE_INSET * 2;
    const recessW = plateW - BORDER_T * 2 - RECESS_INSET * 2;
    const recessH = PLATE_H - BORDER_T * 2 - RECESS_INSET * 2;
    const shadowWidth = 0.08;

    const sharedShelfGeometries: ShelfGeometries = {
      baseBoardGeo: new THREE.BoxGeometry(W, BASE_H, D),
      shelfBodyGeo: new THREE.BoxGeometry(W, SHELF_H, D),
      shelfTopGeo: new THREE.BoxGeometry(W, 0.012, D),
      plateBackGeo: new THREE.BoxGeometry(plateW, PLATE_H, 0.008),
      goldTopBottomGeo: new THREE.BoxGeometry(plateW, BORDER_T, 0.012),
      goldLeftRightGeo: new THREE.BoxGeometry(BORDER_T, PLATE_H, 0.012),
      recessGeo: new THREE.BoxGeometry(recessW, recessH, 0.003),
      bottomShadowGeo: new THREE.PlaneGeometry(recessW + 0.9, shadowWidth),
    };

    const defaultShelfTopMat = woodMatHoriz.clone();
    defaultShelfTopMat.roughness = 0.12;

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
      plateMat: new THREE.MeshStandardMaterial({ color: 0xffffff }),
      goldMat,
    };

    const productGeo = new THREE.PlaneGeometry(1.15, 1.15);
    const productMat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      alphaTest: 0.05,
    });

    const wardrobeGroup = new THREE.Group();

    const addFramePart = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      isVertical: boolean,
      parentGroup: THREE.Group,
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, isVertical ? woodMatVert : woodMatHoriz);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parentGroup.add(mesh);
    };

    const boardWidth = cols * compartmentSpacing + T;
    const bannerAreaHeight = 0.4;

    const leftBorder = new THREE.Mesh(
      new THREE.BoxGeometry(T, bannerAreaHeight, D),
      woodMatVert,
    );
    leftBorder.position.set(-W / 2 - T / 2, H / 2 + bannerAreaHeight / 2, 0);
    leftBorder.castShadow = true;
    leftBorder.receiveShadow = true;
    wardrobeGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(
      new THREE.BoxGeometry(T, bannerAreaHeight, D),
      woodMatVert,
    );
    rightBorder.position.set(
      (cols - 1) * compartmentSpacing + W / 2 + T / 2,
      H / 2 + bannerAreaHeight / 2,
      0,
    );
    rightBorder.castShadow = true;
    rightBorder.receiveShadow = true;
    wardrobeGroup.add(rightBorder);

    const topBorder = new THREE.Mesh(
      new THREE.BoxGeometry(boardWidth, T, D),
      woodMatHoriz,
    );
    topBorder.position.set(
      ((cols - 1) * compartmentSpacing) / 2,
      H / 2 + bannerAreaHeight + T / 2,
      0,
    );
    topBorder.castShadow = true;
    topBorder.receiveShadow = true;
    wardrobeGroup.add(topBorder);

    // ── Static Dynamic Banner on Dark Velvet Board ────────────────────────────
    const bannerWidth = (cols - 1) * compartmentSpacing + W;
    const bannerHeight = bannerAreaHeight;
    const bannerDepth = 0.04;

    const bannerText = headerText || "BEST SELLER";

    // Four sub-sections repeating the single headerText across the banner
    const BANNER_SECTIONS = [
      { text: bannerText, startCol: 0, endCol: 1 },
      { text: bannerText, startCol: 2, endCol: 3 },
      { text: bannerText, startCol: 4, endCol: 5 },
      { text: bannerText, startCol: 6, endCol: 7 },
    ];

    // Compute aspect-ratio matching canvas width/height to avoid stretching!
    const canvasHeight = 128;
    const canvasWidth = Math.round(canvasHeight * (bannerWidth / bannerHeight));

    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = canvasWidth;
    bannerCanvas.height = canvasHeight;
    const bannerCtx = bannerCanvas.getContext("2d")!;

    // Background is transparent to show the dark velvet backing board underneath
    bannerCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // A. Draw subtle top/bottom ambient occlusion shadow gradients
    const topGrad = bannerCtx.createLinearGradient(0, 0, 0, 15);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    bannerCtx.fillStyle = topGrad;
    bannerCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    const bottomGrad = bannerCtx.createLinearGradient(
      0,
      canvasHeight - 15,
      0,
      canvasHeight,
    );
    bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    bannerCtx.fillStyle = bottomGrad;
    bannerCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // B. Helper to draw engraved text
    const drawEngravedText = (
      text: string,
      tx: number,
      ty: number,
      font: string,
    ) => {
      bannerCtx.font = font;
      bannerCtx.textAlign = "center";
      bannerCtx.textBaseline = "middle";

      // Highlight shadow (bottom-right edge catches light)
      bannerCtx.fillStyle = "rgba(255, 255, 255, 0.25)";
      bannerCtx.fillText(text, tx + 1.2, ty + 1.2);

      // Core inner shadow (top-left edge blocks light)
      bannerCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
      bannerCtx.fillText(text, tx - 0.5, ty - 0.5);

      // Main text (premium antique gold)
      bannerCtx.fillStyle = "#8a7143";
      bannerCtx.fillText(text, tx, ty);
    };

    // C. Helper to draw a 5-pointed star path
    const drawStarPath = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
    ) => {
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let idx = 0; idx < spikes; idx++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    // D. Helper to draw engraved star
    const drawEngravedStar = (
      cx: number,
      cy: number,
      outerRadius: number,
      innerRadius: number,
    ) => {
      // Highlight shadow
      bannerCtx.save();
      bannerCtx.fillStyle = "rgba(255, 255, 255, 0.25)";
      bannerCtx.translate(1.2, 1.2);
      drawStarPath(bannerCtx, cx, cy, 5, outerRadius, innerRadius);
      bannerCtx.fill();
      bannerCtx.restore();

      // Core inner shadow
      bannerCtx.save();
      bannerCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
      bannerCtx.translate(-0.5, -0.5);
      drawStarPath(bannerCtx, cx, cy, 5, outerRadius, innerRadius);
      bannerCtx.fill();
      bannerCtx.restore();

      // Main fill
      bannerCtx.fillStyle = "#8a7143";
      drawStarPath(bannerCtx, cx, cy, 5, outerRadius, innerRadius);
      bannerCtx.fill();
    };

    // E. Draw sections based on spanned columns (perfect mathematical fit)
    const centerY = canvasHeight / 2;

    // Easily tweakable sizes
    const fontStyle = "bold 42px Montserrat, sans-serif";
    const starOuterRad = 28;
    const starInnerRad = 18;

    BANNER_SECTIONS.forEach((sec) => {
      // Midpoint of the columns spanned by this section
      const midCol = (sec.startCol + sec.endCol) / 2;
      const midX3D = midCol * compartmentSpacing;
      // Convert to canvas pixel coordinates
      const pixelX = ((midX3D + W / 2) / bannerWidth) * canvasWidth;

      drawEngravedText(sec.text, pixelX, centerY, fontStyle);
    });

    // F. Draw star separators at section boundaries
    // We place star separators between the 4 sub-sections:
    // Boundary 1: between columns 1 and 2 (c_boundary = 1.5)
    // Boundary 2: between columns 3 and 4 (c_boundary = 3.5, center star)
    // Boundary 3: between columns 5 and 6 (c_boundary = 5.5)
    // End Star Left: near column 0 left side (X = 60 pixels)
    // End Star Right: near column 7 right side (X = canvasWidth - 60 pixels)
    const starX_1 =
      ((1.5 * compartmentSpacing + W / 2) / bannerWidth) * canvasWidth;
    const starX_2 =
      ((3.5 * compartmentSpacing + W / 2) / bannerWidth) * canvasWidth; // exactly canvasWidth / 2
    const starX_3 =
      ((5.5 * compartmentSpacing + W / 2) / bannerWidth) * canvasWidth;
    const sideStarInset = 60; // offset in pixels from outer edges

    drawEngravedStar(sideStarInset, centerY, starOuterRad, starInnerRad);
    drawEngravedStar(starX_1, centerY, starOuterRad, starInnerRad);
    drawEngravedStar(starX_2, centerY, starOuterRad, starInnerRad);
    drawEngravedStar(starX_3, centerY, starOuterRad, starInnerRad);
    drawEngravedStar(
      canvasWidth - sideStarInset,
      centerY,
      starOuterRad,
      starInnerRad,
    );

    // G. Create materials and meshes
    // 1. Backing board mesh using dark velvet material from product trays
    const bannerBackMat = new THREE.MeshStandardMaterial({
      color: 0x000000, // ultra-dark black velvet interior lining
      roughness: 0.5, // very matte to absorb light and create depth
      metalness: 0.2,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 25,
    });

    const bannerBackGeo = new THREE.BoxGeometry(
      bannerWidth,
      bannerHeight,
      bannerDepth,
    );
    const bannerMesh = new THREE.Mesh(bannerBackGeo, bannerBackMat);
    bannerMesh.position.set(
      ((cols - 1) * compartmentSpacing) / 2,
      H / 2 + bannerAreaHeight / 2,
      -D / 2 + 0.9,
    );
    bannerMesh.castShadow = true;
    bannerMesh.receiveShadow = true;
    wardrobeGroup.add(bannerMesh);

    // 2. Transparent text overlay mesh to prevent Z-fighting
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    bannerTex.colorSpace = THREE.SRGBColorSpace;

    const bannerOverlayGeo = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
    const overlayMat = new THREE.MeshStandardMaterial({
      map: bannerTex,
      transparent: true,
      roughness: 0.18,
      metalness: 0.05,
      depthWrite: false, // prevents transparency bugs
    });

    const textOverlay = new THREE.Mesh(bannerOverlayGeo, overlayMat);
    textOverlay.position.set(
      ((cols - 1) * compartmentSpacing) / 2,
      H / 2 + bannerAreaHeight / 2,
      -D / 2 + 0.9 + bannerDepth / 2 + 0.002, // 2mm offset to sit on the board face
    );
    textOverlay.castShadow = true;
    textOverlay.receiveShadow = true;
    wardrobeGroup.add(textOverlay);

    // Track for cleanup
    dynamicMaterials.push(bannerBackMat, overlayMat);
    dynamicTextures.push(bannerTex);

    for (let c = 0; c < cols; c++) {
      const colX = c * compartmentSpacing;
      const compGroup = new THREE.Group();
      compGroup.position.set(colX, 0, 0);

      addFramePart(W, H, 0.04, 0, 0, -D / 2 + 0.02, false, compGroup);

      if (c === 0) {
        addFramePart(T, H, D, -W / 2 - T / 2, 0, 0, true, compGroup);
      }
      addFramePart(T, H, D, W / 2 + T / 2, 0, 0, true, compGroup);

      addFramePart(W, T, D, 0, H / 2 - T / 2, 0, false, compGroup);
      addFramePart(W, T, D, 0, -H / 2 + T / 2, 0, false, compGroup);

      const product =
        products[c] || DEFAULT_PRODUCTS[c % DEFAULT_PRODUCTS.length];

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;

      // Light background matching Wardrobe3D.tsx recessMat color
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillRect(0, 0, 512, 128);

      // Luxurious product name (satin gold)
      ctx.fillStyle = "#a88e47";
      ctx.font = "bold 32px Montserrat, serif";
      ctx.fillText(product.name, 32, 54);

      // Price (warm sand/muted gold)
      ctx.fillStyle = "#645732";
      ctx.font = "28px Montserrat, sans-serif";
      ctx.fillText(product.price, 32, 94);

      // Cart Button Circle Outline
      ctx.strokeStyle = "#645732";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(430, 64, 30, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(412, 47);
      ctx.scale(1.0, 1.0); // 1:1 scale matching Wardrobe3D
      ctx.strokeStyle = "#d4b373";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const cartPath = new Path2D(
        "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
      );
      ctx.stroke(cartPath);

      // Wheels
      ctx.beginPath();
      ctx.arc(9, 21, 1.5, 0, Math.PI * 2);
      ctx.arc(17, 21, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#d4b373";
      ctx.fill();
      ctx.restore();

      const recessTex = new THREE.CanvasTexture(canvas);
      recessTex.colorSpace = THREE.SRGBColorSpace;

      const uniqueRecessMat = new THREE.MeshStandardMaterial({
        map: recessTex,
        color: 0xfff7f2, // white/cream baseline
        roughness: 0.3,
        metalness: 0.05,
        emissiveMap: recessTex,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.8,
      });

      dynamicMaterials.push(uniqueRecessMat);
      dynamicTextures.push(recessTex);

      const shelfMaterials = {
        ...sharedShelfMaterials,
        plateMat: uniqueRecessMat,
      };

      const shelfGroup = buildShelfGroup({
        width: W,
        depth: D,
        woodMaterial: woodMatHoriz,
        geometries: sharedShelfGeometries,
        materials: shelfMaterials,
      });
      const SHELF_INSET_Z = -0.06;
      shelfGroup.position.set(0, -H / 2 + 0.2, SHELF_INSET_Z);

      const boxResult = buildProductBox({
        width: 1.8,
        depth: 0.4,
        height: 1.4,
        thickness: 0.04,
        tiltAngle: -14,
        woodMaterial: woodMatHoriz,
      });
      const shelfTopY = 0.8 + 0.12 + 0.012;
      boxResult.group.position.set(0, shelfTopY + boxResult.yOffset, 0);

      const pTex = textureLoader.load(product.image || "/product.webp");
      pTex.colorSpace = THREE.SRGBColorSpace;
      dynamicTextures.push(pTex);

      const pMat = productMat.clone();
      pMat.map = pTex;
      dynamicMaterials.push(pMat);

      const productMesh = new THREE.Mesh(productGeo, pMat);
      productMesh.position.set(0, 0, 0.08);
      boxResult.group.add(productMesh);

      const ledMat = new THREE.MeshBasicMaterial({ color: 0xf6ecdc });

      const goldCapMat = new THREE.MeshStandardMaterial({
        color: 0xc8973a,
        roughness: 0.15,
        metalness: 0.95,
        emissive: new THREE.Color(0x7a5010),
        emissiveIntensity: 0.4,
      });

      const LED_W = W - 0.5;
      const LED_Y = H / 2 - 0.35;
      const LED_Z = D * -0.13;

      const ledBar = new THREE.Mesh(
        new THREE.BoxGeometry(LED_W, 0.04, 0.1),
        ledMat,
      );
      ledBar.position.set(0, LED_Y, LED_Z);
      compGroup.add(ledBar);

      // ── Golden End Caps ───────────────────────────────────────────────────────
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

      // ── LED Gradient Glow ─────────────────────────────────────────────────────
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = 4;
      glowCanvas.height = 256;
      const ctxGlow = glowCanvas.getContext("2d")!;
      const grad = ctxGlow.createLinearGradient(0, 0, 0, glowCanvas.height);
      grad.addColorStop(0.0, "rgba(255, 200, 100, 0)");
      grad.addColorStop(0.28, "rgba(255, 200, 100, 0.15)");
      grad.addColorStop(0.42, "rgba(255, 200, 100, 0.35)");
      grad.addColorStop(0.5, "rgba(255, 200, 100, 0.75)");
      grad.addColorStop(0.58, "rgba(255, 200, 100, 0.35)");
      grad.addColorStop(0.72, "rgba(255, 200, 100, 0.15)");
      grad.addColorStop(1.0, "rgba(255, 200, 100, 0)");
      ctxGlow.fillStyle = grad;
      ctxGlow.fillRect(0, 0, glowCanvas.width, glowCanvas.height);

      const glowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(LED_W + 0.2, 0.2),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(glowCanvas),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      glowMesh.position.set(0, LED_Y - 0.02, LED_Z + 0.06);
      compGroup.add(glowMesh);

      shelfGroup.add(boxResult.group);
      compGroup.add(shelfGroup);

      const rectLight = new THREE.RectAreaLight(
        0xffdaa6,
        4.0,
        W - 0.1,
        H * 0.5,
      );
      rectLight.position.set(0, H / 2 - 0.15, D * 0.13);
      rectLight.lookAt(0, -H * 0.8, -D / 2);
      compGroup.add(rectLight);

      const topRectLight = new THREE.RectAreaLight(
        0xffdaa6,
        1.0,
        W - 0.1,
        H * 0.2,
      );
      topRectLight.position.set(0, H / 2 - 0.6, D * 0.45);
      topRectLight.lookAt(0, H * 1.8, -D / 2);
      compGroup.add(topRectLight);

      const ledSpotLight = new THREE.SpotLight(0xffffff, 1.8);
      // const LED_Y = H / 2 - 0.15;
      // const LED_Z = D * 0.25;
      ledSpotLight.position.set(0, LED_Y, LED_Z);
      ledSpotLight.angle = Math.PI / 3.5;
      ledSpotLight.penumbra = 0.8;
      ledSpotLight.castShadow = false;
      compGroup.add(ledSpotLight);

      wardrobeGroup.add(compGroup);
    }

    scene.add(wardrobeGroup);

    scene.add(new THREE.AmbientLight(0x0e0806, 1.8));

    const globalLight = new THREE.DirectionalLight(0xffead9, 2.7);
    globalLight.position.set(6, 3, 8);
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

    const globalLightLeft = new THREE.DirectionalLight(0xffead9, 2.7);
    globalLightLeft.position.set(-6, 3, 8);
    globalLightLeft.castShadow = true;
    globalLightLeft.shadow.mapSize.set(2048, 2048);
    globalLightLeft.shadow.camera.near = 0.5;
    globalLightLeft.shadow.camera.far = 30;
    globalLightLeft.shadow.camera.left = -dVal;
    globalLightLeft.shadow.camera.right = dVal;
    globalLightLeft.shadow.camera.top = dVal;
    globalLightLeft.shadow.camera.bottom = -dVal;
    globalLightLeft.shadow.bias = -0.0003;
    scene.add(globalLightLeft);

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const fovRad = (camera.fov / 2) * (Math.PI / 180);
      // Fit exactly 4 compartments + 5 dividers + 0.4 padding to show outer side borders
      const desiredWidth = 4 * W + 5 * T + 2.0;
      const fitZ = desiredWidth / (2 * Math.tan(fovRad) * camera.aspect);
      camera.position.z = Math.max(fitZ, 5.8);

      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Skip rendering when off-screen to save GPU

      camera.position.x += (targetCameraX.current - camera.position.x) * 0.08;

      // ADJUST VERTICAL ANGLE LOOKAT Y HERE:
      // Match the camera focal target Y height (currently 0.2)
      camera.lookAt(camera.position.x, 0.3, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      productGeo.dispose();
      productMat.dispose();
      if (typeof bannerBackGeo !== "undefined") bannerBackGeo.dispose();
      if (typeof bannerOverlayGeo !== "undefined") bannerOverlayGeo.dispose();
      Object.values(sharedShelfGeometries).forEach((g) => g.dispose());
      Object.values(sharedShelfMaterials).forEach((m) => m?.dispose());
      goldCapMat.dispose();
      woodMatHoriz.dispose();
      woodMatVert.dispose();
      colorTexHoriz.dispose();
      normalTexHoriz.dispose();
      roughTexHoriz.dispose();
      colorTexVert.dispose();
      normalTexVert.dispose();
      roughTexVert.dispose();

      dynamicMaterials.forEach((m) => m.dispose());
      dynamicTextures.forEach((t) => t.dispose());
    };
  }, [fontLoaded, products, compartmentSpacing, headerText]);

  const handlePrev = () => {
    setActiveScrollIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    // 10 compartments, 4 visible, max scroll index is 6 (0 to 6)
    setActiveScrollIndex((prev) => Math.min(prev + 1, 6));
  };

  return (
    <div className={styles.container}>
      {title && (
        <div style={{ padding: "0 24px", marginBottom: "16px" }}>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#3d2b1f",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
        </div>
      )}

      <div className={styles.viewport} ref={mountRef}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#fafaf7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              zIndex: 15,
              color: "#6b4f3a",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(107, 79, 58, 0.15)",
                borderTopColor: "#6b4f3a",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <div
              style={{
                fontSize: "0.85rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Loading Showcase...
            </div>
          </div>
        )}
      </div>

      <div
        className={styles.fadeLeft}
        style={{ opacity: activeScrollIndex === 0 ? 0 : 1 }}
      />
      <div
        className={styles.fadeRight}
        style={{ opacity: activeScrollIndex === 6 ? 0 : 1 }}
      />

      <button
        onClick={handlePrev}
        className={`${styles.navButton} ${styles.prevButton}`}
        disabled={activeScrollIndex === 0}
        aria-label="Scroll left"
      >
        <svg viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className={`${styles.navButton} ${styles.nextButton}`}
        disabled={activeScrollIndex === 6}
        aria-label="Scroll right"
      >
        <svg viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
