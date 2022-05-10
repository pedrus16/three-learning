import { Data3DTexture, NearestFilter, RGBAFormat } from "three";

import { Color, VXLLoader } from "./VXLLoader";


export class VXLData3DTexture extends Data3DTexture {
  public normal: Data3DTexture;

  constructor(
    section: ReturnType<VXLLoader["parse"]>["sections"][number],
    palette: Color[]
  ) {
    const data = section.data;
    const normalPalette = section.normalPalette;
    const scale = section.scale;
    const minBounds = section.minBounds;
    const size = section.size;

    const offsety = size.x;
    const offsetz = size.x * size.z;

    const array = new Uint8Array(size.x * size.y * size.z * 4);

    const normalArray = new Uint8Array(size.x * size.y * size.z * 4);

    for (let j = 0; j < data.length; j += 5) {
      const x = data[j + 0];
      const y = data[j + 1]; // Y and Z are reverted
      const z = data[j + 2];

      const c = data[j + 3]; // color palette index
      const n = data[j + 4]; // normal palette index

      const index = x + y * offsety + z * offsetz;

      const { r, g, b } = palette[c];

      const i4 = index * 4;
      array[i4 + 0] = r;
      array[i4 + 1] = g;
      array[i4 + 2] = b;
      array[i4 + 3] = 255;

      const normal = normalPalette[Math.min(n, normalPalette.length - 1)];
      normalArray[i4 + 0] = (normal.x * 0.5 + 0.5) * 255;
      normalArray[i4 + 1] = (normal.y * 0.5 + 0.5) * 255;
      normalArray[i4 + 2] = (normal.z * 0.5 + 0.5) * 255;
      normalArray[i4 + 2] = 255;
    }

    super(array, size.x, size.z, size.y);

    this.normal = new Data3DTexture(normalArray, size.x, size.z, size.y);
    this.normal.format = RGBAFormat;
    this.normal.minFilter = NearestFilter;
    this.normal.magFilter = NearestFilter;
    this.normal.unpackAlignment = 1;
    this.normal.needsUpdate = true;

    this.format = RGBAFormat;
    this.minFilter = NearestFilter;
    this.magFilter = NearestFilter;
    this.unpackAlignment = 1;
    this.needsUpdate = true;
  }
}
