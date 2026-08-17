"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { buildShelfGroup, buildProductBox } from "../utils/shelfBuilder";

// ─────────────────────────────────────────────────────────────────────────────
// Compartment3D — Reusable Three.js Wardrobe Compartment
// ─────────────────────────────────────────────────────────────────────────────
// Usage:
//   <Compartment3D width={3.2} height={3.2} />
//
// Props:
//   width   — compartment opening width  (default: 3.2)
//   height  — compartment opening height (default: 3.2)
//   depth   — front-to-back depth        (default: 1.6)
//   thickness — border frame thickness   (default: 0.18)
//
// The component mounts its own Three.js canvas inside the wrapper div.
// Size the wrapper div with CSS to control the canvas dimensions.
// ─────────────────────────────────────────────────────────────────────────────

export interface Compartment3DProps {
  /** Compartment opening width in 3D units */
  width?: number;
  /** Compartment opening height in 3D units */
  height?: number;
  /** Front-to-back depth in 3D units */
  depth?: number;
  /** Wood border thickness */
  thickness?: number;
  /** Optional class for the wrapper div */
  className?: string;
  /** PBR wood texture folder name in /public */
  woodTextureFolder?: string;
}

export default function Compartment3D({
  width = 3.2,
  height = 3.2,
  depth = 1.6,
  thickness = 0.18,
  className,
  woodTextureFolder,
}: Compartment3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Re-run the whole Three.js setup whenever any dimension prop changes
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = width;
    const H = height;
    const D = depth;
    const T = thickness;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a0e07");

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // ── Loading Manager ───────────────────────────────────────────────────────
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setLoading(false);
    };

    // ── Materials ─────────────────────────────────────────────────────────────
    let woodMatHoriz: THREE.Material;
    let woodMatVert: THREE.Material;

    if (woodTextureFolder) {
      const textureLoader = new THREE.TextureLoader(manager);

      // Load separate texture instances to prevent cloning/needsUpdate WebGL bugs
      const colorTexHoriz = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_Color.jpg`,
      );
      const normalTexHoriz = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.jpg`,
      );
      const roughTexHoriz = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_Roughness.jpg`,
      );

      const colorTexVert = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_Color.jpg`,
      );
      const normalTexVert = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_NormalGL.jpg`,
      );
      const roughTexVert = textureLoader.load(
        `/${woodTextureFolder}/${woodTextureFolder}_Roughness.jpg`,
      );

      // Set proper color space for modern Three.js diffuse textures
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

      woodMatHoriz = new THREE.MeshStandardMaterial({
        color: 0xffffff, // White color so texture shows true PBR values
        map: colorTexHoriz,
        normalMap: normalTexHoriz,
        normalScale: new THREE.Vector2(0.8, 0.8), // Slightly stronger normal map for wood texture depth
        roughnessMap: roughTexHoriz,
        roughness: 0.6,
        metalness: 0.02,
        emissiveMap: colorTexHoriz,
        emissive: 0xffffff,
        emissiveIntensity: 1.8,
      });

      woodMatVert = new THREE.MeshStandardMaterial({
        color: 0xffffff, // White color so texture shows true PBR values
        map: colorTexVert,
        normalMap: normalTexVert,
        normalScale: new THREE.Vector2(0.8, 0.8), // Slightly stronger normal map for wood texture depth
        roughnessMap: roughTexVert,
        roughness: 0.6,
        metalness: 0.02,
        emissiveMap: colorTexVert,
        emissive: 0xffffff,
        emissiveIntensity: 1.8,
      });
    } else {
      const fallbackMat = new THREE.MeshStandardMaterial({
        color: 0x5a3318,
        roughness: 0.4,
        metalness: 0.05,
        emissive: new THREE.Color(0x3d1f0a),
        emissiveIntensity: 0.8,
      });
      woodMatHoriz = fallbackMat;
      woodMatVert = fallbackMat;
    }

    const backMat = new THREE.MeshStandardMaterial({
      color: 0x0e0806,
      roughness: 0.8,
      metalness: 0.0,
    });

    const ledMat = new THREE.MeshBasicMaterial({ color: 0xf6ecdc });

    const goldCapMat = new THREE.MeshStandardMaterial({
      color: 0xc8973a,
      roughness: 0.15,
      metalness: 0.95,
      emissive: new THREE.Color(0x7a5010),
      emissiveIntensity: 0.4,
    });

    // ── Geometry ──────────────────────────────────────────────────────────────
    const group = new THREE.Group();

    const addBorder = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      isVertical: boolean = false,
    ) => {
      const mat = isVertical ? woodMatVert : woodMatHoriz;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      group.add(mesh);
    };

    addBorder(W + T * 2, T, D, 0, H / 2 + T / 2, 0, false); // Top
    addBorder(W + T * 2, T, D, 0, -H / 2 - T / 2, 0, false); // Bottom
    addBorder(T, H, D, -W / 2 - T / 2, 0, 0, true); // Left
    addBorder(T, H, D, W / 2 + T / 2, 0, 0, true); // Right

    const backMesh = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, 0.08),
      woodMatVert,
    );
    backMesh.position.set(0, 0, -D / 2 + 0.04);
    backMesh.receiveShadow = true;
    group.add(backMesh);

    // ── LED Strip Bar ─────────────────────────────────────────────────────────
    const LED_W = W - 0.3;
    const LED_Y = H / 2 - 0.12;
    const LED_Z = D * 0.13;

    const ledBar = new THREE.Mesh(
      new THREE.BoxGeometry(LED_W, 0.04, 0.1),
      ledMat,
    );
    ledBar.position.set(0, LED_Y, LED_Z);
    group.add(ledBar);

    // ── Golden End Caps ───────────────────────────────────────────────────────
    const CAP_W = 0.07;
    const CAP_H = 0.1;
    const CAP_D = 0.14;

    const leftCap = new THREE.Mesh(
      new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
      goldCapMat,
    );
    leftCap.position.set(-(LED_W / 2) - CAP_W / 2, LED_Y, LED_Z);
    group.add(leftCap);

    const rightCap = new THREE.Mesh(
      new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D),
      goldCapMat,
    );
    rightCap.position.set(LED_W / 2 + CAP_W / 2, LED_Y, LED_Z);
    group.add(rightCap);

    // ── LED Gradient Glow ─────────────────────────────────────────────────────
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 4;
    glowCanvas.height = 256;
    const ctx = glowCanvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, glowCanvas.height);
    grad.addColorStop(0.0, "rgba(255, 200, 100, 0)");
    grad.addColorStop(0.28, "rgba(255, 200, 100, 0.15)");
    grad.addColorStop(0.42, "rgba(255, 200, 100, 0.35)");
    grad.addColorStop(0.5, "rgba(255, 200, 100, 0.75)");
    grad.addColorStop(0.58, "rgba(255, 200, 100, 0.35)");
    grad.addColorStop(0.72, "rgba(255, 200, 100, 0.15)");
    grad.addColorStop(1.0, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);

    const glowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(LED_W, 0.2),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(glowCanvas),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    glowMesh.position.set(0, LED_Y, LED_Z + 0.06);
    group.add(glowMesh);

    // ── RectAreaLights ────────────────────────────────────────────────────────
    RectAreaLightUniformsLib.init();

    const rectLight = new THREE.RectAreaLight(0xffc570, 8.0, W - 0.05, H * 0.6);
    rectLight.position.set(0, H / 2 - 0.15, D * 0.13);
    rectLight.lookAt(0, -H * 0.8, -D / 2);
    group.add(rectLight);

    const topRectLight = new THREE.RectAreaLight(
      0xffc570,
      4.2,
      W - 0.1,
      H * 0.2,
    );
    topRectLight.position.set(0, H / 2 - 0.6, D * 0.45);
    topRectLight.lookAt(0, H * 1.8, -D / 2);
    group.add(topRectLight);

    // ── Product Shelf at compartment floor ────────────────────────────────────
    // buildShelfGroup() returns a THREE.Group with Y=0 at the shelf floor.
    // We shift it up by -H/2 so it sits on the interior bottom of the compartment.
    // Width matches compartment opening (W), depth matches compartment depth (D).
    const SHELF_INSET_Z = -0.06; // ← TUNE: how far "inside" the shelf sits.
    //   0   = flush with the front face
    //   -0.1 = slight recess (~1 inch equivalent)
    //   -0.3 = pushed well into the compartment
    //   Don't go below -(D/2) or it clips the back panel.
    const shelfGroup = buildShelfGroup({
      width: W,
      depth: D,
      woodMaterial: woodMatHoriz,
    });
    shelfGroup.position.set(
      0, // centred horizontally
      -H / 2, // ← TUNE Y: move up (+) or down (−) relative to compartment bottom
      SHELF_INSET_Z, // ← change the constant above to slide it in/out
    );

    // Add product box slanted on top of the shelf top mat
    const boxResult = buildProductBox({
      width: 2.4,
      depth: 0.4,
      height: 1.8,
      thickness: 0.06,
      tiltAngle: -14,
    });
    // The top surface of shelf in shelfBuilder is at Y = BASE_H + SHELF_H + 0.012 = 0.8 + 0.12 + 0.012 = 0.932
    const shelfTopY = 0.8 + 0.12 + 0.012;
    boxResult.group.position.set(0, shelfTopY + boxResult.yOffset, 0);
    shelfGroup.add(boxResult.group);

    group.add(shelfGroup);

    scene.add(group);

    // ── Scene Lighting ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a0604, 1.4)); // reduced to allow shadows to form

    // Key shadow light representing the overhead LED strip casting downwards shadows
    const ledShadowLight = new THREE.SpotLight(0xffe5c4, 6.0);
    ledShadowLight.position.set(0, H / 2 - 0.17, D * 0.13);
    ledShadowLight.angle = Math.PI / 3.5;
    ledShadowLight.penumbra = 0.8;
    ledShadowLight.castShadow = true;
    ledShadowLight.shadow.mapSize.set(2048, 2048);
    ledShadowLight.shadow.bias = -0.0005;
    ledShadowLight.shadow.camera.near = 0.5;
    ledShadowLight.shadow.camera.far = 10;

    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, -H / 2, 0);
    scene.add(targetObj);
    ledShadowLight.target = targetObj;

    scene.add(ledShadowLight);

    const depthLight = new THREE.DirectionalLight(0xffd09a, 2.0); // side/fill light to highlight rim contours
    depthLight.position.set(2, 6, 6);
    depthLight.castShadow = true;
    depthLight.shadow.mapSize.set(1024, 1024);
    depthLight.shadow.camera.near = 0.5;
    depthLight.shadow.camera.far = 25;
    const d = 4;
    depthLight.shadow.camera.left = -d;
    depthLight.shadow.camera.right = d;
    depthLight.shadow.camera.top = d;
    depthLight.shadow.camera.bottom = -d;
    depthLight.shadow.bias = -0.0005;
    scene.add(depthLight);

    if (!woodTextureFolder) {
      setLoading(false);
    }

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
  }, [width, height, depth, thickness, woodTextureFolder]);

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
