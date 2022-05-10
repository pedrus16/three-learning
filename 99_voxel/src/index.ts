import "./style.css";

import { GUI } from "lil-gui";
import Stats from "stats.js";
import {
  BackSide,
  BoxGeometry,
  DirectionalLight,
  GLSL3,
  InstancedMesh,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import teapot from "./assets/models/teapot.vox";
import fragment from "./shaders/volume/fragment.frag";
import vertex from "./shaders/volume/vertex.vert";
import voxelFragment from "./shaders/voxel/fragment.frag";
import voxelVertex from "./shaders/voxel/vertex.vert";
import { VXLData3DTexture } from "./voxel/VXLData3DTexture";
import { VXLLoader } from "./voxel/VXLLoader";
import { remapPalette } from "./voxel/VXLPointGeometry";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  envMapIntensity: 1.0,
  teamColorHue: 0,
};

// Debug
const gui = new GUI({ width: 250 });

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new Scene();
const textureLoader = new TextureLoader();

// Camera
// const camera = new OrthographicCamera(-20, 20, -20, 20, 0.1, 1000);
const camera = new PerspectiveCamera(60, size.width / size.height);
camera.position.x = 20;
camera.position.y = 20;
camera.position.z = 20;
scene.add(camera);

const UNITS = [
  /* SOVIET */
  { parts: ["smcv"] },
  { parts: ["htnk", "htnktur", "htnkbarl"] },
  { parts: ["ttnk", "ttnktur"] },
  { parts: ["mtnk", "mtnkbarl", "mtnktur"] },
  { parts: ["harv", "harvtur"] },
  { parts: ["htk", "htkbarl"] },
  { parts: ["flaktur"] },
  { parts: ["bpln"] },
  { parts: ["cdest"] },
  { parts: ["dred"] },
  { parts: ["hyd"] },
  { parts: ["laser"] },
  { parts: ["sub"] },
  { parts: ["trs"] },
  { parts: ["trucka"] },
  { parts: ["v3"] },
  { parts: ["zep"] },

  /* ALLIES */
  { parts: ["mcv"] },
  { parts: ["bfrt"] },
  { parts: ["gtgcanbarl", "gtgcantur"] },
  { parts: ["cmin"] },
  { parts: ["lcrf"] },
  { parts: ["falc"] },
  { parts: ["rtnk"] },
  { parts: ["tnkd"] },
  { parts: ["aegis"] },

  /* YURI */
  { parts: ["pcv"] },
  { parts: ["bsub"] },
  { parts: ["hovr"] },
  { parts: ["ltnk", "ltnktur"] },
  { parts: ["mind"] },
  { parts: ["smin"] },
  { parts: ["tele", "teletur"] },
  { parts: ["ytnk", "ytnktur"] },

  /* CIVILIANS */
  { parts: ["cona"] },
  { parts: ["cop"] },
  { parts: ["cplane"] },
  { parts: ["cruise"] },
  { parts: ["limo"] },
  { parts: ["pdplane"] },
  { parts: ["pick"] },
  { parts: ["propa"] },
  { parts: ["ptruck"] },
  { parts: ["tractor"] },
  { parts: ["tug"] },

  // { parts: ["1tnk", "1tnkbarl"] },
  // { parts: ["2tnk", "2tnktur", "2tnkbarl"] },
  // { parts: ["3tnk", "3tnktur", "3tnkbarl"] },
  // { parts: ["4tnk", "4tnktur", "4tnkbarl"] },
];

// Voxel Loader
// const voxLoader = new VOXLoader();
// voxLoader.load("./assets/models/monu10.vox", function (chunks) {
//   for (var i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];

//     const geometry = new BoxGeometry(1, 1, 1);
//     const data = new VOXData3DTexture(chunk);
//     const material = new ShaderMaterial({
//       glslVersion: GLSL3,
//       uniforms: {
//         uMap: { value: data },
//         uSize: {
//           value: new Vector3(chunk.size.x, chunk.size.z, chunk.size.y),
//         },
//         uThreshold: { value: 0.8 },
//         uResolutionMultiplier: { value: 4 },
//         uNormalSampling: { value: 4 },
//       },
//       vertexShader: vertex,
//       fragmentShader: fragment,
//       side: BackSide,
//     });

//     const volumeMesh = new Mesh(geometry, material);
//     scene.add(volumeMesh);

//     const pointGeometry = new VOXPointGeometry(chunk);
//     const pointMesh = new Points(
//       pointGeometry,
//       new PointsMaterial({
//         size: 0.02,
//         vertexColors: true,
//         format: RGBAFormat,
//       })
//     );
//     pointMesh.position.set(1, 0, 0);
//     scene.add(pointMesh);
//   }
// });

// VXL Loader
const vxlLoader = new VXLLoader();

const voxelMaterial = new ShaderMaterial({
  vertexColors: true,
  vertexShader: voxelVertex,
  fragmentShader: voxelFragment,
  uniforms: {
    uSize: { value: 100.0 * renderer.getPixelRatio() },
    uViewPos: { value: camera.position },
  },
  depthWrite: true,
  depthTest: true,
});

const ZEPS = [];
for (let i = 0; i < 100; i++) {
  ZEPS.push({ parts: ["zep"] });
}

