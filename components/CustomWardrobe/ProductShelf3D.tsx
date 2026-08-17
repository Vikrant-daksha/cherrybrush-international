"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildProductBox } from "../utils/shelfBuilder";

// ─────────────────────────────────────────────────────────────────────────────
// ProductShelf3D — Luxury Display Shelf Component
// ─────────────────────────────────────────────────────────────────────────────
//
// Structure (side view):
//
//   ┌──────────────────────────────────┐
//   │  [product rests on shelf top]    │  ← top surface (polished shiny wood)
//   ├──────────────────────────────────┤  ← shelf body (wood)
//   │  ┌────────────────────────────┐  │
//   │  │  ┌──────────────────────┐  │  │  ← label plate (dark panel)
//   │  │  │  [engraved text zone]│  │  │  ← gold border + text recess
//   │  │  └──────────────────────┘  │  │
//   │  └────────────────────────────┘  │
//   ├──────────────────────────────────┤  ← base board (bottom strip)
//   └──────────────────────────────────┘
//
// Usage:
//   <ProductShelf3D width={3.0} />
//
// Props:
//   width      — shelf width in 3D units      (default: 3.0)
//   depth      — shelf front-to-back depth    (default: 1.4)
//   className  — optional CSS class for wrapper div
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductShelf3DProps {
  width?: number;
  depth?: number;
  className?: string;
}

