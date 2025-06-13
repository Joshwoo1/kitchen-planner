let scene, camera, renderer, controls;
let textures = {};
let dragObject = null;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(4, 4, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 10, 7);
  scene.add(ambient, dirLight);

  const loader = new THREE.TextureLoader();
  textures.wood = loader.load('assets/textures/wood.jpg');
  textures.stone = loader.load('assets/textures/stone.jpg');
  textures.metal = loader.load('assets/textures/metal.jpg');

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
  renderer.domElement.addEventListener('pointermove', onPointerMove, false);
  renderer.domElement.addEventListener('pointerup', () => (dragObject = null));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / (window.innerHeight * 0.9);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function addCabinet(type) {
  const geometry = new THREE.BoxGeometry(1, 1, 0.6);
  const material = new THREE.MeshStandardMaterial({ map: textures[type] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.5, 0);
  mesh.userData.draggable = true;
  scene.add(mesh);
}

function onPointerDown(event) {
  setMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && intersects[0].object.userData.draggable) {
    dragObject = intersects[0].object;
  }
}

function onPointerMove(event) {
  if (!dragObject) return;
  setMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(planeY, intersectPoint);
  dragObject.position.x = Math.round(intersectPoint.x);
  dragObject.position.z = Math.round(intersectPoint.z);
}

function setMouse(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
}
