import "./style.css";

import { GUI } from "lil-gui";
import Stats from "stats.js";
import {
  BackSide,
  BoxGeometry,
  DirectionalLight,
  GLSL3,
  InstancedMesh,
  Matrix4,
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
  resolution: 1,
  clearColor: 0xb5d9b7,
};

// Debug
const gui = new GUI({ width: 250 });

const renderer = new WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new Scene();
const textureLoader = new TextureLoader();

// Camera
// const camera = new OrthographicCamera(-20, 20, -20, 20, 0.1, 1000);
const camera = new PerspectiveCamera(60, size.width / size.height);
camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 10;
scene.add(camera);

const UNITS: Array<{ parts: string[] }> = [
  /* SOVIET */
  { parts: ["smcv"] },
  { parts: ["harv", "harvtur"] },
  { parts: ["htnk", "htnktur", "htnkbarl"] },
  { parts: ["htk", "htktur"] },
  { parts: ["v3"] },
  { parts: ["v3rocket"] },
  { parts: ["mtnk", "mtnkbarl", "mtnktur"] },
  { parts: ["ttnk", "ttnktur"] },
  { parts: ["trucka"] },
  { parts: ["trs"] },
  { parts: ["sub"] },
  { parts: ["subt"] },
  { parts: ["cdest"] },
  { parts: ["asw"] },
  { parts: ["hyd"] },
  { parts: ["dred"] },
  { parts: ["dmisl"] },
  { parts: ["schp"] },
  { parts: ["schd", "schdtur"] },
  { parts: ["zep"] },
  { parts: ["zbomb"] },
  { parts: ["spyp"] },
  { parts: ["bpln"] },
  { parts: ["laser"] },
  { parts: ["flaktur"] },

  /* ALLIES */
  { parts: ["mcv"] },
  { parts: ["cmin"] },
  { parts: ["gtnk", "gtnktur", "gtnkbarl"] },
  { parts: ["fv", "fvtur"] },
  { parts: ["shad"] },
  { parts: ["rtnk"] },
  { parts: ["sref", "sreftur"] },
  { parts: ["bfrt"] },
  { parts: ["robo", "robotur"] },
  { parts: ["tnkd"] },
  { parts: ["lcrf"] },
  { parts: ["aegis"] },
  { parts: ["carrier"] },
  { parts: ["hornet"] },
  { parts: ["falc"] },
  { parts: ["beag"] },
  { parts: ["sam"] },
  { parts: ["gtgcanbarl", "gtgcantur"] },

  /* YURI */
  { parts: ["pcv"] },
  { parts: ["smin", "smintur"] },
  { parts: ["ltnk", "ltnktur"] },
  { parts: ["ytnk", "ytnktur"] },
  { parts: ["tele", "teletur"] },
  { parts: ["caos"] },
  { parts: ["mind"] },
  { parts: ["hovr"] },
  { parts: ["bsub"] },
  { parts: ["bsubmisl"] },
  { parts: ["disktur"] },
  { parts: ["yaggun"] },

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
  { parts: ["bcab"] },
  { parts: ["civp"] },
  { parts: ["ddbx"] },
  { parts: ["doly"] },
  { parts: ["euroc"] },
  { parts: ["jeep"] },
  { parts: ["stang"] },
  { parts: ["suvb"] },
  { parts: ["suvw"] },
  { parts: ["taxi"] },
  { parts: ["truckb"] },
  { parts: ["wini"] },
  { parts: ["ycab"] },
  { parts: ["ambu"] },
  { parts: ["bus"] },
  { parts: ["car"] },
  { parts: ["cblc"] },
  { parts: ["ftrk"] },
  { parts: ["tire"] },

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

const ROW_SIZE = Math.floor(Math.sqrt(UNITS.length));
const SPACING = 12;
const materials = [];
UNITS.forEach(({ parts }, index) => {
  const unitScene = new Scene();
  unitScene.position.set(
    SPACING * ((index % ROW_SIZE) - ROW_SIZE * 0.5),
    0,
    (Math.floor(index / ROW_SIZE) - ROW_SIZE * 0.5) * SPACING
  );
  scene.add(unitScene);
  parts.forEach((name) => {
    vxlLoader.load(`./assets/models/vxl/${name}.vxl`, (data) => {
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
              value: new Vector3(
                section.size.x,
                section.size.y,
                section.size.z
              ),
            },
            uViewPos: { value: camera.position },
            uThreshold: { value: 0.8 },
            uResolutionMultiplier: { value: 1 },
          },
          vertexShader: vertex,
          fragmentShader: fragment,
          side: BackSide,
        });
        materials.push(material);
        const maxSize = Math.max(
          section.size.x,
          section.size.y,
          section.size.z
        );
        /* TODO Fix section position */
        const transformMatrix = section.transformMatrix;
        const matrix = new Matrix4();
        // matrix.set(...transformMatrix, 0, 0, 0, 1);
        // matrix.scale(
        //   new Vector3(
        //     maxSize * section.scale,
        //     maxSize * section.scale,
        //     maxSize * section.scale
        //   )
        // );
        const mesh = new InstancedMesh(geometry, material, 1);
        mesh.setMatrixAt(0, matrix);

        mesh.scale.set(
          maxSize * section.scale,
          maxSize * section.scale,
          maxSize * section.scale
        );
        mesh.position.set(
          (section.size.x * 0.5 + section.minBounds.x) * section.scale,
          (section.size.y * 0.5 + section.minBounds.y) * section.scale, //section.minBounds.y * section.scale,
          (section.size.z * 0.5 + section.minBounds.z) * section.scale
        );
        unitScene.add(mesh);

        /* BOUNDS DEBUG */
        // const debugMesh = new Mesh(
        //   geometry,
        //   new MeshBasicMaterial({ wireframe: true, color: 0xff00ff })
        // );
        // const debugMatrix = new Matrix4();
        // mesh.getMatrixAt(0, debugMatrix);
        // debugMesh.applyMatrix4(debugMatrix);
        // debugMesh.scale.copy(mesh.scale);
        // debugMesh.position.copy(mesh.position);
        // unitScene.add(debugMesh);
      });
    });
  });
});

