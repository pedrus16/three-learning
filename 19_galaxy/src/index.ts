import "./style.css";

import { GUI } from "lil-gui";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PCFShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import particleImage from "./assets/particles/star_01.png";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  size: 0.04,
  count: 100000,
  radius: 4,
  branches: 3,
  spin: 2,
  randomness: 0.2,
  randomnessPower: 3,
  innerColor: 0xffc800,
  outerColor: 0x007bff,
};

// Debug
const gui = new GUI().close();

// Scene Setup
const scene = new Scene();
const textureLoader = new TextureLoader();

const particleTexture = textureLoader.load(particleImage);

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new BufferGeometry();

  const positions = new Float32Array(settings.count * 3);
  const colors = new Float32Array(settings.count * 3);

  const innerColor = new Color(settings.innerColor);
  const outerColor = new Color(settings.outerColor);

  for (let i = 0; i < settings.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * settings.radius;

    const spinAngle = radius * settings.spin;
    const brancheAngle =
      ((i % settings.branches) / settings.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), settings.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      settings.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), settings.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      settings.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), settings.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      settings.randomness *
      radius;

    positions[i3] = Math.cos(brancheAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = 0 + randomY;
    positions[i3 + 2] = Math.sin(brancheAngle + spinAngle) * radius + randomZ;

    const mixedColor = innerColor.clone();
    mixedColor.lerp(outerColor, radius / settings.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new PointsMaterial({
    size: settings.size,
    sizeAttenuation: true,
    color: 0xffffff,
    alphaMap: particleTexture,
    transparent: true,
    // alphaTest: 0.001
    // depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new Points(geometry, material);
  scene.add(points);
};
generateGalaxy();

gui
  .add(settings, "count")
  .min(0)
  .max(5000000)
  .step(100)
  .onChange(generateGalaxy);
gui.add(settings, "size").min(0).max(0.1).onChange(generateGalaxy);
gui.add(settings, "radius").min(0).max(8).onChange(generateGalaxy);
gui.add(settings, "branches").min(1).max(50).step(1).onChange(generateGalaxy);
gui.add(settings, "spin").min(-5).max(5).onChange(generateGalaxy);
gui.add(settings, "randomness").min(0).max(10).onChange(generateGalaxy);
gui.add(settings, "randomnessPower").min(1).max(10).onChange(generateGalaxy);
gui.addColor(settings, "innerColor").onChange(generateGalaxy);
gui.addColor(settings, "outerColor").onChange(generateGalaxy);

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
