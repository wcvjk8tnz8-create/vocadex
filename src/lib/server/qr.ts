import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { PNG } from "pngjs";

/**
 * Student sign-in QR codes.
 *
 * The code holds ONLY the student's credentials as plain text:
 *     VDX|<email>|<password>
 * Scanning it fills in the class number and password and signs the pupil in —
 * no typing, no URL, nothing else is encoded.
 */

export { QR_PREFIX, credentialPayload, parseCredential } from "../credential";
import { credentialPayload } from "../credential";

function logoPath() {
  return path.join(process.cwd(), "public", "logo.png");
}

/** Draws the Vocadex mark in the middle of an already-rendered QR image. */
function overlayLogo(png: PNG, size = 600) {
  let logo: PNG;
  try {
    logo = PNG.sync.read(fs.readFileSync(logoPath()));
  } catch {
    return png; // no logo available — a plain QR still works
  }

  const target = Math.round(size * 0.23);
  const w = Math.round(target * (logo.width / Math.max(logo.width, logo.height)));
  const h = Math.round(target * (logo.height / Math.max(logo.width, logo.height)));
  const pad = Math.round(target * 0.09);
  const boxW = w + pad * 2;
  const boxH = h + pad * 2;
  const x0 = Math.round((png.width - boxW) / 2);
  const y0 = Math.round((png.height - boxH) / 2);

  // clear a white plate first so the logo sits on clean background
  for (let y = y0; y < y0 + boxH; y++) {
    for (let x = x0; x < x0 + boxW; x++) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      const i = (png.width * y + x) << 2;
      png.data[i] = 255;
      png.data[i + 1] = 255;
      png.data[i + 2] = 255;
      png.data[i + 3] = 255;
    }
  }

  // nearest-neighbour scale + alpha blend
  const lx0 = x0 + pad;
  const ly0 = y0 + pad;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.min(logo.width - 1, Math.floor((x / w) * logo.width));
      const sy = Math.min(logo.height - 1, Math.floor((y / h) * logo.height));
      const si = (logo.width * sy + sx) << 2;
      const dx = lx0 + x;
      const dy = ly0 + y;
      if (dx < 0 || dy < 0 || dx >= png.width || dy >= png.height) continue;
      const di = (png.width * dy + dx) << 2;
      const a = logo.data[si + 3] / 255;
      if (a === 0) continue;
      for (let c = 0; c < 3; c++) {
        png.data[di + c] = Math.round(
          logo.data[si + c] * a + png.data[di + c] * (1 - a)
        );
      }
      png.data[di + 3] = 255;
    }
  }
  return png;
}

/**
 * Renders the QR code as a PNG buffer with the Vocadex logo in the centre.
 * Error correction is set to H (30%) so the logo never breaks scanning.
 */
export async function studentQrPng(email: string, password: string, size = 720) {
  const payload = credentialPayload(email, password);
  const buf = await QRCode.toBuffer(payload, {
    type: "png",
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#1d2b4a", light: "#ffffff" },
  });
  const png = overlayLogo(PNG.sync.read(buf), size);
  return PNG.sync.write(png);
}
