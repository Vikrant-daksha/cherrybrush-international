import * as THREE from "three";

/**
 * Shared Texture & Canvas Cache Manager for Wardrobe3D
 * 
 * Prevents redundant network downloads, eliminates duplicate GPU allocations,
 * and pre-renders 2D Canvas textures only once per unique content.
 */

interface TextureConfig {
  colorSpace?: THREE.ColorSpace;
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  repeatX?: number;
  repeatY?: number;
  flipY?: boolean;
}

class TextureManager {
  private static instance: TextureManager;
  private textureCache = new Map<string, THREE.Texture>();
  private canvasCache = new Map<string, THREE.CanvasTexture>();

  private constructor() {}

  public static getInstance(): TextureManager {
    if (!TextureManager.instance) {
      TextureManager.instance = new TextureManager();
    }
    return TextureManager.instance;
  }

  /**
   * Load or retrieve an existing texture from cache
   */
  public loadTexture(
    url: string,
    manager?: THREE.LoadingManager,
    config?: TextureConfig
  ): THREE.Texture {
    const cacheKey = `${url}_${config?.wrapS || 0}_${config?.wrapT || 0}_${config?.repeatX || 1}_${config?.repeatY || 1}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const loader = new THREE.TextureLoader(manager);
    const texture = loader.load(url);

    if (config?.colorSpace) texture.colorSpace = config.colorSpace;
    if (config?.wrapS) texture.wrapS = config.wrapS;
    if (config?.wrapT) texture.wrapT = config.wrapT;
    if (config?.repeatX !== undefined && config?.repeatY !== undefined) {
      texture.repeat.set(config.repeatX, config.repeatY);
    }
    if (config?.flipY !== undefined) {
      texture.flipY = config.flipY;
    }

    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Cached LED Glow gradient texture
   */
  public getGlowTexture(): THREE.CanvasTexture {
    const key = "led_glow_texture";
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0.0, "rgba(255, 200, 100, 0)");
    grad.addColorStop(0.28, "rgba(255, 200, 100, 0.15)");
    grad.addColorStop(0.42, "rgba(255, 200, 100, 0.35)");
    grad.addColorStop(0.5, "rgba(255, 200, 100, 0.75)");
    grad.addColorStop(0.58, "rgba(255, 200, 100, 0.35)");
    grad.addColorStop(0.72, "rgba(255, 200, 100, 0.15)");
    grad.addColorStop(1.0, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cached Product Label Texture (Name, Price, Cart Icon)
   */
  public getProductLabelTexture(name: string, price: string): THREE.CanvasTexture {
    const key = `product_label_${name}_${price}`;
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Clean background
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, 512, 128);

    // Product Name
    ctx.fillStyle = "#C1AA6C";
    ctx.font = "bold 32px Montserrat, serif";
    ctx.fillText(name, 32, 54);

    // Price
    ctx.fillStyle = "#C1AA6C";
    ctx.font = "bold 28px Montserrat, sans-serif";
    ctx.fillText(price, 32, 94);

    // Cart Button Circle Outline
    ctx.strokeStyle = "#645732ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(430, 64, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Cart Icon
    ctx.save();
    ctx.translate(412, 47);
    ctx.strokeStyle = "#d4b373";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const cartPath = new Path2D(
      "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
    );
    ctx.stroke(cartPath);

    // Wheels
    ctx.beginPath();
    ctx.arc(9, 21, 1.5, 0, Math.PI * 2);
    ctx.arc(17, 21, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#d4b373";
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cached Plate Label Texture (e.g., BEST SELLER / TRENDING NOW)
   */
  public getPlateLabelTexture(text: string): THREE.CanvasTexture {
    const key = `plate_label_${text}`;
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(196, 196, 196, 1)";
    ctx.fillRect(0, 0, 512, 128);

    ctx.fillStyle = "#a88e47ff";
    ctx.font = "bold 54px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, 256, 80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cached Quiz Drawer Label Texture
   */
  public getQuizLabelTexture(): THREE.CanvasTexture {
    const key = "quiz_label_texture";
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 819;
    const ctx = canvas.getContext("2d")!;

    const drawText = (
      text: string,
      tx: number,
      ty: number,
      font: string,
      align: CanvasTextAlign = "center"
    ) => {
      ctx.font = font;
      ctx.textAlign = align;

      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillText(text, tx + 1.2, ty + 1.2);

      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillText(text, tx - 0.5, ty - 0.5);

      ctx.fillStyle = "#5a4131";
      ctx.fillText(text, tx, ty);
    };

    const drawRect = (rx: number, ry: number, rw: number, rh: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx + 1.2, ry + 1.2, rw, rh);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx - 0.5, ry - 0.5, rw, rh);

      ctx.strokeStyle = "#5a4131";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx, ry, rw, rh);
    };

    const drawArrow = (ax: number, ay: number, len: number) => {
      const drawPath = (offsetX: number, offsetY: number) => {
        ctx.beginPath();
        ctx.moveTo(ax + offsetX, ay + offsetY);
        ctx.lineTo(ax + len + offsetX, ay + offsetY);
        ctx.lineTo(ax + len - 8 + offsetX, ay - 6 + offsetY);
        ctx.moveTo(ax + len + offsetX, ay + offsetY);
        ctx.lineTo(ax + len - 8 + offsetX, ay + 6 + offsetY);
        ctx.stroke();
      };

      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2.5;
      drawPath(1.2, 1.2);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.lineWidth = 2.5;
      drawPath(-0.5, -0.5);

      ctx.strokeStyle = "#5a4131";
      ctx.lineWidth = 2.5;
      drawPath(0, 0);
    };

    drawText("FIND YOUR", 256, 230, "bold 54px Montserrat, serif");
    drawText("PERFECT SET", 256, 280, "bold 54px Montserrat, serif");
    drawText("Different moods.", 256, 380, "32px Montserrat, sans-serif");
    drawText("Endless possibilities.", 256, 425, "32px Montserrat, sans-serif");

    const btnW = 350;
    const btnH = 100;
    const btnX = (512 - btnW) / 2;
    const btnY = 520;
    drawRect(btnX, btnY, btnW, btnH);
    drawText("TAKE THE QUIZ", 236, btnY + btnH / 2 + 6, "bold 28px Montserrat, sans-serif");
    drawArrow(380, btnY + btnH / 2, 24);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cached Complete Kit Drawer Label Texture
   */
  public getKitLabelTexture(): THREE.CanvasTexture {
    const key = "kit_label_texture";
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 819;
    const ctx = canvas.getContext("2d")!;

    const drawText = (
      text: string,
      tx: number,
      ty: number,
      font: string,
      align: CanvasTextAlign = "center"
    ) => {
      ctx.font = font;
      ctx.textAlign = align;

      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillText(text, tx + 1.2, ty + 1.2);

      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillText(text, tx - 0.5, ty - 0.5);

      ctx.fillStyle = "#5a4131";
      ctx.fillText(text, tx, ty);
    };

    const drawRect = (rx: number, ry: number, rw: number, rh: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx + 1.2, ry + 1.2, rw, rh);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx - 0.5, ry - 0.5, rw, rh);

      ctx.strokeStyle = "#5a4131";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx, ry, rw, rh);
    };

    drawText("THE COMPLETE KIT", 256, 100, "bold 42px Montserrat, serif");
    drawText("Everything you need", 200, 150, "30px Montserrat, sans-serif");
    drawText("for the perfect", 150, 190, "30px Montserrat, sans-serif");
    drawText("application.", 130, 230, "30px Montserrat, sans-serif");
    drawText("₹599", 100, 320, "bold 38px Montserrat, sans-serif");

    const btnW = 380;
    const btnH = 100;
    const btnX = (512 - btnW) / 2;
    const btnY = 680;
    drawRect(btnX, btnY, btnW, btnH);
    drawText("ADD TO CART", 256, btnY + btnH / 2 + 6, "bold 36px Montserrat, sans-serif");

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cached Bottom Panel Values Texture
   */
  public getBottomPanelTexture(): THREE.CanvasTexture {
    const key = "bottom_panel_texture";
    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key)!;
    }

    const panelCanvas = document.createElement("canvas");
    panelCanvas.width = 2048;
    panelCanvas.height = 170;
    const panelCtx = panelCanvas.getContext("2d")!;

    const topGrad = panelCtx.createLinearGradient(0, 0, 0, 15);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.2)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    panelCtx.fillStyle = topGrad;
    panelCtx.fillRect(0, 0, panelCanvas.width, panelCanvas.height);

    const bottomGrad = panelCtx.createLinearGradient(0, panelCanvas.height - 10, 0, panelCanvas.height);
    bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGrad.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    panelCtx.fillStyle = bottomGrad;
    panelCtx.fillRect(0, 0, panelCanvas.width, panelCanvas.height);

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      panelCtx.beginPath();
      panelCtx.moveTo(cx, cy - outerRadius);
      for (let idx = 0; idx < spikes; idx++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        panelCtx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        panelCtx.lineTo(x, y);
        rot += step;
      }
      panelCtx.lineTo(cx, cy - outerRadius);
      panelCtx.closePath();
      panelCtx.stroke();
    };

    const drawEngravedText = (text: string, tx: number, ty: number, font: string) => {
      panelCtx.font = font;
      panelCtx.fillStyle = "rgba(255, 255, 255, 0.55)";
      panelCtx.fillText(text, tx + 1.2, ty + 1.2);
      panelCtx.fillStyle = "rgba(0, 0, 0, 0.12)";
      panelCtx.fillText(text, tx - 0.5, ty - 0.5);
      panelCtx.fillStyle = "#5a4131";
      panelCtx.fillText(text, tx, ty);
    };

    const drawEngravedIcon = (drawFunc: (cx: number, cy: number) => void, ix: number, iy: number) => {
      panelCtx.save();
      panelCtx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      panelCtx.lineWidth = 3.5;
      panelCtx.translate(1.2, 1.2);
      drawFunc(ix, iy);
      panelCtx.restore();

      panelCtx.save();
      panelCtx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      panelCtx.lineWidth = 3.5;
      panelCtx.translate(-0.5, -0.5);
      drawFunc(ix, iy);
      panelCtx.restore();

      panelCtx.save();
      panelCtx.strokeStyle = "#5a4131";
      panelCtx.lineWidth = 3.5;
      drawFunc(ix, iy);
      panelCtx.restore();
    };

    const colWidth = 2048 / 5;
    const centerY = panelCanvas.height / 2;

    const panelItems = [
      {
        header: "SALON QUALITY",
        subtext: ["Premium finish", "that lasts"],
        drawIcon: (x: number, y: number) => {
          panelCtx.beginPath();
          panelCtx.arc(x, y, 28, 0, Math.PI * 2);
          panelCtx.stroke();
          drawStar(x, y, 5, 11, 5);
        },
      },
      {
        header: "REUSABLE",
        subtext: ["Wear, remove,", "and reuse"],
        drawIcon: (x: number, y: number) => {
          panelCtx.beginPath();
          panelCtx.arc(x, y, 28, 0, Math.PI * 2);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.arc(x, y, 12, 0, Math.PI * 1.5);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.moveTo(x + 12 - 4, y - 4);
          panelCtx.lineTo(x + 12, y);
          panelCtx.lineTo(x + 12 + 4, y - 4);
          panelCtx.stroke();
        },
      },
      {
        header: "EASY APPLICATION",
        subtext: ["Apply in minutes,", "no damage"],
        drawIcon: (x: number, y: number) => {
          panelCtx.beginPath();
          panelCtx.arc(x, y, 28, 0, Math.PI * 2);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.arc(x, y + 4, 8, Math.PI, 0, false);
          panelCtx.lineTo(x + 4, y - 8);
          panelCtx.arc(x, y - 8, 4, 0, Math.PI, true);
          panelCtx.closePath();
          panelCtx.stroke();
        },
      },
      {
        header: "SAFE FORMULA",
        subtext: ["Non-toxic &", "gentle on nails"],
        drawIcon: (x: number, y: number) => {
          panelCtx.beginPath();
          panelCtx.arc(x, y, 28, 0, Math.PI * 2);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.moveTo(x, y - 12);
          panelCtx.quadraticCurveTo(x + 10, y - 6, x, y + 12);
          panelCtx.quadraticCurveTo(x - 10, y - 6, x, y - 12);
          panelCtx.closePath();
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.moveTo(x, y - 12);
          panelCtx.lineTo(x, y + 8);
          panelCtx.stroke();
        },
      },
      {
        header: "WORLDWIDE SHIPPING",
        subtext: ["Fast & reliable", "delivery"],
        drawIcon: (x: number, y: number) => {
          panelCtx.beginPath();
          panelCtx.arc(x, y, 28, 0, Math.PI * 2);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.arc(x, y, 12, 0, Math.PI * 2);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.moveTo(x - 12, y);
          panelCtx.lineTo(x + 12, y);
          panelCtx.stroke();
          panelCtx.beginPath();
          panelCtx.ellipse(x, y, 5, 12, 0, 0, Math.PI * 2);
          panelCtx.stroke();
        },
      },
    ];

    panelCtx.lineJoin = "round";
    panelCtx.lineCap = "round";
    panelCtx.letterSpacing = "1.2px";

    panelItems.forEach((item, idx) => {
      const centerX = idx * colWidth + colWidth / 2;
      const iconX = centerX - 135;
      const textX = centerX - 85;

      drawEngravedIcon(item.drawIcon, iconX, centerY);
      drawEngravedText(item.header, textX, centerY - 15, "bold 20px Montserrat, sans-serif");
      item.subtext.forEach((line, lineIdx) => {
        drawEngravedText(line, textX, centerY + 12 + lineIdx * 20, "15px Montserrat, sans-serif");
      });
    });

    const tex = new THREE.CanvasTexture(panelCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.canvasCache.set(key, tex);
    return tex;
  }

  /**
   * Cleanup method to dispose all textures when unmounting
   */
  public dispose(): void {
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.canvasCache.forEach((tex) => tex.dispose());
    this.canvasCache.clear();
  }
}

export const textureManager = TextureManager.getInstance();
