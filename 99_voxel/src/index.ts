import "./style.css";

import { GUI } from "lil-gui";
import Stats from "stats.js";
import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  DirectionalLight,
  GLSL3,
  Mesh,
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
import { VOXLoader } from "three/examples/jsm/loaders/VOXLoader";

import teapot from "./assets/models/teapot.vox";
import fragment from "./shaders/volume/fragment.frag";
import vertex from "./shaders/volume/vertex.vert";
import { VOXData3DTexture } from "./voxel/VOXData3DTexture.ts";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  envMapIntensity: 1.0,
};

// Debug
const gui = new GUI({ width: 250 });

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new Scene();
const textureLoader = new TextureLoader();

// Voxel Loader
var loader = new VOXLoader();
loader.load("./assets/models/monu10.vox", function (chunks) {
  for (var i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const geometry = new BoxGeometry(1, 1, 1);
    const data = new VOXData3DTexture(chunk);

    console.log(chunk.size);

    const material = new ShaderMaterial({
      glslVersion: GLSL3,
      uniforms: {
        uMap: { value: data },
        uSize: { value: new Vector3(chunk.size.x, chunk.size.z, chunk.size.y) },
        uThreshold: { value: 0.8 },
        uResolutionMultiplier: { value: 2 },
        uNormalSampling: { value: 2 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: BackSide,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
  }
});

// Directional Light
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

// Camera
const camera = new PerspectiveCamera(60, size.width / size.height);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
renderer.setSize(size.width, size.height);

// Shadow type
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

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
