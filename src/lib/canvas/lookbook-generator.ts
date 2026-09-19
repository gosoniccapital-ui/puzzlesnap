export interface LookbookItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  img: string;
  link: string;
  platform: string;
  category?: string;
}

/**
 * Utility to load an image with anonymous CORS support and safe fallback.
 */
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Return null on CORS error or network drop, allowing graceful vector fallback
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Truncate text and add ellipsis if exceeding max width in canvas context.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/**
 * Helper to draw a rounded rectangle in Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Render a high-resolution 1080x1920 (9:16) Haute Couture Lookbook Card.
 */
export async function renderLookbookCanvas(
  items: LookbookItem[],
  title = "HAUTE COUTURE LOOKBOOK"
): Promise<HTMLCanvasElement> {

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to obtain 2D canvas context");

  // 1. Background Gradient (Deep Stone Noir)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0c0a09");
  bgGrad.addColorStop(0.5, "#171412");
  bgGrad.addColorStop(1, "#0a0908");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Gold Ambient Glows
  const topGlow = ctx.createRadialGradient(width / 2, 200, 10, width / 2, 200, 600);
  topGlow.addColorStop(0, "rgba(245, 158, 11, 0.12)");
  topGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, 800);

  const botGlow = ctx.createRadialGradient(width / 2, height - 300, 10, width / 2, height - 300, 700);
  botGlow.addColorStop(0, "rgba(236, 72, 153, 0.08)");
  botGlow.addColorStop(1, "rgba(236, 72, 153, 0)");
  ctx.fillStyle = botGlow;
  ctx.fillRect(0, height - 800, width, 800);

  // 2. Luxury Outer Frame & Accents
  ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Corner Accents
  const cornerSize = 28;
  ctx.fillStyle = "#f59e0b";
  // Top-left
  ctx.fillRect(36, 36, cornerSize, 4);
  ctx.fillRect(36, 36, 4, cornerSize);
  // Top-right
  ctx.fillRect(width - 36 - cornerSize, 36, cornerSize, 4);
  ctx.fillRect(width - 40, 36, 4, cornerSize);
  // Bottom-left
  ctx.fillRect(36, height - 40, cornerSize, 4);
  ctx.fillRect(36, height - 36 - cornerSize, 4, cornerSize);
  // Bottom-right
  ctx.fillRect(width - 36 - cornerSize, height - 40, cornerSize, 4);
  ctx.fillRect(width - 40, height - 36 - cornerSize, 4, cornerSize);

  // 3. Header
  ctx.textAlign = "center";

  // Brand Eyebrow
  ctx.font = "bold 20px 'Cinzel', 'Playfair Display', serif, sans-serif";
  ctx.fillStyle = "#f59e0b";
  ctx.letterSpacing = "6px";
  ctx.fillText("✨ C U N F A S H I O N ✨", width / 2, 120);

  // Main Title
  ctx.font = "900 48px 'Cinzel', 'Playfair Display', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.letterSpacing = "2px";
  ctx.fillText(title, width / 2, 185);

  // Subtitle
  ctx.font = "500 22px 'Montserrat', sans-serif";
  ctx.fillStyle = "#a8a29e";
  ctx.letterSpacing = "1px";
  ctx.fillText(
    `Curated Wardrobe Collection • ${items.length} Selected Pieces`,
    width / 2,
    225
  );

  // Divider Line
  ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 255);
  ctx.lineTo(width / 2 + 180, 255);
  ctx.stroke();

  // 4. Products Grid Rendering
  // Select up to 6 items to display gracefully
  const displayItems = items.slice(0, 6);
  const itemCount = displayItems.length;

  let cols = 2;
  let rows = 2;

  if (itemCount === 1) {
    cols = 1;
    rows = 1;
  } else if (itemCount <= 2) {
    cols = 2;
    rows = 1;
  } else if (itemCount <= 4) {
    cols = 2;
    rows = 2;
  } else {
    cols = 2;
    rows = 3;
  }

  const gridLeft = 80;
  const gridTop = 290;
  const gridWidth = width - 160;
  const gridHeight = height - 510;

  const gapX = 28;
  const gapY = 28;

  const cardWidth = (gridWidth - (cols - 1) * gapX) / cols;
  const cardHeight = (gridHeight - (rows - 1) * gapY) / rows;

  // Pre-load images in parallel
  const loadedImages = await Promise.all(
    displayItems.map((it) => loadImageSafe(it.img))
  );

  for (let i = 0; i < itemCount; i++) {
    const item = displayItems[i];
    const img = loadedImages[i];

    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);

    const x = gridLeft + colIndex * (cardWidth + gapX);
    const y = gridTop + rowIndex * (cardHeight + gapY);

    // Draw Card Background
    ctx.save();
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 22);
    ctx.fillStyle = "rgba(28, 25, 23, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(68, 64, 60, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Image Area
    const imgPadding = 12;
    const imgX = x + imgPadding;
    const imgY = y + imgPadding;
    const imgW = cardWidth - imgPadding * 2;
    const imgH = cardHeight - 110;

    ctx.save();
    drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 16);
    ctx.clip();

    if (img) {
      // Draw image cover
      const imgAspect = img.width / img.height;
      const targetAspect = imgW / imgH;
      let drawW = imgW;
      let drawH = imgH;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > targetAspect) {
        drawW = imgH * imgAspect;
        offsetX = -(drawW - imgW) / 2;
      } else {
        drawH = imgW / imgAspect;
        offsetY = -(drawH - imgH) / 2;
      }

      ctx.drawImage(img, imgX + offsetX, imgY + offsetY, drawW, drawH);
    } else {
      // Graceful Vector Fallback
      ctx.fillStyle = "#292524";
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.fillStyle = "#78716c";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👗", imgX + imgW / 2, imgY + imgH / 2 - 10);

      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#d6d3d1";
      ctx.fillText("Haute Couture Item", imgX + imgW / 2, imgY + imgH / 2 + 30);
    }
    ctx.restore();

    // Platform Badge Tag on Image
    const badgeText = item.platform === "Amazon" ? "Amazon US" : item.platform;
    ctx.save();
    ctx.font = "bold 13px sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 16;
    const badgeH = 24;
    const badgeX = imgX + 10;
    const badgeY = imgY + 10;

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, badgeX + 8, badgeY + 16);
    ctx.restore();

    // Item Info Below Image
    const infoY = y + cardHeight - 80;

    // Item Name
    ctx.save();
    ctx.textAlign = "left";
    ctx.font = "bold 17px sans-serif";
    ctx.fillStyle = "#f5f5f4";
    const cleanName = fitText(ctx, item.name, cardWidth - 32);
    ctx.fillText(cleanName, x + 16, infoY + 22);

    // Item Price & Action
    ctx.font = "900 22px sans-serif";
    ctx.fillStyle = "#f472b6"; // Haute Couture Pink/Gold
    ctx.fillText(item.price, x + 16, infoY + 56);

    if (item.discount) {
      const priceMetrics = ctx.measureText(item.price);
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "rgba(244, 114, 182, 0.3)";
      const discW = ctx.measureText(item.discount).width + 12;
      drawRoundedRect(ctx, x + 24 + priceMetrics.width, infoY + 40, discW, 20, 4);
      ctx.fillStyle = "rgba(244, 114, 182, 0.2)";
      ctx.fill();
      ctx.fillStyle = "#f472b6";
      ctx.fillText(item.discount, x + 30 + priceMetrics.width, infoY + 54);
    }

    ctx.restore();
  }

  // 5. Luxury Footer & Watermark
  const footerY = height - 160;

  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";

  // Scan & Shop Callout Box
  ctx.save();
  const boxW = 540;
  const boxH = 50;
  const boxX = (width - boxW) / 2;
  const boxY = footerY - 15;

  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 25);
  ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("✦  Khám Phá & Mua Sắm Tại CunFashion  ✦", width / 2, footerY + 16);
  ctx.restore();

  // Website URL
  ctx.font = "bold 22px 'Cinzel', serif, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("https://cunfashion.com/style-advisor", width / 2, footerY + 75);

  // Small Copyright
  ctx.font = "500 14px sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.fillText(
    "Haute Couture AI Fashion Styling Suite • Designed for Trendsetters",
    width / 2,
    footerY + 105
  );

  return canvas;
}

/**
 * Render lookbook canvas directly to a PNG Blob for download or sharing.
 */
export async function generateLookbookBlob(
  items: LookbookItem[],
  title?: string
): Promise<Blob> {
  const canvas = await renderLookbookCanvas(items, title);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to convert canvas to blob"));
      }
    }, "image/png");
  });
}

/**
 * Helper to download the generated Lookbook PNG directly in browser.
 */
export async function downloadLookbookImage(
  items: LookbookItem[],
  filename = "cunfashion-outfit-lookbook.png"
): Promise<void> {

  const blob = await generateLookbookBlob(items);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
