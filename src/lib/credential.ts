/**
 * Student QR credential format — shared by the browser and the server, and
 * free of any Node-only imports so it can be used in client components too.
 *
 * The QR code stores plain text only:   VDX|email|password
 */

export const QR_PREFIX = "VDX";

export function credentialPayload(email: string, password: string) {
  return `${QR_PREFIX}|${String(email).trim().toLowerCase()}|${String(password || "")
    .trim()
    .toUpperCase()}`;
}

/** Reads back VDX|<email>|<password>; returns null for anything else. */
export function parseCredential(text: string) {
  const parts = String(text ?? "").trim().split("|");
  if (parts.length < 3) return null;
  const [prefix, email, password] = parts;
  if (prefix.trim().toUpperCase() !== QR_PREFIX) return null;
  if (!email.includes("@")) return null;
  return { email: email.trim().toLowerCase(), password: password.trim().toUpperCase() };
}
