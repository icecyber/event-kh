import { createCanvas, loadImage } from "canvas";
import { generateQRCodeBuffer } from "./qr";

export interface BadgeOptions {
  eventTitle: string;
  attendeeName: string;
  ticketType: string;
  eventDate: string;
  eventLocation?: string;
  backgroundImageURL?: string;
  badgeEnabled?: boolean;   // if false, always use default gradient
  badgeSize?: string;        // "A3" | "2*3" | "3*4"
  badgeOrientation?: string; // "horizontal" | "vertical"
}

/** Returns canvas pixel dimensions for a given size and orientation */
function getBadgeDimensions(size: string, orientation: string): { W: number; H: number } {
  const horiz: Record<string, { W: number; H: number }> = {
    "A3":  { W: 1189, H: 841  },
    "2*3": { W: 900,  H: 600  },
    "3*4": { W: 800,  H: 600  },
  };
  const vert: Record<string, { W: number; H: number }> = {
    "A3":  { W: 841,  H: 1189 },
    "2*3": { W: 600,  H: 900  },
    "3*4": { W: 600,  H: 800  },
  };
  const map = orientation === "vertical" ? vert : horiz;
  return map[size] ?? { W: 800, H: 600 };
}

/**
 * Renders a badge as a PNG Buffer.
 * Supports A3, 2*3, 3*4 in horizontal or vertical orientation.
 * Vertical: stacked layout (logo → ticket → name → event info → QR)
 * Horizontal: premium side-by-side layout (left text panel, right QR)
 */
export async function generateBadgePNG(opts: BadgeOptions): Promise<Buffer> {
  const size = opts.badgeSize ?? "3*4";
  const orientation = opts.badgeOrientation ?? "vertical";
  const { W, H } = getBadgeDimensions(size, orientation);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  const showCustomBg = opts.badgeEnabled !== false && opts.backgroundImageURL;
  if (showCustomBg) {
    try {
      const bg = await loadImage(opts.backgroundImageURL!);
      ctx.drawImage(bg, 0, 0, W, H);
      ctx.fillStyle = "rgba(15, 10, 60, 0.58)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      drawDefaultBackground(ctx, W, H);
    }
  } else {
    drawDefaultBackground(ctx, W, H);
  }

  // --- Generate QR code ---
  const qrBuf = await generateQRCodeBuffer(opts.eventTitle + "|" + opts.attendeeName);
  const qrImg = await loadImage(qrBuf);

  if (orientation === "vertical") {
    await drawVertical(ctx, W, H, qrImg, opts);
  } else {
    await drawHorizontal(ctx, W, H, qrImg, opts);
  }

  return canvas.toBuffer("image/png");
}

// ─── Vertical layout ──────────────────────────────────────────────────────────
async function drawVertical(
  ctx: any, W: number, H: number, qrImg: any, opts: BadgeOptions
) {
  const padX = Math.round(W * 0.08);
  const contentW = W - padX * 2;

  // Brand logo strip at top
  const logoY = Math.round(H * 0.055);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.roundRect(padX - 10, logoY - 18, 160, 34, 8);
  ctx.fill();
  ctx.font = `bold ${Math.round(W * 0.026)}px sans-serif`;
  ctx.fillStyle = "#a5f3fc";
  ctx.textAlign = "left";
  ctx.fillText("⚡ EventKH", padX, logoY);

  // Ticket type badge
  const badgeY = Math.round(H * 0.13);
  const ttFontSize = Math.round(W * 0.022);
  ctx.font = `bold ${ttFontSize}px sans-serif`;
  const ttW = ctx.measureText(opts.ticketType.toUpperCase()).width + 28;
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.roundRect(padX, badgeY, ttW, ttFontSize + 14, ttFontSize / 2 + 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(opts.ticketType.toUpperCase(), padX + 14, badgeY + ttFontSize + 2);

  // Attendee Name (large, center of card)
  const nameFontSize = Math.min(Math.round(W * 0.085), opts.attendeeName.length > 18 ? Math.round(W * 0.07) : Math.round(W * 0.085));
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, opts.attendeeName, padX, Math.round(H * 0.26), contentW, nameFontSize * 1.2);

  // Divider
  const divY = Math.round(H * 0.42);
  ctx.strokeStyle = "rgba(165,243,252,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, divY);
  ctx.lineTo(W - padX, divY);
  ctx.stroke();

  // Event title
  const titleFontSize = Math.round(W * 0.038);
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.fillStyle = "#e0e7ff";
  wrapText(ctx, opts.eventTitle, padX, Math.round(H * 0.475), contentW, titleFontSize * 1.3);

  // Date & Location
  const metaFontSize = Math.round(W * 0.028);
  ctx.font = `${metaFontSize}px sans-serif`;
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`📅  ${opts.eventDate}`, padX, Math.round(H * 0.57));
  if (opts.eventLocation) {
    ctx.fillText(`📍  ${opts.eventLocation}`, padX, Math.round(H * 0.57) + metaFontSize * 1.5);
  }

  // QR Code — bottom center
  const qrSize = Math.round(Math.min(W, H) * 0.28);
  const qrX = (W - qrSize) / 2;
  const qrY = Math.round(H * 0.66);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 42, 14);
  ctx.fill();

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = `bold ${Math.round(W * 0.022)}px sans-serif`;
  ctx.fillStyle = "#4f46e5";
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 24);

  // Watermark
  ctx.font = `${Math.round(W * 0.018)}px sans-serif`;
  ctx.fillStyle = "rgba(165,180,252,0.45)";
  ctx.textAlign = "center";
  ctx.fillText("Powered by EventKH • events.kh", W / 2, H - Math.round(H * 0.025));
  ctx.textAlign = "left";
}