// const unitParts = ["mtnk", "mtnkbarl", "mtnktur"];
// const unitScene = new Scene();
// scene.add(unitScene);
// unitParts.forEach((name) => {
//   vxlLoader.load(`./assets/models/vxl/${name}.vxl`, (data) => {
//     data.sections.forEach((section) => {
//       const texture = new VXLData3DTexture(
//         section,
//         remapPalette(data.palette, data.paletteRemap, settings.teamColorHue)
//       );
//       const geometry = new BoxGeometry(1, 1, 1);
//       const material = new ShaderMaterial({
//         glslVersion: GLSL3,
//         uniforms: {
//           uMap: { value: texture },
//           uNormal: { value: texture.normal },
//           uSize: {
//             value: new Vector3(section.size.x, section.size.y, section.size.z),
//           },
//           uThreshold: { value: 0.8 },
//           uResolutionMultiplier: { value: 1 },
//         },
//         vertexShader: vertex,
//         fragmentShader: fragment,
//         side: BackSide,
//       });
//       const transformMatrix = section.transformMatrix;
//       const matrix = new Matrix4();
//       matrix.set(...transformMatrix, 0, 0, 0, 1);
//       const maxSize = Math.max(section.size.x, section.size.y, section.size.z);
//       const mesh = new InstancedMesh(geometry, material, 1);
//       mesh.setMatrixAt(0, matrix);
//       mesh.scale.set(
//         maxSize * section.scale,
//         maxSize * section.scale,
//         maxSize * section.scale
//       );
//       mesh.position.set(
//         (section.size.x * 0.5 + section.minBounds.x) * section.scale,
//         (section.size.y * 0.5 + section.minBounds.y) * section.scale, //section.minBounds.y * section.scale,
//         (section.size.z * 0.5 + section.minBounds.z) * section.scale
//       );
//       unitScene.add(mesh);

//       /* BOUNDS DEBUG */
//       // unitScene.add(
//       //   new Mesh(
//       //     new BoxGeometry(
//       //       section.size.x * section.scale,
//       //       section.size.y * section.scale,
//       //       section.size.z * section.scale
//       //     ),
//       //     new MeshBasicMaterial({ wireframe: true, color: 0xff00ff })
//       //   )
//       // );
//     });
//   });
// });

// vxlLoader.load(`./assets/models/vxl/sam.vxl`, (data) => {
//   const entities = [];
//   const meshes = [];
//   data.sections.forEach((section) => {
//     const texture = new VXLData3DTexture(
//       section,
//       remapPalette(data.palette, data.paletteRemap, settings.teamColorHue)
//     );
//     const geometry = new BoxGeometry(1, 1, 1);
//     const material = new ShaderMaterial({
//       glslVersion: GLSL3,
//       uniforms: {
//         uMap: { value: texture },
//         uNormal: { value: texture.normal },
//         uSize: {
//           value: new Vector3(section.size.x, section.size.y, section.size.z),
//         },
//         uThreshold: { value: 0.8 },
//         uResolutionMultiplier: { value: 1 },
//       },
//       vertexShader: vertex,
//       fragmentShader: fragment,
//       side: BackSide,
//     });

