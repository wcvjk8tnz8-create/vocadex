declare module "qrcode" {
  export function toString(
    text: string,
    options?: {
      type?: "svg" | "terminal" | "utf8";
      margin?: number;
      width?: number;
      errorCorrectionLevel?: "L" | "M" | "Q" | "H";
      color?: { dark?: string; light?: string };
    }
  ): Promise<string>;
  export function toDataURL(text: string, options?: Record<string, unknown>): Promise<string>;
  const _default: { toString: typeof toString; toDataURL: typeof toDataURL };
  export default _default;
}
