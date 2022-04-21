import "./style.css";

import { GUI } from "lil-gui";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  CubeTextureLoader,
  DirectionalLight,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  RGBADepthPacking,
  Scene,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import colorImage from "./assets/models/LeePerrySmith/color.jpg";
import normalImage from "./assets/models/LeePerrySmith/normal.jpg";
import nx from "./assets/textures/environmentMaps/0/nx.jpg";
import ny from "./assets/textures/environmentMaps/0/ny.jpg";
import nz from "./assets/textures/environmentMaps/0/nz.jpg";
import px from "./assets/textures/environmentMaps/0/px.jpg";
import py from "./assets/textures/environmentMaps/0/py.jpg";
import pz from "./assets/textures/environmentMaps/0/pz.jpg";
import fragment from "./shaders/test/fragment.frag";
import vertex from "./shaders/test/vertex.vert";


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

// Environment map
const cubeTextureLoader = new CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([px, nx, py, ny, pz, nz]);
environmentMap.encoding = sRGBEncoding;
scene.background = environmentMap;

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof Mesh &&
      child.material instanceof MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap;
      child.material.envMapIntensity = settings.envMapIntensity;
      child.material.needsUpdate = true;
    }
  });
};

// Textures
const mapTexture = textureLoader.load(colorImage);
mapTexture.encoding = sRGBEncoding;
const normalTexture = textureLoader.load(normalImage);
const customUniforms = {
  uTime: { value: 0 },
};
const material = new MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;

  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
      #include <common>

      uniform float uTime;

      mat2 get2dRotateMatrix(float _angle)
      {
          return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
      }
  `
  );

  shader.vertexShader = shader.vertexShader.replace(
    "#include <beginnormal_vertex>",
    `
      #include <beginnormal_vertex>

      float angle = sin(position.z + uTime) * 0.4;
      mat2 rotateMatrix = get2dRotateMatrix(angle);

      objectNormal.xz = rotateMatrix * objectNormal.xz;
    `
  );

  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
      #include <begin_vertex>

      transformed.xz = rotateMatrix * transformed.xz;
  `
  );
};

const depthMaterial = new MeshDepthMaterial({
  depthPacking: RGBADepthPacking,
});

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
            #include <common>

            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
            #include <begin_vertex>

            float angle = sin(position.z + uTime) * 0.4;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            transformed.xz = rotateMatrix * transformed.xz;
        `
  );
};

// Models
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  // "./assets/models/Buggy/glTF/Buggy.gltf",
  // "./assets/models/no_cube.glb",
  "./assets/models/LeePerrySmith/LeePerrySmith.glb",
  // "./assets/models/FlightHelmet/glTF/FlightHelmet.gltf",
  // "./assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf) => {
    console.log("success");
    console.log(gltf);
    gltf.scene.translateY(-0.5);
    gltf.scene.rotation.y = Math.PI * 0.5;
    gltf.scene.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
      if (
        child instanceof Mesh &&
        child.material instanceof MeshStandardMaterial
      ) {
        child.material = material;
        child.customDepthMaterial = depthMaterial;
      }
    });
    scene.add(gltf.scene);

    gui
      .add(gltf.scene.rotation, "y")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name("rotation");
    gui
      .add(settings, "envMapIntensity")
      .min(0)
      .max(10)
      .step(0.001)
      .onChange(updateAllMaterials);

    updateAllMaterials();
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
// scene.add(ambientLight);

// Directional Light
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
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
  customUniforms.uTime.value = elapsedTimeSec;

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
