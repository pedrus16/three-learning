import "./style.css";

import { gsap } from "gsap";
import { GUI } from "lil-gui";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  SubtractiveBlending,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import wellModel from "./assets/models/well/well.glb";
import wellTexture from "./assets/models/well/baked.jpg";

import fliesFrag from "./shaders/flies/fragment.frag";
import fliesVertex from "./shaders/flies/vertex.vert";
import waterFrag from "./shaders/water/fragment.frag";
import waterVertex from "./shaders/water/vertex.vert";

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  clearColor: 0x9bd6f3,
};

// Debug
const gui = new GUI({ width: 250 });
// gui.addColor(settings, "clearColor").onChange((color) => {
//   renderer.setClearColor(color);
// });

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
const waterMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new Color(0xd270ff) },
    uColorEnd: { value: new Color(0x6274fe) },
  },
  vertexShader: waterVertex,
  fragmentShader: waterFrag,
});

gui.addColor(waterMaterial.uniforms.uColorStart, "value").name("inner color");
gui.addColor(waterMaterial.uniforms.uColorEnd, "value").name("outer color");

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

// Flies
const fliesGeometry = new BufferGeometry();
const fliesCount = 20;
const positionArray = new Float32Array(fliesCount * 3);
const scaleArray = new Float32Array(fliesCount);
const speedArray = new Float32Array(fliesCount);

const fliesOrigin = new Vector3(-0.1, 1.2, 0.3);
const fliesRadius = 0.5;
for (let i = 0; i < fliesCount; i++) {
  positionArray[i * 3 + 0] =
    (Math.random() - 0.5) * fliesRadius + fliesOrigin.x;
  positionArray[i * 3 + 1] = Math.random() * fliesRadius + fliesOrigin.y;
  positionArray[i * 3 + 2] =
    (Math.random() - 0.5) * fliesRadius + fliesOrigin.z;

  scaleArray[i] = 0.8 + Math.random() * 0.4;
  speedArray[i] = (1.0 + Math.random() * 2.0) * (Math.random() > 0.5 ? 1 : -1);
}

fliesGeometry.setAttribute("position", new BufferAttribute(positionArray, 3));
fliesGeometry.setAttribute("aScale", new BufferAttribute(scaleArray, 1));
fliesGeometry.setAttribute("aSpeed", new BufferAttribute(speedArray, 1));

const fliesMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 50.0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  transparent: true,
  depthWrite: false,
  vertexShader: fliesVertex,
  fragmentShader: fliesFrag,
});
const flies = new Points(fliesGeometry, fliesMaterial);
scene.add(flies);

// Renderer
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;
renderer.setClearColor(settings.clearColor);

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects
  fliesMaterial.uniforms.uTime.value = elapsedTimeSec;
  waterMaterial.uniforms.uTime.value = elapsedTimeSec;

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

  fliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
});
