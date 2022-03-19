import "./style.css";

import { GUI } from "lil-gui";
import {
  AmbientLight,
  BasicShadowMap,
  BoxGeometry,
  ConeGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  ExtrudeGeometry,
  Fog,
  Group,
  HemisphereLight,
  HemisphereLightHelper,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  RectAreaLight,
  RepeatWrapping,
  Scene,
  Shape,
  SphereGeometry,
  SpotLight,
  SpotLightHelper,
  TextureLoader,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import doorAOImage from "./assets/door/Door_Wood_001_ambientOcclusion.jpg";
import doorColorImage from "./assets/door/Door_Wood_001_basecolor.jpg";
import doorHeightImage from "./assets/door/Door_Wood_001_height.png";
import doorMetalnessImage from "./assets/door/Door_Wood_001_metallic.jpg";
import doorNormalImage from "./assets/door/Door_Wood_001_normal.jpg";
import doorAlphaImage from "./assets/door/Door_Wood_001_opacity.jpg";
import doorRoughnessImage from "./assets/door/Door_Wood_001_roughness.jpg";
import grassAO from "./assets/grass/GroundForest003_AO_1K.jpg";
import grassColor from "./assets/grass/GroundForest003_COL_VAR1_1K.jpg";
import grassDisplacement from "./assets/grass/GroundForest003_DISP_1K.jpg";
import grassGloss from "./assets/grass/GroundForest003_GLOSS_1K.jpg";
import grassNormal from "./assets/grass/GroundForest003_NRM_1K.jpg";
import stoneAO from "./assets/stone/StoneBricksBeige015_AO_1K.jpg";
import stoneColor from "./assets/stone/StoneBricksBeige015_COL_1K.jpg";
import stoneDisplacement from "./assets/stone/StoneBricksBeige015_DISP_1K.jpg";
import stoneRoughness from "./assets/stone/StoneBricksBeige015_GLOSS_1K.jpg";
import stoneNormal from "./assets/stone/StoneBricksBeige015_NRM_1K.jpg";


// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

// Debug
const gui = new GUI().close();

// Scene
const fogColor = 0x262837;
const scene = new Scene();
scene.fog = new Fog(fogColor, 1, 15);

// Scene Setup
const textureLoader = new TextureLoader();

// Ground
const groundTextures = {
  map: textureLoader.load(grassColor),
  aoMap: textureLoader.load(grassAO),
  normalMap: textureLoader.load(grassNormal),
  roughnessMap: textureLoader.load(grassGloss),
  displacementMap: textureLoader.load(grassDisplacement),
};
groundTextures.map.wrapS = RepeatWrapping;
groundTextures.aoMap.wrapS = RepeatWrapping;
groundTextures.normalMap.wrapS = RepeatWrapping;
groundTextures.roughnessMap.wrapS = RepeatWrapping;
groundTextures.displacementMap.wrapS = RepeatWrapping;

groundTextures.map.wrapT = RepeatWrapping;
groundTextures.aoMap.wrapT = RepeatWrapping;
groundTextures.normalMap.wrapT = RepeatWrapping;
groundTextures.roughnessMap.wrapT = RepeatWrapping;
groundTextures.displacementMap.wrapT = RepeatWrapping;

groundTextures.map.repeat.set(8, 8);
groundTextures.aoMap.repeat.set(8, 8);
groundTextures.normalMap.repeat.set(8, 8);
groundTextures.roughnessMap.repeat.set(8, 8);
groundTextures.displacementMap.repeat.set(8, 8);

const groundMaterial = new MeshStandardMaterial({
  ...groundTextures,
  roughness: 10,
  displacementScale: 0.1,
});
const ground = new Mesh(new PlaneGeometry(32, 32, 1024, 1024), groundMaterial);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI * 0.5;
scene.add(ground);

// House
const house = new Group();
scene.add(house);

const wallTextures = {
  map: textureLoader.load(stoneColor),
  aoMap: textureLoader.load(stoneAO),
  normalMap: textureLoader.load(stoneNormal),
  // roughnessMap: textureLoader.load(stoneRoughness),
  // displacementMap: textureLoader.load(stoneDisplacement),
};
const wallMaterial = new MeshStandardMaterial({
  ...wallTextures,
  color: 0xac8e82,
  displacementScale: 0.1,
  displacementBias: -0.05,
  roughness: 5,
});
const walls = new Mesh(new BoxGeometry(4, 2.5, 4, 256, 256), wallMaterial);
walls.position.y = 1.25;
walls.castShadow = true;
walls.receiveShadow = true;

const roof = new Mesh(
  new ConeGeometry(3.5, 2, 4),
  new MeshStandardMaterial({ color: 0xb35f45 })
);
roof.castShadow = true;
roof.receiveShadow = true;
roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.5 + 1;
house.add(walls, roof);

const doorTextures = {
  map: textureLoader.load(doorColorImage),
  alphaMap: textureLoader.load(doorAlphaImage),
  aoMap: textureLoader.load(doorAOImage),
  normalMap: textureLoader.load(doorNormalImage),
  metalnessMap: textureLoader.load(doorMetalnessImage),
  roughnessMap: textureLoader.load(doorRoughnessImage),
  displacementMap: textureLoader.load(doorHeightImage),
};
const door = new Mesh(
  new PlaneGeometry(2, 2, 128, 128),
  new MeshStandardMaterial({
    ...doorTextures,
    displacementScale: 0.1,
    transparent: true,
  })
);

door.position.y = 0.9;
door.position.z = 2 + 0.0;
door.receiveShadow = true;
house.add(door);

const bushMaterial = new MeshStandardMaterial({ color: 0x89c854 });
const bush1 = new Mesh(new SphereGeometry(0.5, 16, 8), bushMaterial);
bush1.position.set(1.25, 0.5, 2.5);
bush1.scale.y = 2;
bush1.castShadow = true;
bush1.receiveShadow = true;
house.add(bush1);

const bush2 = new Mesh(new SphereGeometry(0.5, 16, 8), bushMaterial);
bush2.position.set(-1.25, 0.25, 2.25);
bush2.scale.y = 1.25;
bush2.castShadow = true;
bush2.receiveShadow = true;
house.add(bush2);

const bush3 = new Mesh(new SphereGeometry(0.4, 16, 8), bushMaterial);
bush3.position.set(-1.1, 0.1, 2.8);
bush3.scale.y = 0.8;
bush3.castShadow = true;
bush3.receiveShadow = true;
house.add(bush3);

const bush4 = new Mesh(new SphereGeometry(0.4, 16, 8), bushMaterial);
bush4.position.set(2, 0.2, 2.5);
bush4.scale.y = 1;
bush4.castShadow = true;
bush4.receiveShadow = true;
house.add(bush4);

house.rotation.x = 0.01;

// Graves
const graves = new Group();
scene.add(graves);
const graveShape = new Shape();
const width = 0.5;
const height = 0.75;
graveShape.moveTo(-(width / 2), 0);
graveShape.lineTo(-(width / 2), height);
graveShape.bezierCurveTo(
  -(width / 2),
  height + width / 2,
  width / 2,
  height + width / 2,
  width / 2,
  height
);
graveShape.lineTo(width / 2, 0);
const graveGeometry = new ExtrudeGeometry(graveShape, {
  bevelEnabled: true,
  bevelSegments: 1,
  bevelSize: 0.025,
  bevelThickness: 0.025,
  depth: 0.1,
});
const graveMaterial = new MeshStandardMaterial({
  color: 0x555555,
  flatShading: false,
});

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const radius = 4 + Math.random() * 10; // Random radius
  const x = Math.cos(angle) * radius; // Get the x position using cosinus
  const z = Math.sin(angle) * radius; // Get the z position using sinus

  // Create the mesh
  const grave = new Mesh(graveGeometry, graveMaterial);

  grave.castShadow = true;
  grave.receiveShadow = true;

  // Position
  grave.position.set(x, -0.1, z);

  // Rotation
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * Math.PI * 0.5;

  // Scale
  const scale = (Math.random() + 0.9) * 1.1;
  grave.scale.set(scale, scale, scale);

  // Add to the graves container
  graves.add(grave);
}

