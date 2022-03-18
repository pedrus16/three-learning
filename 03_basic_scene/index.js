const size = {
  width: 800,
  height: 600,
};

const canvas = document.querySelector("canvas.webgl");

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);

const scene = new THREE.Scene();
const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(sphereGeometry, material);
scene.add(mesh);

const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
camera.position.z = 3;
scene.add(camera);

renderer.render(scene, camera);
