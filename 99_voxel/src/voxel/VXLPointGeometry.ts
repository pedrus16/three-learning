import { BufferGeometry, Float32BufferAttribute } from "three";

import { Color, VXLLoader } from "./VXLLoader";


export class VXLPointGeometry extends BufferGeometry {
  constructor(
    section: ReturnType<VXLLoader["parse"]>["sections"][number],
    palette: Color[]
  ) {
    super();
    const data = section.data;
    const normalPalette = section.normalPalette;
    const scale = section.scale;
    const minBounds = section.minBounds;

    const vertices = [];
    const colors = [];
    const normals = [];

    for (let j = 0; j < data.length; j += 5) {
      const x = (data[j + 0] + minBounds.x) * scale;
      const y = (data[j + 1] + minBounds.y) * scale;
      const z = (data[j + 2] + minBounds.z) * scale;

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
