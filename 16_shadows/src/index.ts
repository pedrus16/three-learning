import "./style.css";
import {
  AmbientLight,
  AxesHelper,
  BackSide,
  BasicShadowMap,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CameraHelper,
  CatmullRomCurve3,
  Clock,
  CubeTextureLoader,
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  FrontSide,
  HemisphereLight,
  HemisphereLightHelper,
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
  PCFShadowMap,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  RectAreaLight,
  Scene,
  SphereGeometry,
  SplineCurve,
  SpotLight,
  SpotLightHelper,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  VSMShadowMap,
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

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

// Debug
const gui = new GUI({ width: 250 });

// Scene
const scene = new Scene();

// Scene Setup
const material = new MeshStandardMaterial({ roughness: 0.4 });

// Meshes
const ground = new Mesh(new PlaneGeometry(8, 8), material);
ground.receiveShadow = true;
ground.position.y = -1;
ground.rotation.x = -Math.PI * 0.5;
const sphere = new Mesh(new SphereGeometry(0.5, 16, 16), material);
sphere.castShadow = true;
sphere.position.x = -2;
const cube = new Mesh(new BoxGeometry(1, 1, 1), material);
cube.castShadow = true;
const torus = new Mesh(new TorusGeometry(0.5, 0.25, 16, 32), material);
torus.castShadow = true;
torus.position.x = 2;
scene.add(ground, sphere, cube, torus);

// Lights

const settings = {
  mapSize: 512,
  blur: 1,
  type: BasicShadowMap,
};
const shadowFolder = gui.addFolder("Shadows");
shadowFolder
  .add(settings, "mapSize", [32, 64, 128, 256, 512, 1024, 2048, 4096])
  .onChange((size) => {
    pointLight.shadow.mapSize.width = size;
    pointLight.shadow.mapSize.height = size;
    pointLight.shadow.map.dispose();
    pointLight.shadow.map = null;

    directionalLight.shadow.mapSize.width = size;
    directionalLight.shadow.mapSize.height = size;
    directionalLight.shadow.map.dispose();
    directionalLight.shadow.map = null;

    spotLight.shadow.mapSize.width = size;
    spotLight.shadow.mapSize.height = size;
    spotLight.shadow.map.dispose();
    spotLight.shadow.map = null;
  });

shadowFolder
  .add(settings, "blur")
  .min(0)
  .max(10)
  .onChange((blur) => {
    pointLight.shadow.radius = blur;
    directionalLight.shadow.radius = blur;
    spotLight.shadow.radius = blur;
  });

// Ambient Light
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const ambientFolder = gui.addFolder("Ambient Light");
ambientFolder.add(ambientLight, "visible");
ambientFolder.add(ambientLight, "intensity").min(0).max(1).step(0.001);
ambientFolder.addColor(ambientLight, "color");

// Point Light
const pointLight = new PointLight(0xffffff, 0.5);
pointLight.castShadow = true;
pointLight.visible = true;
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);
const pointHelper = new PointLightHelper(pointLight, 0.2);
pointHelper.visible = false;
scene.add(pointHelper);
const pointFolder = gui.addFolder("Point Light");
pointFolder.add(pointLight, "visible");
pointFolder.add(pointHelper, "visible").name("helper");
pointFolder.add(pointLight, "castShadow");
pointFolder.add(pointLight, "intensity").min(0).max(1).step(0.001);
pointFolder.addColor(pointLight, "color");
const pointPositionFolder = pointFolder.addFolder("Position");
pointPositionFolder.add(pointLight.position, "x").min(-4).max(4);
pointPositionFolder.add(pointLight.position, "y").min(-4).max(4);
pointPositionFolder.add(pointLight.position, "z").min(-4).max(4);

// Directional Light
const directionalLight = new DirectionalLight(0xff00ff, 0.3);
directionalLight.castShadow = true;
directionalLight.visible = true;
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);
const directionalHelper = new DirectionalLightHelper(directionalLight, 0.2);
directionalHelper.visible = false;
scene.add(directionalHelper);
const directionalFolder = gui
  .addFolder("Directional Light")
  .onChange(() => directionalShadowHelper.update());
directionalFolder.add(directionalLight, "visible");
directionalFolder.add(directionalHelper, "visible").name("helper");
directionalFolder.add(directionalLight, "castShadow");
directionalFolder.add(directionalLight, "intensity").min(0).max(1).step(0.001);
directionalFolder.addColor(directionalLight, "color");
const directionalPositionFolder = directionalFolder.addFolder("Position");
directionalPositionFolder.add(directionalLight.position, "x").min(-4).max(4);
directionalPositionFolder.add(directionalLight.position, "y").min(-4).max(4);
directionalPositionFolder.add(directionalLight.position, "z").min(-4).max(4);

