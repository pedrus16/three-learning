import "./style.css";
import {
  AxesHelper,
  BoxGeometry,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipMapNearestFilter,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipMapLinearFilter,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
  LinearMipMapLinearFilter,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";
import gsap from "gsap";

import colorImage from "./assets/door/Door_Wood_001_basecolor.jpg";
import alphaImage from "./assets/door/Door_Wood_001_opacity.jpg";
import heightImage from "./assets/door/Door_Wood_001_height.png";
import normalImage from "./assets/door/Door_Wood_001_normal.jpg";
import ambientOcclusionImage from "./assets/door/Door_Wood_001_ambientOcclusion.jpg";
import metalnessImage from "./assets/door/Door_Wood_001_metallic.jpg";
import roughnessImage from "./assets/door/Door_Wood_001_roughness.jpg";

const settings = {
  color: 0xffffff,
  spin: () => {
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
  },
  wrapS: RepeatWrapping,
  wrapT: MirroredRepeatWrapping,
  minFilter: LinearMipMapLinearFilter,
  magFilter: NearestFilter,
};

// Scene
const scene = new Scene();

// Texture

// Manual texture loading
const image = new Image();
const texture = new Texture(image);
image.onload = () => {
  texture.needsUpdate = true;
};
image.src = colorImage;

// Optional: Using a Loading Manager
const loadingManager = new LoadingManager();
loadingManager.onStart = () => console.log("manager: loading started");
loadingManager.onLoad = () => {
  console.log("manager: loading done");
};
loadingManager.onProgress = () => console.log("manager: loading in progress");
loadingManager.onError = () => console.log("manager: loading error");

// Using a Texture Loader
const textureLoader = new TextureLoader(loadingManager); // new TextureLoader()
const colorTexture = textureLoader.load(colorImage);
const alphaTexture = textureLoader.load(alphaImage);
const heightTexture = textureLoader.load(heightImage);
const normalTexture = textureLoader.load(normalImage);
const ambientOcclusionTexture = textureLoader.load(ambientOcclusionImage);
const metalnessTexture = textureLoader.load(metalnessImage);
const roughnessTexture = textureLoader.load(roughnessImage);

// UV
colorTexture.wrapS = settings.wrapS;
colorTexture.wrapT = settings.wrapT;
colorTexture.repeat.x = 2;
colorTexture.repeat.y = 3;
colorTexture.offset.x = 0.5;
colorTexture.offset.y = 0.5;
colorTexture.rotation = Math.PI * 0.25;
colorTexture.center.x = 0.5;
colorTexture.center.y = 0.5;

// Mipmapping
colorTexture.generateMipmaps = true;
colorTexture.minFilter = settings.minFilter;
colorTexture.magFilter = settings.magFilter;

// Object
const geometry = new BoxGeometry(1, 1);
const material = new MeshBasicMaterial({
  color: settings.color,
  map: colorTexture,
});
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

// Debug
const gui = new GUI({ width: 250 });
gui.add(mesh.position, "x").min(-2).max(2).step(0.25);
gui.add(mesh.position, "y").min(-2).max(2).step(0.25);
gui.add(mesh, "visible");
gui.addColor(settings, "color").onChange((color) => material.color.set(color));
gui.add(material, "wireframe");
gui.add(settings, "spin");

const textureFolder = gui.addFolder("Texture");
textureFolder.add(colorTexture.repeat, "x").min(0).max(8).name("repeat X");
textureFolder.add(colorTexture.repeat, "y").min(0).max(8).name("repeat Y");
textureFolder.add(colorTexture.offset, "x").min(-1).max(1).name("offset X");
textureFolder.add(colorTexture.offset, "y").min(-1).max(1).name("offset Y");
textureFolder
  .add(colorTexture, "rotation")
  .min(0)
  .max(Math.PI * 2);
textureFolder.add(colorTexture.center, "x").min(0).max(1).name("center X");
textureFolder.add(colorTexture.center, "y").min(0).max(1).name("center Y");

// TODO Fix settings not updating
textureFolder
  .add(settings, "wrapS", {
    ClampToEdgeWrapping,
    RepeatWrapping,
    MirroredRepeatWrapping,
  })
  .onChange((wrap) => {
    colorTexture.wrapS = wrap;
    colorTexture.needsUpdate = true;
  });

textureFolder
  .add(settings, "wrapT", {
    ClampToEdgeWrapping,
    RepeatWrapping,
    MirroredRepeatWrapping,
  })
  .onChange((wrap) => {
    colorTexture.wrapT = wrap;
    colorTexture.needsUpdate = true;
  });

textureFolder
  .add(settings, "minFilter", {
    NearestFilter,
    NearestMipMapNearestFilter,
    NearestMipMapLinearFilter,
    LinearFilter,
    LinearMipMapNearestFilter,
    LinearMipMapLinearFilter,
  })
  .onChange((minFilter) => {
    colorTexture.minFilter = minFilter;
    colorTexture.needsUpdate = true;
  });

textureFolder
  .add(settings, "magFilter", {
    NearestFilter,
    LinearFilter,
  })
  .onChange((minFilter) => {
    colorTexture.minFilter = minFilter;
    colorTexture.needsUpdate = true;
  });

textureFolder
  .add(material, "map", {
    color: colorTexture,
    alpha: alphaTexture,
    height: heightTexture,
    normal: normalTexture,
    ambientOcclusion: ambientOcclusionTexture,
    metalness: metalnessTexture,
    roughness: roughnessTexture,
  })
  .name("texture");

// Render
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
