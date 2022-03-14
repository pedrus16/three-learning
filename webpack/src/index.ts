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

// Scene
const scene = new Scene();

// Object
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xff0000 });
const mesh = new Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas.webgl"),
});
renderer.setSize(sizes.width, sizes.height);

const axesHelper = new AxesHelper(2);

scene.add(axesHelper);

mesh.position.set(0.7, -0.6, 1);
mesh.scale.set(0.25, 1, 0.25);

let lastRender = 0;
const SPEED = Math.PI * 2;
const renderLoop: FrameRequestCallback = (time) => {
  const delta = time - lastRender;
  renderer.render(scene, camera);
  mesh.rotation.set(
    mesh.rotation.x + SPEED * (delta / 1000),
    0,
    mesh.rotation.z + (SPEED * 0.25 * delta) / 1000
  );
  lastRender = time;
  window.requestAnimationFrame(renderLoop);
};

window.requestAnimationFrame(renderLoop);