/**
 * Ghosts
 */
const ghost1 = new PointLight("#ff00ff", 2, 3);
ghost1.castShadow = true;
scene.add(ghost1);

const ghost2 = new PointLight("#00ffff", 2, 3);
ghost2.castShadow = true;
scene.add(ghost2);

const ghost3 = new PointLight("#ffff00", 2, 3);
ghost3.castShadow = true;
scene.add(ghost3);

// Lights

const settings = {
  mapSize: 512,
  blur: 10,
  type: BasicShadowMap,
};
const shadowFolder = gui.addFolder("Shadows");
shadowFolder
  .add(settings, "mapSize", [32, 64, 128, 256, 512, 1024, 2048, 4096])
  .onChange((size) => {
    pointLight.shadow.mapSize.width = size;
    pointLight.shadow.mapSize.height = size;
    pointLight.shadow.map.dispose();
    pointLight.shadow.map = null;

    directionalLight.shadow.mapSize.width = size;
    directionalLight.shadow.mapSize.height = size;
    directionalLight.shadow.map.dispose();
    directionalLight.shadow.map = null;

    spotLight.shadow.mapSize.width = size;
    spotLight.shadow.mapSize.height = size;
    spotLight.shadow.map.dispose();
    spotLight.shadow.map = null;
  });