// ─── Horizontal layout (premium side-by-side) ────────────────────────────────
async function drawHorizontal(
  ctx: any, W: number, H: number, qrImg: any, opts: BadgeOptions
) {
  const padX = 56;
  const qrColW = Math.round(W * 0.32);
  const textW = W - qrColW - padX * 2;

  // Brand logo
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.roundRect(padX - 16, 32, 180, 36, 8);
  ctx.fill();
  ctx.font = `bold ${Math.round(W * 0.022)}px sans-serif`;
  ctx.fillStyle = "#a5f3fc";
  ctx.textAlign = "left";
  ctx.fillText("⚡ EventKH", padX, 56);

  // Ticket type badge
  const ttFontSize = Math.round(W * 0.018);
  ctx.font = `bold ${ttFontSize}px sans-serif`;
  const ttW = ctx.measureText(opts.ticketType.toUpperCase()).width + 24;
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.roundRect(padX, 88, ttW, ttFontSize + 14, ttFontSize / 2 + 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(opts.ticketType.toUpperCase(), padX + 12, 88 + ttFontSize + 2);

  // Attendee name
  const nameFontSize = opts.attendeeName.length > 20
    ? Math.round(W * 0.048)
    : Math.round(W * 0.058);
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, opts.attendeeName, padX, Math.round(H * 0.34), textW, nameFontSize * 1.2);

  // Divider
  const divY = Math.round(H * 0.52);
  ctx.strokeStyle = "rgba(165,243,252,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, divY);
  ctx.lineTo(padX + textW - 20, divY);
  ctx.stroke();

  // Event title
  const titleFontSize = Math.round(W * 0.026);
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.fillStyle = "#e0e7ff";
  wrapText(ctx, opts.eventTitle, padX, divY + titleFontSize + 10, textW, titleFontSize * 1.3);

  // Date & Location
  const metaFontSize = Math.round(W * 0.021);
  const metaY = divY + titleFontSize * 2 + 28;
  ctx.font = `${metaFontSize}px sans-serif`;
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`📅  ${opts.eventDate}`, padX, metaY);
  if (opts.eventLocation) {
    ctx.fillText(`📍  ${opts.eventLocation}`, padX, metaY + metaFontSize * 1.6);
  }

  // Watermark
  ctx.font = `${Math.round(W * 0.015)}px sans-serif`;
  ctx.fillStyle = "rgba(165,180,252,0.45)";
  ctx.fillText("Powered by EventKH • events.kh", padX, H - Math.round(H * 0.05));

  // QR Code — right column, vertically centered
  const qrSize = Math.round(Math.min(H * 0.52, qrColW * 0.75));
  const qrX = W - qrColW + (qrColW - qrSize) / 2 - 20;
  const qrY = (H - qrSize) / 2 - 10;

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 52, 16);
  ctx.fill();

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = `bold ${Math.round(W * 0.014)}px sans-serif`;
  ctx.fillStyle = "#4f46e5";
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 28);
  ctx.textAlign = "left";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawDefaultBackground(ctx: any, W: number, H: number) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1e1b4b");
  grad.addColorStop(0.5, "#312e81");
  grad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(99,102,241,0.18)";
  ctx.beginPath();
  ctx.arc(W - Math.round(W * 0.1), Math.round(H * 0.1), Math.round(W * 0.15), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(139,92,246,0.13)";
  ctx.beginPath();
  ctx.arc(Math.round(W * 0.05), H - Math.round(H * 0.07), Math.round(W * 0.2), 0, Math.PI * 2);
  ctx.fill();
}

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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
