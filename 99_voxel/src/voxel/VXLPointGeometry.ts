import { BufferGeometry, Float32BufferAttribute } from "three";


export class VXLPointGeometry extends BufferGeometry {
  constructor(chunk: {
    data: Uint8Array;
    size: { x: number; y: number; z: number };
    palette: Array<{ r: number; g: number; b: number }>;
    normalPalette: Array<{ x: number; y: number; z: number }>;
    scale: number;
    minBounds: { x: number; y: number; z: number };
    maxBounds: { x: number; y: number; z: number };
  }) {
    super();
    const data = chunk.data;
    const size = chunk.size;
    const palette = chunk.palette;
    const normalPalette = chunk.normalPalette;
    const scale = chunk.scale;
    const minBounds = chunk.minBounds;
    const maxBounds = chunk.maxBounds;

    const vertices = [];
    const colors = [];
    const normals = [];

    for (let j = 0; j < data.length; j += 5) {
      const x = (data[j + 0] + minBounds.y) * scale;
      const y = (data[j + 1] + minBounds.z) * scale;
      const z = (data[j + 2] + minBounds.x) * scale;

      const c = data[j + 3]; // color palette index
      const n = data[j + 4]; // normal palette index

      vertices.push(...[x, y, z]);

      const { r, g, b } = palette[c];

      colors.push(...[r / 256, g / 256, b / 256]);

      const normal = normalPalette[Math.min(n, normalPalette.length - 1)];
      normals.push(...[normal.x, normal.z, normal.y]);
    }

    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setAttribute("color", new Float32BufferAttribute(colors, 3));
    this.setAttribute("aNormal", new Float32BufferAttribute(normals, 3));
  }
}
