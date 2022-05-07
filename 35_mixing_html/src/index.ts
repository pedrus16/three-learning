import "./style.css";

import draco3d from "draco3d?resource";
import { gsap } from "gsap";
import { GUI } from "lil-gui";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  ArrowHelper,
  AxesHelper,
  BoxGeometry,
  CineonToneMapping,
  CubeTextureLoader,
  DirectionalLight,
  DirectionalLightHelper,
  LinearToneMapping,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  ReinhardToneMapping,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import nx from "./assets/cubemaps/path/nx.png";
import ny from "./assets/cubemaps/path/ny.png";
import nz from "./assets/cubemaps/path/nz.png";
import px from "./assets/cubemaps/path/px.png";
import py from "./assets/cubemaps/path/py.png";
import pz from "./assets/cubemaps/path/pz.png";

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

/**
 * Overlay
 */
const overlayGeometry = new PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new ShaderMaterial({
  uniforms: {
    uAlpha: { value: 1.0 },
  },
  transparent: true,
  depthWrite: false,
  depthTest: false,
  vertexShader: `
     void main()
     {
       gl_Position = vec4(position, 1.0);
     }
   `,
  fragmentShader: `
     uniform float uAlpha;
     void main()
     {
       gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
     }
   `,
});
const overlay = new Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Loaders
 */
let sceneReady = false;
const loadingBarElement =
  document.querySelector<HTMLDivElement>(".loading-bar");
const loadingManager = new LoadingManager( // Loaded
  () => {
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 1, value: 0 });
    loadingBarElement.classList.add("hidden");
    setTimeout(() => (sceneReady = true));
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.setProperty(
      "--progress",
      `${progressRatio * 100}%`
    );
  }
);

// Environment map
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
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
const sceneContent = new Scene();
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.load(
  // "./assets/models/Buggy/glTF/Buggy.gltf",
  // "./assets/models/no_cube.glb",
  // "./assets/models/FlightHelmet/glTF/FlightHelmet.gltf",
  "./assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf) => {
    gltf.scene.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    sceneContent.add(gltf.scene);

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
scene.add(sceneContent);

// const mesh = new Mesh(
//   new BoxGeometry(0.1, 0.1, 0.1),
//   new MeshStandardMaterial()
// );
// scene.add(mesh);

const points = [
  {
    position: new Vector3(0.2, 0.3, 0.6),
    element: document.querySelector(".point-0"),
  },
  {
    position: new Vector3(0.65, 0.3, 0.2),
    element: document.querySelector(".point-1"),
  },
  {
    position: new Vector3(0.23, -0.58, 0.65),
    element: document.querySelector(".point-2"),
  },
];

const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(), 1, 0xff00ff);
// scene.add(arrowHelper);

const raycaster = new Raycaster();

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
camera.position.z = 3.0;
camera.position.y = 0;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 2;

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

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  const deltaMs = time - lastRender;

  controls.update();

  // Update objects
  if (sceneReady) {
    // Go through each point
    for (const point of points) {
      const screenPosition = point.position.clone();
      screenPosition.project(camera);

      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(
        sceneContent.children,
        true
      );

      arrowHelper.setDirection(raycaster.ray.direction);
      arrowHelper.position.set(
        raycaster.ray.origin.x,
        raycaster.ray.origin.y,
        raycaster.ray.origin.z
      );

      if (intersects.length > 0) {
        const intersectionDistance = intersects[0].distance;

        // mesh.position.set(
        //   intersects[0].point.x,
        //   intersects[0].point.y,
        //   intersects[0].point.z
        // );

        arrowHelper.setLength(intersectionDistance);
        arrowHelper.setColor(0xff00ff);
        const pointDistance = point.position.distanceTo(camera.position);
        console.log(pointDistance, intersectionDistance);
        if (pointDistance > intersectionDistance) {
          point.element.classList.remove("visible");
        } else {
          point.element.classList.add("visible");
        }
      } else {
        point.element.classList.add("visible");
        arrowHelper.setColor(0xffffff);
      }

      const translateX = screenPosition.x * size.width * 0.5;
      const translateY = -screenPosition.y * size.height * 0.5;
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
    }
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