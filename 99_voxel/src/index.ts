import "./style.css";

import { GUI } from "lil-gui";
import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  Data3DTexture,
  DirectionalLight,
  GLSL3,
  Mesh,
  NearestFilter,
  PCFShadowMap,
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VOXLoader } from "three/examples/jsm/loaders/VOXLoader";

import teapot from "./assets/models/teapot.vox";
import fragment from "./shaders/volume/fragment.frag";
import vertex from "./shaders/volume/vertex.vert";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  envMapIntensity: 1.0,
};

// Debug
const gui = new GUI({ width: 250 });

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene
const scene = new Scene();
const textureLoader = new TextureLoader();

class VOXData3DTexture extends Data3DTexture {
  constructor(chunk) {
    const data = chunk.data;
    const size = chunk.size;
    const palette = chunk.palette;

    console.log(size);

    const offsety = size.x;
    const offsetz = size.x * size.y;

    const array = new Uint8Array(size.x * size.y * size.z * 4);

    for (let j = 0; j < data.length; j += 4) {
      const x = data[j + 0];
      const y = data[j + 1];
      const z = data[j + 2];
      const c = data[j + 3];

      const index = x + y * offsety + z * offsetz;

      const hex = palette[c];
      const r = (hex >> 0) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = (hex >> 16) & 0xff;

      const i4 = index * 4;
      array[i4] = r;
      array[i4 + 1] = g;
      array[i4 + 2] = b;
      array[i4 + 3] = 255;
    }

    super(array, size.x, size.y, size.z);

    this.format = RGBAFormat;
    this.minFilter = NearestFilter;
    this.magFilter = NearestFilter;
    this.unpackAlignment = 1;
    this.needsUpdate = true;
  }
}

// Voxel Loader
var loader = new VOXLoader();
loader.load("./assets/models/monu10.vox", function (chunks) {
  for (var i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const geometry = new BoxGeometry(1, 1, 1);
    const data = new VOXData3DTexture(chunk);

    const material = new ShaderMaterial({
      glslVersion: GLSL3,
      uniforms: {
        map: { value: data },
        threshold: { value: 0.0 },
        steps: { value: 512 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: BackSide,
    });

    const mesh = new Mesh(geometry, material);
    mesh.rotation.set(Math.PI * -0.5, 0, 0);
    scene.add(mesh);
  }
});

// Directional Light
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

// Camera
const camera = new PerspectiveCamera(60, size.width / size.height);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
renderer.setSize(size.width, size.height);

// Shadow type
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects

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
