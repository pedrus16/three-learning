import "./style.css";

// import draco3d from "draco3d?resource";
import { gsap } from "gsap";
import { GUI } from "lil-gui";
import {
  BoxGeometry,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import wellModel from "./assets/models/well/well.glb";
import wellTexture from "./assets/models/well/baked.jpg";

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {};

// Debug
const gui = new GUI({ width: 250 });

// Scene
const scene = new Scene();

/**
 * Overlay
 */
const overlayGeometry = new PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new ShaderMaterial({
  uniforms: {
    uAlpha: { value: 1.0 },
  },
  transparent: true,
  depthWrite: false,
  depthTest: false,
  vertexShader: `
     void main()
     {
       gl_Position = vec4(position, 1.0);
     }
   `,
  fragmentShader: `
     uniform float uAlpha;
     void main()
     {
       gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
     }
   `,
});
const overlay = new Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Loaders
 */
const loadingBarElement =
  document.querySelector<HTMLDivElement>(".loading-bar");
const loadingManager = new LoadingManager(
  () => {
    // Loaded
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 1, value: 0 });
    loadingBarElement.classList.add("hidden");
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.setProperty(
      "--progress",
      `${progressRatio * 100}%`
    );
  }
);

// Camera
const camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 100);
camera.position.x = 6;
camera.position.y = 4;
camera.position.z = 6;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Model
const textureLoader = new TextureLoader(loadingManager);
const bakedTexture = textureLoader.load(wellTexture);
bakedTexture.flipY = false;
bakedTexture.encoding = sRGBEncoding;
const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });
const lanternLightMaterial = new MeshBasicMaterial({ color: 0xffac32 });
const waterMaterial = new MeshBasicMaterial({ color: 0x3356e0 });

const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("./libs/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(wellModel, (gltf) => {
  scene.add(gltf.scene);

  const baked = gltf.scene.children.find(({ name }) => name === "baked");
  const lanternLight = gltf.scene.children.find(
    ({ name }) => name === "lanternLight"
  );
  const water = gltf.scene.children.find(({ name }) => name === "water");

  (baked as Mesh).material = bakedMaterial;
  (lanternLight as Mesh).material = lanternLightMaterial;
  (water as Mesh).material = waterMaterial;
});

// const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
// scene.add(mesh);

// Renderer
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects

  renderer.render(scene, camera);
  lastRender = time;
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
