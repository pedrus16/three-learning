import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";


export class VOXPointGeometry extends BufferGeometry {
  constructor(chunk: {
    data: Uint8Array;
    size: { x: number; y: number; z: number };
    palette: number[];
  }) {
    super();
    const data = chunk.data;
    const size = chunk.size;
    const palette = chunk.palette;

    const vertices = [];
    const colors = [];

    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = new Vector3(
      size.x / maxSize,
      size.y / maxSize,
      size.z / maxSize
    );

    for (let j = 0; j < data.length; j += 4) {
      const x = (data[j + 0] / size.x - 0.5) * scale.x;
      const y = (data[j + 2] / size.z - 0.5) * scale.z; // Inverting Y and Z
      const z = (data[j + 1] / size.y - 0.5) * scale.y;
      const c = data[j + 3];

      vertices.push(...[x, y, z]);

      const hex = palette[c];
      const r = ((hex >> 0) & 0xff) / 0xff;
      const g = ((hex >> 8) & 0xff) / 0xff;
      const b = ((hex >> 16) & 0xff) / 0xff;

      colors.push(...[r, g, b]);
    }

    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setAttribute("color", new Float32BufferAttribute(colors, 3));
  }
}
