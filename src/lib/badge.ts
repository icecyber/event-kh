import { createCanvas, loadImage, registerFont } from "canvas";
import { generateQRCodeBuffer } from "./qr";

export interface BadgeOptions {
  eventTitle: string;
  attendeeName: string;
  ticketType: string;
  eventDate: string;
  eventLocation?: string;
  backgroundImageURL?: string; // URL or local path
}

/**
 * Renders a badge as a PNG Buffer.
 * Size: 800x560 px — designed for A5 landscape.
 */
export async function generateBadgePNG(opts: BadgeOptions): Promise<Buffer> {
  const W = 800;
  const H = 560;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  if (opts.backgroundImageURL) {
    try {
      const bg = await loadImage(opts.backgroundImageURL);
      ctx.drawImage(bg, 0, 0, W, H);
      // Overlay so text is always readable
      ctx.fillStyle = "rgba(15, 10, 60, 0.55)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      drawDefaultBackground(ctx, W, H);
    }
  } else {
    drawDefaultBackground(ctx, W, H);
  }

  // --- Left content panel ---
  const padX = 56;
  const textW = W - 340; // leave right 280px for QR

  // EventKH logo / brand strip
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.roundRect(padX - 16, 32, 180, 36, 8);
  ctx.fill();

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#a5f3fc";
  ctx.fillText("⚡ EventKH", padX, 56);

  // Ticket type badge
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.roundRect(padX, 88, measureText(ctx, opts.ticketType, "bold 14px sans-serif") + 24, 28, 14);
  ctx.fill();
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(opts.ticketType.toUpperCase(), padX + 12, 107);

  // Attendee name
  ctx.font = `bold ${opts.attendeeName.length > 20 ? 36 : 44}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, opts.attendeeName, padX, 176, textW, 52);

  // Divider line
  ctx.strokeStyle = "rgba(165,243,252,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, 248);
  ctx.lineTo(padX + textW - 20, 248);
  ctx.stroke();

  // Event title
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#e0e7ff";
  wrapText(ctx, opts.eventTitle, padX, 284, textW, 26);

  // Date & location
  const metaY = 340;
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`📅  ${opts.eventDate}`, padX, metaY);
  if (opts.eventLocation) {
    ctx.fillText(`📍  ${opts.eventLocation}`, padX, metaY + 28);
  }

  // Bottom watermark
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "rgba(165,180,252,0.5)";
  ctx.fillText("Powered by EventKH • events.kh", padX, H - 28);

  // --- QR Code (right side) ---
  const qrBuf = await generateQRCodeBuffer(
    opts.eventTitle + "|" + opts.attendeeName
  );
  const qrImg = await loadImage(qrBuf);
  const qrSize = 210;
  const qrX = W - qrSize - 52;
  const qrY = (H - qrSize) / 2 - 10;

  // QR white card
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 52, 16);
  ctx.fill();

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "#4f46e5";
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 26);
  ctx.textAlign = "left";

  return canvas.toBuffer("image/png");
}

// ─── helpers ────────────────────────────────────────────────────────────────

function drawDefaultBackground(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  W: number,
  H: number
) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1e1b4b");
  grad.addColorStop(0.5, "#312e81");
  grad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.fillStyle = "rgba(99,102,241,0.18)";
  ctx.beginPath();
  ctx.arc(W - 80, 60, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(139,92,246,0.13)";
  ctx.beginPath();
  ctx.arc(40, H - 40, 160, 0, Math.PI * 2);
  ctx.fill();
}

function wrapText(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function measureText(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  text: string,
  font: string
): number {
  ctx.font = font;
  return ctx.measureText(text).width;
}