shadowFolder
  .add(settings, "blur")
  .min(0)
  .max(10)
  .onChange((blur) => {
    pointLight.shadow.radius = blur;
    directionalLight.shadow.radius = blur;
    spotLight.shadow.radius = blur;
  });

// Ambient Light
const ambientLight = new AmbientLight(0xadd1ff, 0.16);
scene.add(ambientLight);
const ambientFolder = gui.addFolder("Ambient Light");
ambientFolder.add(ambientLight, "visible");
ambientFolder.add(ambientLight, "intensity").min(0).max(1).step(0.001);
ambientFolder.addColor(ambientLight, "color");

// Point Light
const pointLight = new PointLight(0xff7b00, 0.8);
pointLight.castShadow = true;
pointLight.decay = 2;
pointLight.shadow.radius = 5;
pointLight.shadow.blurSamples = 4;
// pointLight.shadow.bias = 0.1;
pointLight.visible = true;
pointLight.position.set(0, 2.15, 2.5);
scene.add(pointLight);
const pointHelper = new PointLightHelper(pointLight, 0.2);
pointHelper.visible = false;
// scene.add(pointHelper);
const pointFolder = gui.addFolder("Point Light");
pointFolder.add(pointLight, "visible");
pointFolder.add(pointHelper, "visible").name("helper");
pointFolder.add(pointLight, "castShadow");
pointFolder.add(pointLight, "intensity").min(0).max(1).step(0.001);
pointFolder.addColor(pointLight, "color");
const pointPositionFolder = pointFolder.addFolder("Position");
pointPositionFolder.add(pointLight.position, "x").min(-4).max(4);
pointPositionFolder.add(pointLight.position, "y").min(-4).max(4);
pointPositionFolder.add(pointLight.position, "z").min(-4).max(4);

// Directional Light
const directionalLight = new DirectionalLight(0xc4a5fd, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.radius = 4;
directionalLight.shadow.blurSamples = 16;
directionalLight.visible = true;
directionalLight.position.set(1.176, 3.352, 1.72);
scene.add(directionalLight);
const directionalHelper = new DirectionalLightHelper(directionalLight, 0.2);
directionalHelper.visible = false;
scene.add(directionalHelper);
const directionalFolder = gui.addFolder("Directional Light");
// .onChange(() => directionalShadowHelper.update());
directionalFolder.add(directionalLight, "visible");
directionalFolder.add(directionalHelper, "visible").name("helper");
directionalFolder.add(directionalLight, "castShadow");
directionalFolder.add(directionalLight, "intensity").min(0).max(1).step(0.001);
directionalFolder.addColor(directionalLight, "color");
const directionalPositionFolder = directionalFolder.addFolder("Position");
directionalPositionFolder.add(directionalLight.position, "x").min(-4).max(4);
directionalPositionFolder.add(directionalLight.position, "y").min(-4).max(4);
directionalPositionFolder.add(directionalLight.position, "z").min(-4).max(4);

// Hemisphere Light
const hemisphereLight = new HemisphereLight(0x00ffff, 0xff0000, 0.3);
hemisphereLight.visible = false;
scene.add(hemisphereLight);
const hemisphereHelper = new HemisphereLightHelper(hemisphereLight, 0.2);
hemisphereHelper.visible = false;
scene.add(hemisphereHelper);
const hemisphereFolder = gui.addFolder("Hemisphere Light");
hemisphereFolder.add(hemisphereLight, "visible");
hemisphereFolder.add(hemisphereHelper, "visible").name("helper");
hemisphereFolder.add(hemisphereLight, "intensity").min(0).max(1).step(0.001);
hemisphereFolder.addColor(hemisphereLight, "color");
hemisphereFolder.addColor(hemisphereLight, "groundColor");
const hemispherePositionFolder = hemisphereFolder.addFolder("Position");
hemispherePositionFolder.add(hemisphereLight.position, "x").min(-4).max(4);
hemispherePositionFolder.add(hemisphereLight.position, "y").min(-4).max(4);
hemispherePositionFolder.add(hemisphereLight.position, "z").min(-4).max(4);

// Rect Area Light
const rectAreaLight = new RectAreaLight(0x4e00ff, 2, 2, 2);
rectAreaLight.visible = false;
scene.add(rectAreaLight);
const rectAreaFolder = gui.addFolder("Rect Area Light");
rectAreaFolder.add(rectAreaLight, "visible");
rectAreaFolder.add(rectAreaLight, "intensity").min(0).max(2).step(0.001);
rectAreaFolder.add(rectAreaLight, "width").min(0).max(2).step(0.001);
rectAreaFolder.add(rectAreaLight, "height").min(0).max(2).step(0.001);
rectAreaFolder.addColor(rectAreaLight, "color");
const rectAreaPositionFolder = rectAreaFolder.addFolder("Position");
rectAreaPositionFolder.add(rectAreaLight.position, "x").min(-4).max(4);
rectAreaPositionFolder.add(rectAreaLight.position, "y").min(-4).max(4);
rectAreaPositionFolder.add(rectAreaLight.position, "z").min(-4).max(4);
const rectAreaRotationFolder = rectAreaFolder.addFolder("Rotation");
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "x")
  .min(0)
  .max(Math.PI * 2);
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "y")
  .min(0)
  .max(Math.PI * 2);
