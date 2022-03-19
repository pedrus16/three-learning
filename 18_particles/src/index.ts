import "./style.css";

import { GUI } from "lil-gui";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import doorAOImage from "./assets/door/Door_Wood_001_ambientOcclusion.jpg";
import doorColorImage from "./assets/door/Door_Wood_001_basecolor.jpg";
import doorHeightImage from "./assets/door/Door_Wood_001_height.png";
import doorMetalnessImage from "./assets/door/Door_Wood_001_metallic.jpg";
import doorNormalImage from "./assets/door/Door_Wood_001_normal.jpg";
import doorAlphaImage from "./assets/door/Door_Wood_001_opacity.jpg";
import doorRoughnessImage from "./assets/door/Door_Wood_001_roughness.jpg";
import grassAO from "./assets/grass/GroundForest003_AO_1K.jpg";
import grassColor from "./assets/grass/GroundForest003_COL_VAR1_1K.jpg";
import grassDisplacement from "./assets/grass/GroundForest003_DISP_1K.jpg";
import grassGloss from "./assets/grass/GroundForest003_GLOSS_1K.jpg";
import grassNormal from "./assets/grass/GroundForest003_NRM_1K.jpg";
import particleImage from "./assets/particles/star_01.png";
import stoneAO from "./assets/stone/StoneBricksBeige015_AO_1K.jpg";
import stoneColor from "./assets/stone/StoneBricksBeige015_COL_1K.jpg";
import stoneDisplacement from "./assets/stone/StoneBricksBeige015_DISP_1K.jpg";
import stoneRoughness from "./assets/stone/StoneBricksBeige015_GLOSS_1K.jpg";
import stoneNormal from "./assets/stone/StoneBricksBeige015_NRM_1K.jpg";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  count: 50000,
  amplitude: 1,
  factorX: 1,
  factorZ: 1,
};

// Debug
const gui = new GUI().close();

// Scene Setup
const scene = new Scene();
const textureLoader = new TextureLoader();

const particlesGeometry = new BufferGeometry();
const particleTexture = textureLoader.load(particleImage);
const particlesMaterial = new PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  alphaMap: particleTexture,
  transparent: true,
  color: 0xffffff,
  // alphaTest: 0.001
  // depthTest: false,
  depthWrite: false,
  blending: AdditiveBlending,
  vertexColors: true,
});
const positions = new Float32Array(settings.count * 3);
const colors = new Float32Array(settings.count * 3);
for (let i = 0; i < settings.count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random();
}
particlesGeometry.setAttribute("position", new BufferAttribute(positions, 3));
particlesGeometry.setAttribute("color", new BufferAttribute(colors, 3));
const particles = new Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const cube = new Mesh(
  new BoxGeometry(2, 2, 2),
  new MeshBasicMaterial({ color: 0x0000ff })
);
// scene.add(cube);

gui
  .add(settings, "count")
  .min(0)
  .max(5000000)
  .step(1)
  .onChange((count) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(settings.count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
      colors[i] = Math.random();
    }
    particlesGeometry.setAttribute(
      "position",
      new BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  });

gui.add(particlesMaterial, "size").min(0).max(1);
gui.addColor(particlesMaterial, "color");

gui.add(settings, "amplitude").min(-10).max(10);
gui.add(settings, "factorX").min(-10).max(10);
gui.add(settings, "factorZ").min(-10).max(10);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 6;
camera.position.y = 4;
camera.position.x = -2;
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
  for (let i = 0; i < settings.count; i++) {
    const x = particlesGeometry.attributes.position.getX(i);
    const z = particlesGeometry.attributes.position.getZ(i);
    particlesGeometry.attributes.position.setY(
      i,
      (Math.sin(elapsedTimeSec + x * settings.factorX) +
        Math.sin(elapsedTimeSec + z * settings.factorZ)) *
        settings.amplitude
    );
  }
  particlesGeometry.attributes.position.needsUpdate = true;

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
