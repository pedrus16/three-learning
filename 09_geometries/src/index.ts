import "./style.css";
import {
  AxesHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene
const scene = new Scene();

// Object
const wireframeMaterial = new MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true,
});
const sphereGeometry = new SphereGeometry(1, 8, 8);
const bufferGeometry = new BufferGeometry();
const positions = new Float32Array([0, 0, 2, 0, 2, 0, 2, 0, 0]);
const positionAttribute = new BufferAttribute(positions, 3);
bufferGeometry.setAttribute("position", positionAttribute);
const sphereMesh = new Mesh(sphereGeometry, wireframeMaterial);
const triangleMesh = new Mesh(bufferGeometry, wireframeMaterial);
scene.add(sphereMesh);
scene.add(triangleMesh);

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