//     gui
//       .add(settings, "resolution")
//       .min(0.01)
//       .max(16)
//       .step(0.05)
//       .onChange(
//         (resolution) =>
//           (material.uniforms.uResolutionMultiplier.value = resolution)
//       );

//     meshes.push(
//       new InstancedMesh(geometry, material, ZEP_SIZE * ZEP_SIZE * ZEP_SIZE)
//     );

//     entities.push({ geometry, material });
//   });

//   const transform = new Object3D();

//   for (let i = 0; i < ZEP_SIZE * ZEP_SIZE * ZEP_SIZE; i++) {
//     transform.position.set(
//       ((Math.floor(i / ZEP_SIZE) % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.x,
//       ((i % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.y,

//       (Math.floor(i / (ZEP_SIZE * ZEP_SIZE)) - ZEP_SIZE * 0.5) * ZEP_SPACING.z
//     );
//     // transform.rotation.x = Math.random() * Math.PI;
//     // transform.rotation.y = Math.random() * Math.PI;
//     // transform.rotation.z = Math.random() * Math.PI;
//     transform.updateMatrix();

//     meshes.forEach((mesh) => mesh.setMatrixAt(i, transform.matrix));
//   }

//   meshes.forEach((mesh) => zepScene.add(mesh));
// });

/* PERFORMANCE TEST */
// const zepScene = new Scene();
// scene.add(zepScene);
// const ZEP_SPACING = { x: 1, y: 1, z: 1 };
// const ZEP_SIZE = 0;
// console.log(`Unit count: ${ZEP_SIZE * ZEP_SIZE * ZEP_SIZE}`);
// vxlLoader.load(`./assets/models/vxl/sam.vxl`, (data) => {
//   const entities = [];
//   const meshes = [];
//   data.sections.forEach((section) => {
//     const texture = new VXLData3DTexture(
//       section,
//       remapPalette(data.palette, data.paletteRemap, settings.teamColorHue)
//     );
//     const geometry = new BoxGeometry(1, 1, 1);
//     const material = new ShaderMaterial({
//       glslVersion: GLSL3,
//       uniforms: {
//         uMap: { value: texture },
//         uNormal: { value: texture.normal },
//         uSize: {
//           value: new Vector3(section.size.x, section.size.y, section.size.z),
//         },
//         uThreshold: { value: 0.8 },
//         uResolutionMultiplier: { value: 1 },
//       },
//       vertexShader: vertex,
//       fragmentShader: fragment,
//       side: BackSide,
//     });

//     gui
//       .add(settings, "resolution")
//       .min(0.01)
//       .max(16)
//       .step(0.05)
//       .onChange(
//         (resolution) =>
//           (material.uniforms.uResolutionMultiplier.value = resolution)
//       );

//     meshes.push(
//       new InstancedMesh(geometry, material, ZEP_SIZE * ZEP_SIZE * ZEP_SIZE)
//     );

//     entities.push({ geometry, material });
//   });

//   const transform = new Object3D();

//   for (let i = 0; i < ZEP_SIZE * ZEP_SIZE * ZEP_SIZE; i++) {
//     transform.position.set(
//       ((Math.floor(i / ZEP_SIZE) % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.x,
//       ((i % ZEP_SIZE) - ZEP_SIZE * 0.5) * ZEP_SPACING.y,

//       (Math.floor(i / (ZEP_SIZE * ZEP_SIZE)) - ZEP_SIZE * 0.5) * ZEP_SPACING.z
//     );
//     // transform.rotation.x = Math.random() * Math.PI;
//     // transform.rotation.y = Math.random() * Math.PI;
//     // transform.rotation.z = Math.random() * Math.PI;
//     transform.updateMatrix();

//     meshes.forEach((mesh) => mesh.setMatrixAt(i, transform.matrix));
//   }

//   meshes.forEach((mesh) => zepScene.add(mesh));
// });

// Directional Light
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

// const axesHelper = new AxesHelper(5);
// scene.add(axesHelper);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
renderer.setSize(size.width, size.height);
renderer.setClearColor(settings.clearColor);

gui
  .addColor(settings, "clearColor")
  .onChange((color) => renderer.setClearColor(color));

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
  materials.forEach(
    (material) => (material.uniforms.uViewPos.value = camera.position)
  );

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
