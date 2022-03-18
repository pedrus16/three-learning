import "./style.css";
import {
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
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
  TextureLoader,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
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

// Scene
const scene = new Scene();

// Textures
const textureLoader = new TextureLoader();

const colorTexture = textureLoader.load(colorImage);
const alphaTexture = textureLoader.load(alphaImage);
const heightTexture = textureLoader.load(heightImage);
const normalTexture = textureLoader.load(normalImage);
const ambientOcclusionTexture = textureLoader.load(ambientOcclusionImage);
const metalnessTexture = textureLoader.load(metalnessImage);
const roughnessTexture = textureLoader.load(roughnessImage);
const matcapTexture = textureLoader.load(matcapImage);

const cubeTextureLoader = new CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([nx, ny, nz, px, py, pz]);

// Object
const materials = {
  basic: new MeshBasicMaterial({
    map: colorTexture,
    transparent: true,
    alphaMap: alphaTexture,
  }),
  normal: new MeshNormalMaterial(),
  matcap: new MeshMatcapMaterial({ matcap: matcapTexture }),
  depth: new MeshDepthMaterial(),
  lambert: new MeshLambertMaterial(),
  phong: new MeshPhongMaterial(),
  toon: new MeshToonMaterial(),
  standard: new MeshStandardMaterial({
    map: colorTexture,
    aoMap: ambientOcclusionTexture,
    displacementMap: heightTexture,
    displacementScale: 0.1,
    metalnessMap: metalnessTexture,
    roughnessMap: roughnessTexture,
    normalMap: normalTexture,
    alphaMap: alphaTexture,
    transparent: true,
    envMap: environmentMapTexture,
  }),
};

const settings: { material: Material; [key: string]: unknown } = {
  material: materials.basic,
  color: 0xffffff,
  wireframe: false,
  transparent: true,
  opacity: 1,
  side: FrontSide,
  flatShading: false,
  shininess: 100,
  specular: 0xffffff,
  metalness: 0.45,
  roughness: 0.65,
  ambientOcclusionIntensity: 1,
  displacementScale: 0.1,
  normalScale: 1,
};

const sphere = new Mesh(new SphereGeometry(0.5, 128, 128), settings.material);
sphere.position.x = -1.5;

const plane = new Mesh(new PlaneGeometry(1, 1, 128, 128), settings.material);

const torus = new Mesh(
  new TorusGeometry(0.3, 0.2, 128, 256),
  settings.material
);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

sphere.geometry.setAttribute(
  "uv2",
  new BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);
plane.geometry.setAttribute(
  "uv2",
  new BufferAttribute(plane.geometry.attributes.uv.array, 2)
);
torus.geometry.setAttribute(
  "uv2",
  new BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

// Lights
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector<HTMLElement>("canvas.webgl");

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);

const axesHelper = new AxesHelper(2);

scene.add(axesHelper);

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  controls.update();
  sphere.rotation.y = 0.1 * elapsedTimeSec;
  plane.rotation.y = 0.1 * elapsedTimeSec;
  torus.rotation.y = 0.1 * elapsedTimeSec;

  sphere.rotation.x = 0.15 * elapsedTimeSec;
  plane.rotation.x = 0.15 * elapsedTimeSec;
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

// window.addEventListener("dblclick", () => {
//   if (!document.fullscreenElement) {
//     canvas.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// });

// Debug
const gui = new GUI({ width: 250 });
gui.add(settings, "material", materials).onChange((material) => {
  sphere.material = material;
  plane.material = material;
  torus.material = material;
  console.log(settings.material);
});
gui
  .addColor(settings, "color")
  .onChange((color) =>
    (settings.material as MeshBasicMaterial).color.set(color)
  );
gui
  .add(settings, "wireframe")
  .onChange(
    (wireframe) =>
      ((settings.material as MeshBasicMaterial).wireframe = wireframe)
  );
gui.add(settings, "transparent").onChange((transparent) => {
  settings.material.transparent = transparent;
  settings.material.needsUpdate = true;
});
gui
  .add(settings, "opacity")
  .min(0)
  .max(1)
  .onChange((opacity) => (settings.material.opacity = opacity));
gui
  .add(settings, "side", { FrontSide, BackSide, DoubleSide })
  .onChange((side) => (settings.material.side = side));

gui.add(settings, "flatShading").onChange((flatShading) => {
  (settings.material as MeshNormalMaterial).flatShading = flatShading;
  settings.material.needsUpdate = true;
});

const phongFolder = gui.addFolder("Phong");
phongFolder
  .add(settings, "shininess")
  .min(0)
  .max(1000)
  .onChange((shininess) => {
    (settings.material as MeshPhongMaterial).shininess = shininess;
  });
phongFolder.addColor(settings, "specular").onChange((color) => {
  (settings.material as MeshPhongMaterial).specular.set(color);
});

const standardFolder = gui.addFolder("Standard");
standardFolder
  .add(settings, "metalness")
  .min(0)
  .max(1)
  .onChange((metalness) => {
    (settings.material as MeshStandardMaterial).metalness = metalness;
  });
standardFolder
  .add(settings, "roughness")
  .min(0)
  .max(1)
  .onChange((roughness) => {
    (settings.material as MeshStandardMaterial).roughness = roughness;
  });
standardFolder
  .add(settings, "ambientOcclusionIntensity")
  .min(0)
  .max(1)
  .onChange((intensity) => {
    (settings.material as MeshStandardMaterial).aoMapIntensity = intensity;
  });
standardFolder
  .add(settings, "displacementScale")
  .min(0)
  .max(2)
  .onChange((scale) => {
    (settings.material as MeshStandardMaterial).displacementScale = scale;
  });
standardFolder
  .add(settings, "normalScale")
  .min(0)
  .max(10)
  .onChange((scale) => {
    (settings.material as MeshStandardMaterial).normalScale.set(scale, scale);
  });
