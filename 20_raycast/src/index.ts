import "./style.css";

import gsap, { Power2 } from "gsap";
import { GUI } from "lil-gui";
import {
  Intersection,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector2,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {};

// Debug
const gui = new GUI().close();

// Scene Setup
const scene = new Scene();
const textureLoader = new TextureLoader();

const sphereGeometry = new SphereGeometry(0.5, 32, 16);
const sphere1 = new Mesh(
  sphereGeometry,
  new MeshBasicMaterial({ color: 0x555555 })
);
sphere1.position.x = -2;
const sphere2 = new Mesh(
  sphereGeometry,
  new MeshBasicMaterial({ color: 0x555555 })
);
const sphere3 = new Mesh(
  sphereGeometry,
  new MeshBasicMaterial({ color: 0x555555 })
);
sphere3.position.x = 2;

scene.add(sphere1, sphere2, sphere3);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 4;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Raycaster
const raycaster = new Raycaster();

/**
 * Mouse
 */
const mouse = new Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / size.width) * 2 - 1;
  mouse.y = -(event.clientY / size.height) * 2 + 1;
});

// Renderer
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);

let currentIntersect: Intersection<typeof sphere1> = null;
let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  controls.update();

  // Update objects
  // sphere1.position.y = Math.sin(elapsedTimeSec * 0.3) * 1.5;
  sphere2.position.y = Math.sin(elapsedTimeSec * 0.8) * 1.5;
  sphere3.position.y = Math.sin(elapsedTimeSec * 1.4) * 1.5;

  // const rayOrigin = new Vector3(-4, 0, 0);
  // const rayDirection = new Vector3(1, 0, 0).normalize();
  // raycaster.set(rayOrigin, rayDirection);

  raycaster.setFromCamera(mouse, camera);

  const objectsToTest = [sphere1, sphere2, sphere3];
  const intersects = raycaster.intersectObjects<typeof sphere1>(objectsToTest);
  objectsToTest.forEach((object) => object.material.color.set(0x555555));
  intersects.forEach(({ object }) => object.material.color.set(0xff00ff));

  if (intersects.length) {
    if (!currentIntersect) {
      console.log("mouse enter");
    }

    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }

    currentIntersect = null;
  }

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

window.addEventListener("click", () => {
  if (currentIntersect) {
    console.log("click");
    gsap.to(currentIntersect.object.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.1,
      ease: Power2.easeOut,
    });
    gsap.to(currentIntersect.object.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.2,
      delay: 0.1,
      ease: Power2.easeInOut,
    });
  }
});