rectAreaRotationFolder
  .add(rectAreaLight.rotation, "z")
  .min(0)
  .max(Math.PI * 2);

// Spot Light
const spotLight = new SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.visible = false;
spotLight.castShadow = true;
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
scene.add(spotLight.target);
const spotHelper = new SpotLightHelper(spotLight);
spotHelper.visible = false;
scene.add(spotHelper);
const spotFolder = gui
  .addFolder("Spot Light")
  .onChange(() => spotHelper.update());
spotFolder.add(spotLight, "visible");
spotFolder.add(spotHelper, "visible").name("helper");
spotFolder.add(spotLight, "castShadow");
spotFolder.add(spotLight, "intensity").min(0).max(2).step(0.001);
spotFolder.addColor(spotLight, "color");
spotFolder
  .add(spotLight, "angle")
  .min(0)
  .max(Math.PI * 0.5);
spotFolder.add(spotLight, "decay").min(0).max(5);
spotFolder.add(spotLight, "distance").min(0).max(10);
spotFolder.add(spotLight, "penumbra").min(0).max(1);
const spotPositionFolder = spotFolder.addFolder("Position");
spotPositionFolder.add(spotLight.position, "x").min(-4).max(4);
spotPositionFolder.add(spotLight.position, "y").min(-4).max(4);
spotPositionFolder.add(spotLight.position, "z").min(-4).max(4);
const spotTargetFolder = spotFolder.addFolder("Target Position");
spotTargetFolder.add(spotLight.target.position, "x").min(-4).max(4);
spotTargetFolder.add(spotLight.target.position, "y").min(-4).max(4);
spotTargetFolder.add(spotLight.target.position, "z").min(-4).max(4);

// Shadows
// const pointShadowHelper = new CameraHelper(pointLight.shadow.camera);
// pointShadowHelper.visible = false;
// pointLight.shadow.camera.far = 32;
// scene.add(pointShadowHelper);

// const directionalShadowHelper = new CameraHelper(
//   directionalLight.shadow.camera
// );
// directionalShadowHelper.visible = false;
// directionalLight.shadow.camera.near = 0;
// directionalLight.shadow.camera.far = 32;
// const cameraWidth = 8;
// directionalLight.shadow.camera.top = cameraWidth;
// directionalLight.shadow.camera.right = cameraWidth;
// directionalLight.shadow.camera.bottom = -cameraWidth;
// directionalLight.shadow.camera.left = -cameraWidth;
// scene.add(directionalShadowHelper);

// Camera
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 6;
camera.position.y = 4;
camera.position.x = -2;
camera.lookAt(house.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);
renderer.setClearColor(fogColor);

// Shadow type
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = BasicShadowMap;
renderer.shadowMap.type = PCFShadowMap;
// renderer.shadowMap.type = PCFSoftShadowMap;
// renderer.shadowMap.type = VSMShadowMap;

let lastRender = 0;
const renderLoop: FrameRequestCallback = (time) => {
  const elapsedTimeSec = time / 1000;
  controls.update();

  // Update objects
  // Ghosts
  const ghost1Angle = elapsedTimeSec * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTimeSec * 3);

  const ghost2Angle = -elapsedTimeSec * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y =
    Math.sin(elapsedTimeSec * 4) + Math.sin(elapsedTimeSec * 2.5);

  const ghost3Angle = -elapsedTimeSec * 0.18;
  ghost3.position.x =
    Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTimeSec * 0.32));
  ghost3.position.z =
    Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTimeSec * 0.5));
  ghost3.position.y =
    Math.sin(elapsedTimeSec * 4) + Math.sin(elapsedTimeSec * 2.5);

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
