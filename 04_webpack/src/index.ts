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

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas.webgl"),
});
renderer.setSize(size.width, size.height);

const axesHelper = new AxesHelper(2);

scene.add(axesHelper);

// mesh.position.set(0.7, -0.6, 1);
mesh.scale.set(0.25, 1, 0.25);

let lastRender = 0;
const SPEED = Math.PI * 2;
const clock = new Clock();
const renderLoop: FrameRequestCallback = (time) => {
  const elapsed = clock.getElapsedTime();
  const delta = lastRender - time;
  // mesh.rotation.set(
  //   mesh.rotation.x + SPEED * (delta / 1000),
  //   0,
  //   mesh.rotation.z + (SPEED * 0.25 * delta) / 1000
  // );

  // mesh.position.y = Math.cos(elapsed * 2) * 0.5;

  camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2;
  camera.position.z = -Math.cos(cursor.x * Math.PI * 2) * 2;
  camera.position.y = cursor.y * 3;
  camera.lookAt(mesh.position);

  renderer.render(scene, camera);
  lastRender = time;
  window.requestAnimationFrame(renderLoop);
};

renderLoop(0);

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = event.clientY / size.height - 0.5;
});
