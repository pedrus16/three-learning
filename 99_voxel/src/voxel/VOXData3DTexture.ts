import { Data3DTexture, NearestFilter, RGBAFormat } from "three";


export class VOXData3DTexture extends Data3DTexture {
  constructor(chunk: {
    data: Uint8Array;
    size: { x: number; y: number; z: number };
    palette: number[];
  }) {
    const data = chunk.data;
    const size = chunk.size;
    const palette = chunk.palette;

    const offsety = size.x;
    const offsetz = size.x * size.z;

    const array = new Uint8Array(size.x * size.y * size.z * 4);

    for (let j = 0; j < data.length; j += 4) {
      const x = data[j + 0];
      const y = data[j + 2]; // Y and Z are reverted
      const z = data[j + 1];
      const c = data[j + 3];

      const index = x + y * offsety + z * offsetz;

      const hex = palette[c];
      const r = (hex >> 0) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = (hex >> 16) & 0xff;

      const i4 = index * 4;
      array[i4] = r;
      array[i4 + 1] = g;
      array[i4 + 2] = b;
      array[i4 + 3] = 255;
    }

    super(array, size.x, size.z, size.y);

    this.format = RGBAFormat;
    this.minFilter = NearestFilter;
    this.magFilter = NearestFilter;
    this.unpackAlignment = 1;
    this.needsUpdate = true;
  }
}
