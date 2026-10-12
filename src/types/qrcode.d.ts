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
  export function toBuffer(
    text: string,
    options?: {
      type?: "png" | "svg";
      margin?: number;
      width?: number;
      errorCorrectionLevel?: "L" | "M" | "Q" | "H";
      color?: { dark?: string; light?: string };
    }
  ): Promise<Buffer>;
  const _default: {
    toString: typeof toString;
    toDataURL: typeof toDataURL;
    toBuffer: typeof toBuffer;
  };
  export default _default;
}
