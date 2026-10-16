/**
 * Branding — kept in one place so it changes with a single edit.
 * The app is branded "Vocadex" only: no school name, crest or organisation is
 * referenced anywhere in the UI, so it can be used before formal authorisation.
 * The one exception is SCHOOL_DOMAIN, which is needed to build pupil email
 * addresses from class numbers.
 */

/**
 * Email domain pupils belong to — the only place the school's domain appears,
 * and only ever as part of an address (e.g. 211B0000@plkshs.edu.hk).
 * Override with NEXT_PUBLIC_SCHOOL_DOMAIN if you ever move domain.
 */
export const SCHOOL_DOMAIN =
  process.env.NEXT_PUBLIC_SCHOOL_DOMAIN || "plkshs.edu.hk";

/** Shown under the logo, in the sidebar and on the QR cards. */
export const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME || "Vocadex";

/** Traditional-Chinese name shown under the logo and in the sidebar. */
export const SCHOOL_NAME_ZH =
  process.env.NEXT_PUBLIC_SCHOOL_NAME_ZH || "英文詞彙練習平台";

/** Copyright line — bottom of the sidebar and every page footer. */
export const COPYRIGHT = "© Vocadex";

/** Traditional-Chinese copyright line. */
export const COPYRIGHT_ZH = "版權歸 Vocadex 所屬";

/** 211B0000 -> 211B0000@<school domain> ; already an email -> as-is */
export function toSchoolEmail(raw: string) {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return "";
  if (v.includes("@")) return v;
  return `${v}@${SCHOOL_DOMAIN}`;
}
