import "./style.css";

import draco3d from "draco3d?resource";
import { GUI } from "lil-gui";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  CineonToneMapping,
  CubeTextureLoader,
  DirectionalLight,
  DirectionalLightHelper,
  LinearFilter,
  LinearToneMapping,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  ReinhardToneMapping,
  RGBAFormat,
  Scene,
  SphereGeometry,
  sRGBEncoding,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

import nx from "./assets/cubemaps/path/nx.png";
import ny from "./assets/cubemaps/path/ny.png";
import nz from "./assets/cubemaps/path/nz.png";
import px from "./assets/cubemaps/path/px.png";
import py from "./assets/cubemaps/path/py.png";
import pz from "./assets/cubemaps/path/pz.png";
import normalMapImage from "./assets/normal.jpg";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  envMapIntensity: 2.5,
};

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
const testSphere = new Mesh(
  new SphereGeometry(1, 32, 32),
  new MeshStandardMaterial()
);

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

// Models
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf) => {
    console.log("success");
    console.log(gltf);
    gltf.scene.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
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
scene.add(ambientLight);

// Directional Light
const directionalLight = new DirectionalLight(0xffffff, 3);
directionalLight.position.set(0.72, 0.72, 0.24);
directionalLight.castShadow = true;
directionalLight.visible = true;
directionalLight.shadow.bias = 0.0001;
directionalLight.shadow.normalBias = 0.001;
directionalLight.shadow.mapSize.set(2048, 2048);
const mapSize = 0.5;
directionalLight.shadow.camera.top = mapSize;
directionalLight.shadow.camera.right = mapSize;
directionalLight.shadow.camera.bottom = -mapSize;
directionalLight.shadow.camera.left = -mapSize;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 3.5;

scene.add(directionalLight);
const directionalHelper = new DirectionalLightHelper(directionalLight, 0.2);
directionalHelper.visible = false;
scene.add(directionalHelper);

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity");
gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightZ");

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 2.0;
camera.position.y = 0;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ReinhardToneMapping;

gui
  .add(renderer, "toneMapping", {
    No: NoToneMapping,
    Linear: LinearToneMapping,
    Reinhard: ReinhardToneMapping,
    Cineon: CineonToneMapping,
    ACESFilmic: ACESFilmicToneMapping,
  })
  .onFinishChange(() => updateAllMaterials);
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

// Shadow type
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = BasicShadowMap;
renderer.shadowMap.type = PCFShadowMap;
// renderer.shadowMap.type = PCFSoftShadowMap;
// renderer.shadowMap.type = VSMShadowMap;

/**
 * Post processing
 */
const renderTarget = new WebGLRenderTarget(size.width, size.height, {
  minFilter: LinearFilter,
  magFilter: LinearFilter,
  format: RGBAFormat,
});

if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
  // renderTarget.samples = 8;
}

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setSize(size.width, size.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// const glitchPass = new GlitchPass();
// glitchPass.enabled = false;
// glitchPass.goWild = true;
// effectComposer.addPass(glitchPass);

// const dotScreenPass = new DotScreenPass();
// dotScreenPass.enabled = true;
// effectComposer.addPass(dotScreenPass);

// const rgbShiftPass = new ShaderPass(RGBShiftShader);
// effectComposer.addPass(rgbShiftPass);

const unrealBloomPass = new UnrealBloomPass(
  new Vector2(size.width, size.height),
  0.3,
  0.2,
  0.2
);
effectComposer.addPass(unrealBloomPass);

const TintShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main()
    {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;
    
    varying vec2 vUv;
    
    void main()
    {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb += uTint;
      gl_FragColor = color;
    }
  `,
};

const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.uTint.value = new Vector3();
effectComposer.addPass(tintPass);
gui
  .add(tintPass.material.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("red");
gui
  .add(tintPass.material.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("green");
gui
  .add(tintPass.material.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("blue");

const DisplacementShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: null },
    uNormalMap: { value: null },
  },
  vertexShader: `
        varying vec2 vUv;

        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
  fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform sampler2D uNormalMap;
        
        varying vec2 vUv;

        void main()
        {
          vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
          vec2 newUv = vUv + normalColor.xy * 0.01;
          vec4 color = texture2D(tDiffuse, newUv);

          vec3 lightDirection = normalize(vec3(- 1.0, 1.0, 0.0));
          float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
          color.rgb += lightness * 0.1;

          gl_FragColor = color;
        }
    `,
};

const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.material.uniforms.uTime.value = 0;
displacementPass.material.uniforms.uNormalMap.value =
  textureLoader.load(normalMapImage);
effectComposer.addPass(displacementPass);

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass(size.width, size.height);
  effectComposer.addPass(smaaPass);
}

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects
  effectComposer.render();
  displacementPass.material.uniforms.uTime.value = elapsedTimeSec;

  // renderer.render(scene, camera);
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

  effectComposer.setSize(size.width, size.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
