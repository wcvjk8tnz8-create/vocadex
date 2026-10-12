declare module "pngjs" {
  export class PNG {
    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG, options?: { colorType?: number }): Buffer;
    };
    width: number;
    height: number;
    data: Buffer;
  }
}
