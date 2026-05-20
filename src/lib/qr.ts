import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL (PNG base64).
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}

/**
 * Generate a QR code as a raw Buffer (PNG).
 */
export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}

/**
 * Create a unique QR code string for a registration.
 */
export function createQRString(registrationId: string): string {
  return `EVENTKH-${registrationId}-${Date.now()}`;
}
