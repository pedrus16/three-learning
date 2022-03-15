import "./style.css";
import {
  AxesHelper,
  BoxGeometry,
  Clock,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene
const scene = new Scene();

// Object
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xff0000 });
const mesh = new Mesh(geometry, material);
scene.add(mesh);

// Sizes
const size = {
  width: 800,
  height: 600,
};
const cursor = { x: 0, y: 0 };

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

// mesh.position.set(0.7, -0.6, 1);
mesh.scale.set(0.25, 1, 0.25);

let lastRender = 0;
const SPEED = Math.PI * 2;
const clock = new Clock();
const renderLoop: FrameRequestCallback = (time) => {
  controls.update();
  renderer.render(scene, camera);
  lastRender = time;
  window.requestAnimationFrame(renderLoop);
};

renderLoop(0);
