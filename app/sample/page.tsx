"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  buildShelfGroup,
  buildProductBox,
} from "../../components/utils/shelfBuilder";

export default function WoodSamplePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [roughness, setRoughness] = useState(0.4);
  const [metalness, setMetalness] = useState(0.1);
  const [lightIntensity, setLightIntensity] = useState(2.0);

  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.roughness = roughness;
    }
  }, [roughness]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.metalness = metalness;
    }
  }, [metalness]);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.intensity = lightIntensity;
    }
  }, [lightIntensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#12100e");

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 1.8, 5.0);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.4, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const dirLight = new THREE.DirectionalLight(0xfff5ea, lightIntensity);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);
    lightRef.current = dirLight;

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 8);
    pointLight.position.set(-2, 3, 2);
    scene.add(pointLight);

    const textureLoader = new THREE.TextureLoader();
    const woodTex = textureLoader.load("/wood.jpeg");
    woodTex.colorSpace = THREE.SRGBColorSpace;
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(1, 1);

    const woodMaterial = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: roughness,
      metalness: metalness,
    });
    materialRef.current = woodMaterial;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#080605";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#ffc95c";
    ctx.font = "bold 36px Montserrat, sans-serif";
    ctx.fillText("Sandbox Sample", 32, 54);
    ctx.fillStyle = "#baa588";
    ctx.font = "28px 'Outfit', sans-serif";
    ctx.fillText("$220", 32, 94);

    ctx.strokeStyle = "#d4b373";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(430, 64, 30, 0, Math.PI * 2);
    ctx.stroke();

    const recessTex = new THREE.CanvasTexture(canvas);
    recessTex.colorSpace = THREE.SRGBColorSpace;

    const labelMat = new THREE.MeshStandardMaterial({
      map: recessTex,
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.05,
      emissiveMap: recessTex,
      emissive: new THREE.Color(0x444444),
      emissiveIntensity: 0.5,
    });

    const W = 2.8;
    const D = 1.2;

    const shelfMaterials = {
      shelfTopMat: woodMaterial,
      shelfBodyMat: woodMaterial,
      plateMat: labelMat,
      goldMat: new THREE.MeshStandardMaterial({
        color: 0xd4b373,
        roughness: 0.35,
        metalness: 0.3,
      }),
    };

    const shelfGroup = buildShelfGroup({
      width: W,
      depth: D,
      woodMaterial: woodMaterial,
      materials: shelfMaterials,
    });
    shelfGroup.position.set(0, -0.4, -0.06);
    scene.add(shelfGroup);

    const boxResult = buildProductBox({
      width: 1.9,
      depth: 0.4,
      height: 1.5,
      thickness: 0.04,
      tiltAngle: -14,
      woodMaterial: woodMaterial,
    });
    const shelfTopY = 0.8 + 0.12 + 0.012;
    boxResult.group.position.set(
      0,
      -0.4 + shelfTopY + boxResult.yOffset,
      -0.06,
    );
    scene.add(boxResult.group);

    const gridHelper = new THREE.GridHelper(10, 10, "#3a3028", "#221c17");
    gridHelper.position.y = -0.4;
    scene.add(gridHelper);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      shelfGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      boxResult.group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      woodTex.dispose();
      recessTex.dispose();
      gridHelper.geometry.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach((mat) => mat.dispose());
      } else {
        gridHelper.material.dispose();
      }
    };
  }, [roughness, metalness, lightIntensity]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#12100e",
        color: "#f5efe0",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          background: "rgba(18, 16, 14, 0.95)",
          borderBottom: "1px solid rgba(220, 201, 168, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              margin: 0,
              color: "#dcc9a8",
            }}
          >
            Wardrobe Component Sandbox
          </h1>
          <p
            style={{ fontSize: "0.8rem", margin: "4px 0 0", color: "#a88a6a" }}
          >
            Testing /public/wood.jpeg with buildShelfGroup & buildProductBox
          </p>
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "0.8rem",
              color: "#a88a6a",
              gap: "4px",
            }}
          >
            <span>
              Roughness: <strong>{roughness.toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              style={{ width: "120px", accentColor: "#dcc9a8" }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "0.8rem",
              color: "#a88a6a",
              gap: "4px",
            }}
          >
            <span>
              Metalness: <strong>{metalness.toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={metalness}
              onChange={(e) => setMetalness(parseFloat(e.target.value))}
              style={{ width: "120px", accentColor: "#dcc9a8" }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "0.8rem",
              color: "#a88a6a",
              gap: "4px",
            }}
          >
            <span>
              Light Intensity: <strong>{lightIntensity.toFixed(1)}</strong>
            </span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
              style={{ width: "120px", accentColor: "#dcc9a8" }}
            />
          </label>
        </div>
      </div>

      <div
        ref={mountRef}
        style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}
      />
    </div>
  );
}
