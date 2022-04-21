import "./style.css";

import { GUI } from "lil-gui";
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  PCFShadowMap,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import particleImage from "./assets/particles/star_01.png";
import fragment from "./shaders/test/fragment.frag";
import vertex from "./shaders/test/vertex.vert";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  count: 100000,
  radius: 4,
  branches: 3,
  spin: 0,
  randomness: 0.2,
  randomnessPower: 0.5,
  innerColor: new Color(0xffc800),
  outerColor: new Color(0x007bff),
};

// Debug
const gui = new GUI({ width: 250 });

const renderer = new WebGLRenderer({ canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new Scene();

// Scene Setup
const textureLoader = new TextureLoader();

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
  const scales = new Float32Array(settings.count * 1);
  const randomness = new Float32Array(settings.count * 3);

  const innerColor = new Color(settings.innerColor);
  const outerColor = new Color(settings.outerColor);

  for (let i = 0; i < settings.count; i++) {
    const i3 = i * 3;

    const radius = 0.2 + Math.random() * settings.radius;

    const spinAngle = radius * settings.spin;
    const brancheAngle =
      ((i % settings.branches) / settings.branches) * Math.PI * 2;

    const randomAngle = Math.random() * Math.PI * 2;
    const randomLat = Math.random() * 2 - 1;
    const randomDist = Math.random() * radius;
    const randomX =
      Math.cos(randomAngle) *
      Math.sqrt(1 - Math.pow(randomLat, 2)) *
      randomDist *
      settings.randomnessPower;
    const randomY = randomLat * randomDist * settings.randomnessPower * 0.5;
    const randomZ =
      Math.sin(randomAngle) *
      Math.sqrt(1 - Math.pow(randomLat, 2)) *
      randomDist *
      settings.randomnessPower;

    positions[i3] = Math.cos(brancheAngle + spinAngle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(brancheAngle + spinAngle) * radius;

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    const mixedColor = innerColor.clone();
    mixedColor.lerp(outerColor, radius / settings.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Scale
    scales[i] = 0.1 + Math.random();
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aRandomness", new BufferAttribute(randomness, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new BufferAttribute(scales, 1));

  /**
   * Material
   */
  material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uSize: { value: 32.0 * renderer.getPixelRatio() },
      uTime: { value: 0.0 },
    },
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
gui.add(settings, "radius").min(0).max(8).onChange(generateGalaxy);
gui.add(settings, "branches").min(1).max(50).step(1).onChange(generateGalaxy);
gui.add(settings, "spin").min(-5).max(5).onChange(generateGalaxy);
gui.add(settings, "randomness").min(0).max(10).onChange(generateGalaxy);
gui.add(settings, "randomnessPower").min(1).max(10).onChange(generateGalaxy);
gui.addColor(settings, "innerColor").onChange(generateGalaxy);
gui.addColor(settings, "outerColor").onChange(generateGalaxy);
gui.add(material.uniforms.uSize, "value").min(0).max(64).step(1).name("size");

// Ambient Light
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional Light
const directionalLight = new DirectionalLight(0xfff3b8, 0.3);
directionalLight.castShadow = true;
directionalLight.visible = true;
directionalLight.position.set(4, 16, 8);
directionalLight.shadow.bias = 0.0001;
scene.add(directionalLight);
const directionalHelper = new DirectionalLightHelper(directionalLight, 0.2);
directionalHelper.visible = false;
scene.add(directionalHelper);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
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
// renderer.shadowMap.type = BasicShadowMap;
renderer.shadowMap.type = PCFShadowMap;
// renderer.shadowMap.type = PCFSoftShadowMap;
// renderer.shadowMap.type = VSMShadowMap;

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects
  material.uniforms.uTime.value = elapsedTimeSec;

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
