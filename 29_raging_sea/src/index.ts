import "./style.css";

import { GUI } from "lil-gui";
import {
  AmbientLight,
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

const settings = {
  depthColor: new Color("#00727a"),
  surfaceColor: new Color("#63cffd"),
};

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
    uBigWavesElevation: { value: 0.3 },
    uFrequency: { value: new Vector2(2, 1) },
    uBigWavesSpeed: { value: 1.0 },
    uTime: { value: 0 },
    uDepthColor: { value: new Color(settings.depthColor) },
    uSurfaceColor: { value: new Color(settings.surfaceColor) },
    uColorOffset: { value: 0.25 },
    uColorMultiplier: { value: 2 },

    uSmallWavesElevation: { value: 0.1 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 2 },
  },
});

gui
  .addColor(settings, "depthColor")
  .name("uDepthColor")
  .onChange((color) => material.uniforms.uDepthColor.value.set(color));

gui
  .addColor(material.uniforms.uSurfaceColor, "value")
  .name("uSurfaceColor")
  .onChange((color) => material.uniforms.uSurfaceColor.value.set(color));

gui
  .add(material.uniforms.uBigWavesElevation, "value")
  .min(-2)
  .max(2)
  .step(0.01)
  .name("bigWavesElevation");

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

gui
  .add(material.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("uBigWavesSpeed");

gui
  .add(material.uniforms.uColorOffset, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("uColorOffset");

gui
  .add(material.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("uColorMultiplier");

gui
  .add(material.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
gui
  .add(material.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
gui
  .add(material.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
gui
  .add(material.uniforms.uSmallIterations, "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");

// Meshes
const gridResolution = 1024;
// const geometry = new SphereGeometry(2, gridResolution, gridResolution);
// const geometry = new BoxGeometry(4, 4, 4, gridResolution, gridResolution);
const geometry = new PlaneGeometry(4, 4, gridResolution, gridResolution);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for (let i = 0; i < count; i++) randoms[i] = Math.random();
const mesh = new Mesh(geometry, material);
mesh.rotation.set(Math.PI * -0.5, 0, 0);
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
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;
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