export default function ProductShelf3D({
  width = 3.0,
  depth = 1.4,
  className,
}: ProductShelf3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = width;
    const D = depth;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a0e07");

    // ── Camera ───────────────────────────────────────────────────────────────
    // Positioned slightly above and in front to show the shelf top surface
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 1.2, 5.5); // ← slightly above center to see the top surface
    camera.lookAt(0, -0.1, 0);

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ══════════════════════════════════════════════════════════════════════════
    // MATERIALS
    // ══════════════════════════════════════════════════════════════════════════

    // ── Polished Shelf Surface ────────────────────────────────────────────────
    // Very low roughness = lacquered/glossy finish that reflects light clearly.
    // metalness: 0.08 gives it a slight luster without looking metallic.
    // emissive gives it warmth so it reads well even in dark interiors.
    const shelfTopMat = new THREE.MeshStandardMaterial({
      color: 0x6b3d1e, // ← TUNE: polished wood color (warmer than frame)
      roughness: 0.05, // ← TUNE: 0 = mirror gloss, 0.3 = satin finish
      metalness: 0.08, // ← TUNE: slight luster — keep under 0.2
      emissive: new THREE.Color(0x2a1005),
      emissiveIntensity: 0.25, // Subtle warmth to the top surface
    });

    // ── Shelf Body & Base Board ───────────────────────────────────────────────
    // Slightly less shiny than the top surface (sides/underside aren't polished)
    const shelfBodyMat = new THREE.MeshStandardMaterial({
      color: 0x5a3318,
      roughness: 0.4,
      metalness: 0.05,
      emissive: new THREE.Color(0x3d1f0a),
      emissiveIntensity: 0.6,
    });

    // ── Label Plate Background ────────────────────────────────────────────────
    // Very dark panel — almost black, like a lacquered ebony insert.
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x4d372c,
      roughness: 0.3,
      metalness: 0.05,
      emissive: new THREE.Color(0x2f1d15),
      emissiveIntensity: 0.5,
    });

    // ── Gold Border Frame ─────────────────────────────────────────────────────
    // Bright polished gold. Very low roughness for a sharp metallic shine.
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4b373, // warm satin gold
      roughness: 0.45,
      metalness: 0.4,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.2,
    });

    // ── Engraved Text Recess ─────────────────────────────────────────────────
    // A slightly recessed area on the plate — darker than the plate itself.
    // In Three.js we simulate an engraving with a slightly inset darker plane.
    const recessMat = new THREE.MeshStandardMaterial({
      color: 0x4d372c,
      roughness: 0.3,
      metalness: 0.05,
      emissive: new THREE.Color(0x2f1d15),
      emissiveIntensity: 0.5,
    });

    // ══════════════════════════════════════════════════════════════════════════
    // GEOMETRY
    // ══════════════════════════════════════════════════════════════════════════
    const group = new THREE.Group();

    // ── Dimensions ────────────────────────────────────────────────────────────
    const SHELF_H = 0.12; // ← TUNE: thickness of the main shelf body
    const BASE_H = 0.08; // ← TUNE: height of the bottom base board
    const PLATE_H = 0.32; // ← TUNE: total height of the front label plate face
    const PLATE_INSET = 0.06; // ← TUNE: gap between shelf edge and plate frame
    const BORDER_T = 0.025; // ← TUNE: thickness of gold border stripes
    const RECESS_INSET = 0.05; // ← TUNE: gap between gold border and inner recess

    // ────────────────────────────────────────────────────────────────────────
    // A. BASE BOARD — Bottom flat strip at the front of the compartment
    //    Positioned at Y=0 (our local origin is the shelf bottom)
    // ────────────────────────────────────────────────────────────────────────
    const baseBoard = new THREE.Mesh(
      new THREE.BoxGeometry(W, BASE_H, D),
      shelfBodyMat,
    );
    baseBoard.position.set(0, BASE_H / 2, 0); // rests on floor (Y=0)
    baseBoard.receiveShadow = true;
    baseBoard.castShadow = true;
    group.add(baseBoard);

    // ────────────────────────────────────────────────────────────────────────
    // B. SHELF BODY — Sits on top of base board
    // ────────────────────────────────────────────────────────────────────────
    const shelfBody = new THREE.Mesh(
      new THREE.BoxGeometry(W, SHELF_H, D),
      shelfBodyMat,
    );
    shelfBody.position.set(0, BASE_H + SHELF_H / 2, 0);
    shelfBody.receiveShadow = true;
    shelfBody.castShadow = true;
    group.add(shelfBody);

    // ────────────────────────────────────────────────────────────────────────
    // C. POLISHED TOP SURFACE — Thin overlay on top of the shelf body
    //    Separate mesh so we can give it a different (shiny) material.
    //    A very thin BoxGeometry with the glossy shelfTopMat.
    // ────────────────────────────────────────────────────────────────────────
    const shelfTop = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.012, D), // ← TUNE: 0.012 = thin veneer thickness
      shelfTopMat,
    );
    shelfTop.position.set(0, BASE_H + SHELF_H + 0.006, 0);
    shelfTop.receiveShadow = true;
    group.add(shelfTop);

    // ── Product Box / Container ──────────────────────────────────────────────
    // Add product box slanted on top of the shelf top mat
    const boxResult = buildProductBox({
      width: 1.8,
      depth: 0.9,
      height: 0.22,
      thickness: 0.06,
      tiltAngle: 0,
    });
    // The top surface of shelfTop is at Y = BASE_H + SHELF_H + 0.012
    const shelfTopY = BASE_H + SHELF_H + 0.012;
    boxResult.group.position.set(0, shelfTopY + boxResult.yOffset, 0);
    group.add(boxResult.group);

    // ────────────────────────────────────────────────────────────────────────
    // D. LABEL PLATE SYSTEM (front face, centred on shelf body)
    //
    // Structure (front view):
    //
    //   ┌──────────────────────────────────┐  ← plateMat (dark background)
    //   │ ┌────────────────────────────┐   │  ← gold top border
    //   │ │                            │   │
    //   │ │  ┌──────────────────────┐  │   │  ← recess (engraved text area)
    //   │ │  │  [text goes here]    │  │   │
    //   │ │  └──────────────────────┘  │   │
    //   │ │                            │   │
    //   │ └────────────────────────────┘   │  ← gold bottom border
    //   └──────────────────────────────────┘
    //
    // All plate elements face toward +Z (camera direction).
    // ────────────────────────────────────────────────────────────────────────

    const plateY = BASE_H + SHELF_H / 2; // vertically centred on shelf body
    const plateZ = D / 2 + 0.002; // sits flush on front face of shelf
    const plateW = W - PLATE_INSET * 2; // width minus side insets
    const innerW = plateW - BORDER_T * 2; // inner area width (inside gold border)
    const innerH = PLATE_H - BORDER_T * 2; // inner area height

    // Dark background plate
    const plateBack = new THREE.Mesh(
      new THREE.BoxGeometry(plateW, PLATE_H, 0.008),
      plateMat,
    );
    plateBack.position.set(0, plateY, plateZ);
    group.add(plateBack);

    // Gold border — Top strip
    const goldTop = new THREE.Mesh(
      new THREE.BoxGeometry(plateW, BORDER_T, 0.012),
      goldMat,
    );
    goldTop.position.set(
      0,
      plateY + PLATE_H / 2 - BORDER_T / 2,
      plateZ + 0.004,
    );
    group.add(goldTop);

    // Gold border — Bottom strip
    const goldBottom = new THREE.Mesh(
      new THREE.BoxGeometry(plateW, BORDER_T, 0.012),
      goldMat,
    );
    goldBottom.position.set(
      0,
      plateY - PLATE_H / 2 + BORDER_T / 2,
      plateZ + 0.004,
    );
    group.add(goldBottom);

    // Gold border — Left strip
    const goldLeft = new THREE.Mesh(
      new THREE.BoxGeometry(BORDER_T, PLATE_H, 0.012),
      goldMat,
    );
    goldLeft.position.set(-plateW / 2 + BORDER_T / 2, plateY, plateZ + 0.004);
    group.add(goldLeft);

    // Gold border — Right strip
    const goldRight = new THREE.Mesh(
      new THREE.BoxGeometry(BORDER_T, PLATE_H, 0.012),
      goldMat,
    );
    goldRight.position.set(plateW / 2 - BORDER_T / 2, plateY, plateZ + 0.004);
    group.add(goldRight);

    // Engraved recess — slightly inset dark area inside the gold border
    // This simulates an engraved/debossed text zone on the plate.
    const recessW = innerW - RECESS_INSET * 2;
    const recessH = innerH - RECESS_INSET * 2;
    const recess = new THREE.Mesh(
      new THREE.BoxGeometry(recessW, recessH, 0.003),
      recessMat,
    );
    // Positioned slightly in front of plateBack, preventing Z-fighting
    recess.position.set(0, plateY, plateZ + 0.003);
    group.add(recess);

    scene.add(group);

    // ══════════════════════════════════════════════════════════════════════════
    // LIGHTING
    // ══════════════════════════════════════════════════════════════════════════

    // Ambient — base fill so everything is visible
    scene.add(new THREE.AmbientLight(0x1a1005, 4.0));

    // Top-front key light — creates the glossy reflection on the shelf top surface.
    // This is what makes the polished top look reflective.
    const keyLight = new THREE.DirectionalLight(0xffd09a, 2.5);
    keyLight.position.set(0, 6, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // Side fill — catches the gold border from the left
    const sideLight = new THREE.DirectionalLight(0xffc870, 1.2);
    sideLight.position.set(-5, 3, 4);
    scene.add(sideLight);

    setLoading(false);

    // ── Resize & Render Loop ──────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [width, depth]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#c8973a",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
          }}
        >
          Rendering...
        </div>
      )}
    </div>
  );
}
