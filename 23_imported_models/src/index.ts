import "./style.css";

import draco3d from "draco3d?resource";
import { GUI } from "lil-gui";
import {
  AmbientLight,
  AnimationMixer,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


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
const material = new MeshStandardMaterial({
  color: 0xdddddd,
  roughness: 0.25,
});

// Meshes
const ground = new Mesh(new PlaneGeometry(20, 20), material);
ground.receiveShadow = true;
ground.position.y = 0;
ground.rotation.x = -Math.PI * 0.5;
scene.add(ground);

let mixer = null;

// Models

const dracoLoader = new DRACOLoader();
// Not working!! Need to find the draco decoder for browser
dracoLoader.setDecoderPath(draco3d);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  // "./assets/models/Duck/glTF/Duck.gltf",
  // "./assets/models/Fox/glTF/Fox.gltf",
  "./assets/models/no_cube.glb",
  (gltf) => {
    console.log("success");
    console.log(gltf);
    gltf.scene.translateY(1.0);
    gltf.scene.children[0].castShadow = true;
    scene.add(gltf.scene);

    mixer = new AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[2]);
    action.play();
  },
  (progress) => {
    console.log("progress");
    console.log(progress);
  },
  (error) => {
    console.log("error");
    console.log(error);
  }
);

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
  if (mixer) {
    mixer.update(deltaMs / 1000);
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
