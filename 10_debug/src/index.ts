import "./style.css";
import {
  AxesHelper,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";
import gsap from "gsap";

const settings = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, { duration: 2, y: mesh.rotation.y + Math.PI * 2 });
  },
};

// Scene
const scene = new Scene();

// Object
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: settings.color });
const mesh = new Mesh(geometry, material);
scene.add(mesh);

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

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Debug
const gui = new GUI({ width: 250 });
gui.add(mesh.position, "x").min(-2).max(2).step(0.25);
gui.add(mesh.position, "y").min(-2).max(2).step(0.25);
gui.add(mesh, "visible");
gui
  .addColor(settings, "color")
  .onChange(() => material.color.set(settings.color));
gui.add(material, "wireframe");
gui.add(settings, "spin");
