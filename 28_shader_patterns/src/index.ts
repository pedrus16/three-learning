import "./style.css";

import { GUI } from "lil-gui";
import {
  AmbientLight,
  BufferAttribute,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import koalaImage from "./assets/koala.jpg";
import fragment from "./shaders/test/fragment.frag";
import vertex from "./shaders/test/vertex.vert";


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

// Scene Setup
const textureLoader = new TextureLoader();
const texture = textureLoader.load(koalaImage);
const material = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uFrequency: { value: new Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new Color("orange") },
    uTexture: { value: texture },
  },
});

gui
  .add(material.uniforms.uFrequency.value, "x")
  .min(0)
  .max(20)
  .step(0.01)
  .name("frequencyX");
gui
  .add(material.uniforms.uFrequency.value, "y")
  .min(0)
  .max(20)
  .step(0.01)
  .name("frequencyY");

// Meshes
const gridResolution = 64;
const geometry = new PlaneGeometry(2, 2, gridResolution, gridResolution);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for (let i = 0; i < count; i++) randoms[i] = Math.random();
geometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));
const mesh = new Mesh(geometry, material);
scene.add(mesh);

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
camera.position.z = 5;
camera.position.y = 2;
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
