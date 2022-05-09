import { BufferGeometry, Float32BufferAttribute } from "three";

import { Color, VXLLoader } from "./VXLLoader";


export function hueRotation(color: Color, hue: number) {
  const U = Math.cos((hue * Math.PI) / 180);
  const W = Math.sin((hue * Math.PI) / 180);

  const ret = { r: 0, g: 0, b: 0 };
  ret.r =
    (0.299 + 0.701 * U + 0.168 * W) * color.r +
    (0.587 - 0.587 * U + 0.33 * W) * color.g +
    (0.114 - 0.114 * U - 0.497 * W) * color.b;
  ret.g =
    (0.299 - 0.299 * U - 0.328 * W) * color.r +
    (0.587 + 0.413 * U + 0.035 * W) * color.g +
    (0.114 - 0.114 * U + 0.292 * W) * color.b;
  ret.b =
    (0.299 - 0.3 * U + 1.25 * W) * color.r +
    (0.587 - 0.588 * U - 1.05 * W) * color.g +
    (0.114 + 0.886 * U - 0.203 * W) * color.b;
  return ret;
}

export function remapPalette(
  palette: Color[],
  remapSection: { start: number; end: number },
  hue: number
) {
  return palette.map((color, index) => {
    return index >= remapSection.start && index <= remapSection.end
      ? hueRotation(color, hue)
      : color;
  });
}

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