// Hemisphere Light
const hemisphereLight = new HemisphereLight(0x00ffff, 0xff0000, 0.3);
hemisphereLight.visible = false;
scene.add(hemisphereLight);
const hemisphereHelper = new HemisphereLightHelper(hemisphereLight, 0.2);
hemisphereHelper.visible = false;
scene.add(hemisphereHelper);
const hemisphereFolder = gui.addFolder("Hemisphere Light");
hemisphereFolder.add(hemisphereLight, "visible");
hemisphereFolder.add(hemisphereHelper, "visible").name("helper");
hemisphereFolder.add(hemisphereLight, "intensity").min(0).max(1).step(0.001);
hemisphereFolder.addColor(hemisphereLight, "color");
hemisphereFolder.addColor(hemisphereLight, "groundColor");
const hemispherePositionFolder = hemisphereFolder.addFolder("Position");
hemispherePositionFolder.add(hemisphereLight.position, "x").min(-4).max(4);
hemispherePositionFolder.add(hemisphereLight.position, "y").min(-4).max(4);
hemispherePositionFolder.add(hemisphereLight.position, "z").min(-4).max(4);

// Rect Area Light
const rectAreaLight = new RectAreaLight(0x4e00ff, 2, 2, 2);
rectAreaLight.visible = false;
scene.add(rectAreaLight);
const rectAreaFolder = gui.addFolder("Rect Area Light");
rectAreaFolder.add(rectAreaLight, "visible");
rectAreaFolder.add(rectAreaLight, "intensity").min(0).max(2).step(0.001);
rectAreaFolder.add(rectAreaLight, "width").min(0).max(2).step(0.001);
rectAreaFolder.add(rectAreaLight, "height").min(0).max(2).step(0.001);
rectAreaFolder.addColor(rectAreaLight, "color");
const rectAreaPositionFolder = rectAreaFolder.addFolder("Position");
rectAreaPositionFolder.add(rectAreaLight.position, "x").min(-4).max(4);
rectAreaPositionFolder.add(rectAreaLight.position, "y").min(-4).max(4);
rectAreaPositionFolder.add(rectAreaLight.position, "z").min(-4).max(4);
const rectAreaRotationFolder = rectAreaFolder.addFolder("Rotation");
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "x")
  .min(0)
  .max(Math.PI * 2);
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "y")
  .min(0)
  .max(Math.PI * 2);
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "z")
  .min(0)
  .max(Math.PI * 2);

// Spot Light
const spotLight = new SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.castShadow = true;
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
scene.add(spotLight.target);
const spotHelper = new SpotLightHelper(spotLight);
spotHelper.visible = false;
scene.add(spotHelper);
const spotFolder = gui
  .addFolder("Spot Light")
  .onChange(() => spotHelper.update());
spotFolder.add(spotLight, "visible");
spotFolder.add(spotHelper, "visible").name("helper");
spotFolder.add(spotLight, "castShadow");
spotFolder.add(spotLight, "intensity").min(0).max(2).step(0.001);
spotFolder.addColor(spotLight, "color");
spotFolder
  .add(spotLight, "angle")
  .min(0)
  .max(Math.PI * 0.5);
spotFolder.add(spotLight, "decay").min(0).max(5);
spotFolder.add(spotLight, "distance").min(0).max(10);
spotFolder.add(spotLight, "penumbra").min(0).max(1);
const spotPositionFolder = spotFolder.addFolder("Position");
spotPositionFolder.add(spotLight.position, "x").min(-4).max(4);
spotPositionFolder.add(spotLight.position, "y").min(-4).max(4);
spotPositionFolder.add(spotLight.position, "z").min(-4).max(4);
const spotTargetFolder = spotFolder.addFolder("Target Position");
spotTargetFolder.add(spotLight.target.position, "x").min(-4).max(4);
spotTargetFolder.add(spotLight.target.position, "y").min(-4).max(4);
spotTargetFolder.add(spotLight.target.position, "z").min(-4).max(4);

// Shadows
const pointShadowHelper = new CameraHelper(pointLight.shadow.camera);
pointShadowHelper.visible = false;
pointLight.shadow.camera.far = 1;
scene.add(pointShadowHelper);

const directionalShadowHelper = new CameraHelper(
  directionalLight.shadow.camera
);
directionalShadowHelper.visible = false;
directionalLight.shadow.camera.near = 0;
directionalLight.shadow.camera.far = 6;
const cameraWidth = 4;
directionalLight.shadow.camera.top = cameraWidth;
directionalLight.shadow.camera.right = cameraWidth;
directionalLight.shadow.camera.bottom = -cameraWidth;
directionalLight.shadow.camera.left = -cameraWidth;
scene.add(directionalShadowHelper);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 5;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);

// Shadow type
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = BasicShadowMap;
renderer.shadowMap.type = PCFShadowMap;
// renderer.shadowMap.type = PCFSoftShadowMap;
// renderer.shadowMap.type = VSMShadowMap;

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  controls.update();
  // Update objects
  sphere.rotation.y = 0.1 * elapsedTimeSec;
  cube.rotation.y = 0.1 * elapsedTimeSec;
  torus.rotation.y = 0.1 * elapsedTimeSec;

  sphere.rotation.x = 0.15 * elapsedTimeSec;
  cube.rotation.x = 0.15 * elapsedTimeSec;
  torus.rotation.x = 0.15 * elapsedTimeSec;

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
