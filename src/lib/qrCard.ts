import { SCHOOL_NAME } from "./school";
/**
 * Turns the plain QR PNG from the server into a printable card:
 * the code on top, the pupil's name underneath, plus the school footer.
 * Everything is drawn in the browser so the name uses the real Vocadex font.
 */

export type CardInput = {
  name: string;
  email: string;
  qrSrc: string;
};

const CARD_W = 720;
const QR_SIZE = 720;
const FOOTER_H = 190;
export const CARD_H = QR_SIZE + FOOTER_H;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the QR image"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const c = ctx as CanvasRenderingContext2D & {
    roundRect?: (x: number, y: number, w: number, h: number, r: number) => void;
  };
  ctx.beginPath();
  if (typeof c.roundRect === "function") {
    c.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Waits for the webfont so the printed name is not a fallback font. */
async function fontsReady() {
  try {
    const f = (
      document as Document & { fonts?: { ready: Promise<unknown> } }
    ).fonts;
    if (f?.ready) await f.ready;
  } catch {
    /* fonts API unavailable — draw anyway */
  }
}

/** Shrinks the font until the text fits the available width. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
  weight = 800
) {
  let size = start;
  while (size > min) {
    ctx.font = `${weight} ${size}px "Momo Trust Sans", "Comic Sans MS", "Comic Sans", system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return `${weight} ${size}px "Momo Trust Sans", "Comic Sans MS", "Comic Sans", system-ui, sans-serif`;
}

/** Draws one card and returns its data URL (PNG). */
export async function drawStudentCard(
  input: CardInput,
  opts: { scale?: number } = {}
): Promise<string> {
  const { name, email, qrSrc } = input;
  const scale = opts.scale ?? 1;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(scale, scale);

  await fontsReady();

  /* card background */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  /* QR on top — a clean white panel so it scans well */
  const qr = await loadImage(qrSrc);
  ctx.drawImage(qr, 0, 0, QR_SIZE, QR_SIZE);

  /* name plate — starts below the code so no QR pixel is ever covered */
  const plateY = QR_SIZE;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, plateY, CARD_W, FOOTER_H);

  const label = (name || email.split("@")[0]).trim();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  /* pupil name — the big, unmistakable line */
  ctx.fillStyle = "#1d2b4a";
  ctx.font = fitFont(ctx, label, CARD_W - 80, 64, 26);
  ctx.fillText(label, CARD_W / 2, plateY + 60);

  /* class number / email under it */
  ctx.fillStyle = "#6b6b6b";
  ctx.font = `600 26px "Momo Trust Sans", "Comic Sans MS", system-ui, sans-serif`;
  ctx.fillText(email, CARD_W / 2, plateY + 110);

  /* school footer */
  ctx.fillStyle = "#e8913a";
  roundRect(ctx, CARD_W / 2 - 150, plateY + 134, 300, 34, 17);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 20px "Momo Trust Sans", "Comic Sans MS", system-ui, sans-serif`;
  ctx.fillText(SCHOOL_NAME, CARD_W / 2, plateY + 152);

  return canvas.toDataURL("image/png");
}

/**
 * Builds one printable sheet holding every pupil's card — three per row.
 * Handy for printing the whole class in one go and cutting them out.
 */
export async function drawStudentSheet(
  rows: CardInput[],
  cols = 3
): Promise<string> {
  if (rows.length === 0) return "";
  const cardW = 420;
  const cardH = Math.round((CARD_H / CARD_W) * cardW);
  const pad = 28;
  const gap = 20;
  const sheetW = cols * cardW + gap * (cols - 1) + pad * 2;
  const lineCount = Math.ceil(rows.length / cols);
  const sheetH = lineCount * cardH + gap * (lineCount - 1) + pad * 2 + 60;

  const canvas = document.createElement("canvas");
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  await fontsReady();

  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, sheetW, sheetH);
  ctx.fillStyle = "#1d2b4a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 30px "Momo Trust Sans", "Comic Sans MS", system-ui, sans-serif`;
  ctx.fillText("Vocadex sign-in cards", sheetW / 2, 34);

  for (let i = 0; i < rows.length; i++) {
    const url = await drawStudentCard(rows[i], { scale: cardW / CARD_W });
    const img = await loadImage(url);
    const cx = pad + (i % cols) * (cardW + gap);
    const cy = 60 + Math.floor(i / cols) * (cardH + gap);
    ctx.drawImage(img, cx, cy, cardW, cardH);
  }

  return canvas.toDataURL("image/png");
}

/** Triggers a browser download for a data URL. */
export function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