const ROW_SIZE = Math.floor(Math.sqrt(UNITS.length));
const SPACING = 12;
// UNITS.forEach(({ parts }, index) => {
//   const unitScene = new Scene();
//   unitScene.position.set(
//     SPACING * ((index % ROW_SIZE) - ROW_SIZE * 0.5),
//     0,
//     (Math.floor(index / ROW_SIZE) - ROW_SIZE * 0.5) * SPACING
//   );
//   scene.add(unitScene);
//   parts.forEach((name) => {
//     vxlLoader.load(`./assets/models/vxl/${name}.vxl`, (data) => {
//       data.sections.forEach((section) => {
//         const geometry = new VXLPointGeometry(
//           section,
//           remapPalette(data.palette, data.paletteRemap, settings.teamColorHue)
//         );
//         const transformMatrix = section.transformMatrix;
//         const matrix = new Matrix4();
//         matrix.set(...transformMatrix, 0, 0, 0, 1);
//         geometry.applyMatrix4(matrix);
//         const mesh = new Points(geometry, voxelMaterial);
//         mesh.position.set(0, 0, 0);
//         unitScene.add(mesh);
//       });
//     });
//   });
// });

const zepScene = new Scene();
scene.add(zepScene);
const ZEP_SPACING = { x: 1, y: 1, z: 1 };
const ZEP_SIZE = 20;
console.log(`Unit count: ${ZEP_SIZE * ZEP_SIZE * ZEP_SIZE}`);
vxlLoader.load(`./assets/models/vxl/zep.vxl`, (data) => {
  const entities = [];
  const meshes = [];
  data.sections.forEach((section) => {
    const texture = new VXLData3DTexture(
      section,
      remapPalette(data.palette, data.paletteRemap, settings.teamColorHue)
    );
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new ShaderMaterial({
      glslVersion: GLSL3,
      uniforms: {
        uMap: { value: texture },
        uNormal: { value: texture.normal },
        uSize: {
          value: new Vector3(section.size.x, section.size.z, section.size.y),
        },
        uThreshold: { value: 0.8 },
        uResolutionMultiplier: { value: 1 },
        uNormalSampling: { value: 1 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: BackSide,
    });

    meshes.push(
      new InstancedMesh(geometry, material, ZEP_SIZE * ZEP_SIZE * ZEP_SIZE)
    );

    entities.push({ geometry, material });
  });

  const transform = new Object3D();

  for (let i = 0; i < ZEP_SIZE * ZEP_SIZE * ZEP_SIZE; i++) {
    transform.position.set(
      ((Math.floor(i / ZEP_SIZE) % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.x,
      ((i % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.y,

      (Math.floor(i / (ZEP_SIZE * ZEP_SIZE)) - ZEP_SIZE * 0.5) * ZEP_SPACING.z
    );
    transform.rotation.x = Math.random() * Math.PI;
    transform.rotation.y = Math.random() * Math.PI;
    transform.rotation.z = Math.random() * Math.PI;
    transform.updateMatrix();

    meshes.forEach((mesh) => mesh.setMatrixAt(i, transform.matrix));
  }

  meshes.forEach((mesh) => zepScene.add(mesh));

  // for (let i = 0; i < ZEP_SIZE * ZEP_SIZE * ZEP_SIZE; i++) {
  //   entities.forEach(({ geometry, material }) => {
  //     const mesh = new Mesh(geometry, material);
  //     mesh.rotation.set(
  //       Math.random() * Math.PI * 2,
  //       Math.random() * Math.PI * 2,
  //       Math.random() * Math.PI * 2
  //     );
  //     mesh.position.set(
  //       ((Math.floor(i / ZEP_SIZE) % ZEP_SIZE) - ZEP_SIZE * 0.5) *
  //         ZEP_SPACING.x,
  //       ((i % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.y,

  //       (Math.floor(i / (ZEP_SIZE * ZEP_SIZE)) - ZEP_SIZE * 0.5) * ZEP_SPACING.z
  //     );
  //     zepScene.add(mesh);
  //   });
  // }

  // const offsets = new Float32Array(ZEP_SIZE * ZEP_SIZE * ZEP_SIZE * 3);
  // for (let i = 0; i < ZEP_SIZE * ZEP_SIZE * ZEP_SIZE; i++) {
  //   const i3 = i * 3;
  //   offsets[i3 + 0] =
  //     ((Math.floor(i / ZEP_SIZE) % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.x;
  //   offsets[i3 + 1] = ((i % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.y;
  //   offsets[i3 + 2] =
  //     (Math.floor(i / (ZEP_SIZE * ZEP_SIZE)) - ZEP_SIZE * 0.5) * ZEP_SPACING.z;
  // }
  // geometries.forEach((geometry) =>
  //   geometry.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3))
  // );

  // const meshes = geometries.map(
  //   (geometry) => new Points(geometry, voxelMaterial)
  // );
  // zepScene.add(...meshes);
});

// Directional Light
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Renderer
renderer.setSize(size.width, size.height);

// Shadow type
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = sRGBEncoding;
// renderer.toneMapping = ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;

// Stats
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  stats.begin();
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects
  voxelMaterial.uniforms.uViewPos.value = camera.position;

  // if (mtnk) {
  // subMesh.rotation.set(0, elapsedTimeSec * 1, 0);
  // }

  renderer.render(scene, camera);
  lastRender = time;
  stats.end();
  window.requestAnimationFrame(renderLoop);
};

renderLoop(0);

window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
