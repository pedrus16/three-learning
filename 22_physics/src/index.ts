import "./style.css";

import { GUI } from "lil-gui";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import {
  ActiveEvents,
  ColliderDesc,
  EventQueue,
  RigidBody,
  RigidBodyDesc,
  World
} from "@dimforge/rapier3d";

import hitSoundFile from "./assets/sounds/jumpland48000.mp3?resource";


const physicObjects: Array<{ body: RigidBody; mesh: Mesh }> = [];

const sphereGeometry = new SphereGeometry(1, 32, 16);
const rigidBodyDesc = RigidBodyDesc.newDynamic().setCcdEnabled(true);
function createSphere(
  radius: number,
  { x, y, z }: { x: number; y: number; z: number }
) {
  const sphereBody = world.createRigidBody(
    rigidBodyDesc.setTranslation(x, y, z)
  );
  const colliderDesc = ColliderDesc.ball(radius)
    .setRestitution(1)
    .setActiveEvents(ActiveEvents.CONTACT_EVENTS);
  world.createCollider(colliderDesc, sphereBody.handle);

  const sphere = new Mesh(sphereGeometry, material);
  sphere.castShadow = true;
  sphere.scale.set(radius, radius, radius);
  sphere.position.set(x, y, z);
  scene.add(sphere);

  const object = { body: sphereBody, mesh: sphere };
  physicObjects.push(object);

  return object;
}

const boxGeometry = new BoxGeometry(1, 1, 1);
function createBox(
  { width, height, depth }: { width: number; height: number; depth: number },
  { x, y, z }: { x: number; y: number; z: number }
) {
  const boxBody = world.createRigidBody(rigidBodyDesc.setTranslation(x, y, z));
  const colliderDesc = ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
    .setRestitution(1)
    .setActiveEvents(ActiveEvents.CONTACT_EVENTS);
  // .setActiveHooks(ActiveHooks.FILTER_CONTACT_PAIRS);
  world.createCollider(colliderDesc, boxBody.handle);

  const cube = new Mesh(boxGeometry, material);
  cube.castShadow = true;
  cube.position.set(x, y, z);
  cube.scale.set(width, height, depth);
  scene.add(cube);

  const object = { body: boxBody, mesh: cube };
  physicObjects.push(object);

  return object;
}

// Sizes
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector<HTMLElement>("canvas.webgl");

const settings = {
  shootBall: () => {
    const ball = createSphere(0.5, camera.position);
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    ball.body.applyImpulse(direction.normalize().multiplyScalar(10), true);
  },
  shootBox: () => {
    const box = createBox(
      { width: 0.5, height: 0.5, depth: 0.5 },
      camera.position
    );
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    box.body.applyImpulse(direction.normalize().multiplyScalar(1), true);
  },
};

// Debug
const gui = new GUI({ width: 250 });

gui.add(settings, "shootBall").name("Shoot ball");
gui.add(settings, "shootBox").name("Shoot box");

// Physics
const TIMESTEP_SEC = 1 / 60;
const world = new World({ x: 0, y: -9.81, z: 0 });
// world.timestep = TIMESTEP_SEC;

// Create the ground
let groundColliderDesc = ColliderDesc.cuboid(10.0, 0.1, 10.0).setTranslation(
  0,
  -0.1,
  0
);
world.createCollider(groundColliderDesc);

const eventQueue = new EventQueue(true);

// Physics Loop
const physicsStep = () => {
  world.step(eventQueue);
  eventQueue.drainContactEvents((handle1, handle2, started) => {
    world.contactPair(handle1, handle2, (manifold, flipped) => {
      // const vel1 = world
      //   .getRigidBody(world.getCollider(handle1).parent())
      //   .linvel();
      // const len1 = new Vector3(vel1.x, vel1.y, vel1.z).length();

      // const vel2 = world
      //   .getRigidBody(world.getCollider(handle2).parent())
      //   .linvel();
      // const len2 = new Vector3(vel2.x, vel2.y, vel2.z).length();
      // console.log(len1, len2);

      console.log(manifold.normal());

      hitSound.currentTime = 0;
      hitSound.play();
    });
  });

  setTimeout(physicsStep, TIMESTEP_SEC * 1000);
};
physicsStep();

// Sound
const hitSound = new Audio(hitSoundFile);

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

createSphere(0.5, { x: 0, y: 2, z: 0 });
// createSphere(1, { x: 2, y: 4, z: 0 });
// createBox({ width: 0.75, height: 0.75, depth: 0.75 }, { x: -2, y: 4, z: 0 });

// Ambient Light
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional Light
const directionalLight = new DirectionalLight(0xfff3b8, 0.3);
directionalLight.castShadow = true;
directionalLight.visible = true;
directionalLight.position.set(4, 16, 0);
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

  controls.update();

  // Update objects

  physicObjects.forEach(({ body, mesh }) => {
    const position = body.translation();
    const rotation = body.rotation();
    mesh.position.set(position.x, position.y, position.z);
    mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  });

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
