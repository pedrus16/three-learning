import "./style.css";

import gsap, { Power2 } from "gsap";
import { GUI } from "lil-gui";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshMatcapMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  TorusGeometry,
  TorusKnotGeometry,
  WebGLRenderer
} from "three";

import matcapImage from "./assets/matcap/pngegg.png";
import starImage from "./assets/particles/star_08.png";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  color: 0x8affe2,
  particleCount: 2000,
  spacing: 4,
  distance: 4,
  scale: 0.6,
  parallaxScale: 0.5,
  easing: 5,
};

// Debug
const gui = new GUI().close();
gui.addColor(settings, "color");
gui
  .add(settings, "spacing")
  .min(0)
  .max(10)
  .onChange((spacing) => {
    cube.position.y = -spacing * 0;
    donut.position.y = -spacing * 1;
    knot.position.y = -spacing * 2;
  });

gui
  .add(settings, "distance")
  .min(0)
  .max(20)
  .onChange((distance) => {
    camera.position.z = distance;
  });

gui
  .add(settings, "scale")
  .min(0)
  .max(2)
  .onChange((scale) => {
    cube.scale.set(scale, scale, scale);
    donut.scale.set(scale, scale, scale);
    knot.scale.set(scale, scale, scale);
  });

gui.add(settings, "parallaxScale").min(0).max(2);
gui.add(settings, "easing").min(0).max(10);

// Scene Setup
const scene = new Scene();
const textureLoader = new TextureLoader();

const matcapTexture = textureLoader.load(matcapImage);
const matcapMaterial = new MeshMatcapMaterial({ matcap: matcapTexture });

const cube = new Mesh(new BoxGeometry(2, 2, 2), matcapMaterial);
cube.scale.set(settings.scale, settings.scale, settings.scale);
const donut = new Mesh(new TorusGeometry(1, 0.5, 16, 32), matcapMaterial);
donut.position.y = -4;
donut.scale.set(settings.scale, settings.scale, settings.scale);
const knot = new Mesh(new TorusKnotGeometry(1, 0.5, 64, 16), matcapMaterial);
knot.position.y = -8;
knot.scale.set(settings.scale, settings.scale, settings.scale);

const meshes = [cube, donut, knot];
scene.add(...meshes);

// Particles
const particlesCount = settings.particleCount;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    settings.spacing - Math.random() * settings.spacing * 4;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new BufferGeometry();
particlesGeometry.setAttribute("position", new BufferAttribute(positions, 3));
const starTexture = textureLoader.load(starImage);
// Material
const particlesMaterial = new PointsMaterial({
  color: settings.color,
  sizeAttenuation: true,
  size: 0.1,
  alphaMap: starTexture,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
});
// Points
const particles = new Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Camera
const cameraGroup = new Group();
scene.add(cameraGroup);
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 4;
cameraGroup.add(camera);

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = event.clientY / size.height - 0.5;
});

// Renderer
const renderer = new WebGLRenderer({ canvas, alpha: true });
renderer.setSize(size.width, size.height);

let lastRenderSec = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const delta = elapsedTimeSec - lastRenderSec;

  // Update objects
  // Animate meshes
  for (const mesh of meshes) {
    mesh.rotation.x += delta * 0.1;
    mesh.rotation.y += delta * 0.12;
  }

  camera.position.y = (-scrollY / size.height) * settings.spacing;

  const parallaxX = cursor.x * settings.parallaxScale;
  const parallaxY = -cursor.y * settings.parallaxScale;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * settings.easing * delta;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * settings.easing * delta;

  renderer.render(scene, camera);
  lastRenderSec = time / 1000;
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

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / size.height - 0.25);

  console.log(newSection);

  if (newSection !== currentSection) {
    currentSection = newSection;

    gsap.to(meshes[currentSection].rotation, {
      duration: 1.5,
      ease: Power2.easeInOut,
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});
