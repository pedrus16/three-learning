import "./style.css";
import {
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Clock,
  CubeTextureLoader,
  DoubleSide,
  FrontSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SplineCurve,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GUI } from "lil-gui";

import colorImage from "./assets/door/Door_Wood_001_basecolor.jpg";
import alphaImage from "./assets/door/Door_Wood_001_opacity.jpg";
import heightImage from "./assets/door/Door_Wood_001_height.png";
import normalImage from "./assets/door/Door_Wood_001_normal.jpg";
import ambientOcclusionImage from "./assets/door/Door_Wood_001_ambientOcclusion.jpg";
import metalnessImage from "./assets/door/Door_Wood_001_metallic.jpg";
import roughnessImage from "./assets/door/Door_Wood_001_roughness.jpg";
import matcapImage from "./assets/matcap/1.jpg";

import nx from "./assets/cubemap/nx.png";
import ny from "./assets/cubemap/ny.png";
import nz from "./assets/cubemap/nz.png";
import px from "./assets/cubemap/px.png";
import py from "./assets/cubemap/py.png";
import pz from "./assets/cubemap/pz.png";

import fontBlocks from "./assets/fonts/Kenney Blocks_Regular.json?resource";
import fontFuture from "./assets/fonts/Kenney Future Narrow_Regular.json?resource";
import fontHigh from "./assets/fonts/Kenney High_Regular.json?resource";
import fontPixel from "./assets/fonts/Kenney Pixel_Regular.json?resource";

function centerGeometry(geometry: BufferGeometry) {
  geometry.computeBoundingBox();
  geometry.center();
}

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const settings = {
  font: fontBlocks,
  text: "Spaghetti",
  bevelSize: 0.02,
  bevelSegments: 1,
  textWidth: 0.5,
};

const canvas = document.querySelector<HTMLElement>("canvas.webgl");

// Scene
const scene = new Scene();

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  controls.update();
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

// Texture
const textureLoader = new TextureLoader();
const matcapTexture = textureLoader.load(matcapImage);
const matcapMaterial = new MeshMatcapMaterial({ matcap: matcapTexture });

// Text
const fontLoader = new FontLoader();
const fontSettings = {
  size: 0.5,
  height: settings.textWidth,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: settings.bevelSize,
  bevelSize: settings.bevelSize,
  bevelOffset: 0,
  bevelSegments: settings.bevelSegments,
};
fontLoader.load(fontFuture, (font) => {
  const textGeometry = new TextGeometry(settings.text, {
    font: font,
    ...fontSettings,
  });
  const textMesh = new Mesh(textGeometry, matcapMaterial);
  centerGeometry(textMesh.geometry);
  scene.add(textMesh);

  gui.add(settings, "text").onChange((text) => {
    textMesh.geometry = new TextGeometry(text, {
      font: font,
      ...fontSettings,
      bevelSize: settings.bevelSize,
      bevelThickness: settings.bevelSize,
      bevelSegments: settings.bevelSegments,
      height: settings.textWidth,
    });
    centerGeometry(textMesh.geometry);
  });
  gui
    .add(settings, "textWidth")
    .min(0)
    .max(1)
    .onChange((width) => {
      textMesh.geometry = new TextGeometry(settings.text, {
        font: font,
        ...fontSettings,
        bevelSize: settings.bevelSize,
        bevelThickness: settings.bevelSize,
        bevelSegments: settings.bevelSegments,
        height: width,
      });
      centerGeometry(textMesh.geometry);
    });
  gui
    .add(settings, "bevelSize")
    .min(0)
    .max(0.1)
    .onChange((size) => {
      textMesh.geometry = new TextGeometry(settings.text, {
        font: font,
        ...fontSettings,
        bevelSegments: settings.bevelSegments,
        height: settings.textWidth,
        bevelSize: size,
        bevelThickness: size,
      });
      centerGeometry(textMesh.geometry);
    });

  gui
    .add(settings, "bevelSegments")
    .min(0)
    .max(32)
    .step(1)
    .onChange((segments) => {
      textMesh.geometry = new TextGeometry(settings.text, {
        font: font,
        ...fontSettings,
        bevelSize: settings.bevelSize,
        bevelThickness: settings.bevelSize,
        height: settings.textWidth,
        bevelSegments: segments,
      });
      centerGeometry(textMesh.geometry);
    });
});

// Falling spaghetti
const curve = new CatmullRomCurve3([
  new Vector3(0, 0, 0),
  new Vector3(0.15, -0.25, 0),
  new Vector3(0, -0.5, 0),
  new Vector3(0.15, -0.75, 0),
  new Vector3(0, -1, 0),
]);
const spaghettiGeometry = new TubeGeometry(curve, 32, 0.05, 8, false);
for (let i = 0; i < 100; i++) {
  const mesh = new Mesh(spaghettiGeometry, matcapMaterial);
  mesh.position.x = (Math.random() - 0.5) * 10;
  mesh.position.y = (Math.random() - 0.5) * 10;
  mesh.position.z = (Math.random() - 0.5) * 10;
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  const scale = Math.random() * 2 + 0.25;
  mesh.scale.set(scale, scale, scale);
  scene.add(mesh);
}

// Debug
const gui = new GUI({ width: 250 });
