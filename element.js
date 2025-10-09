const element = JSON.parse(localStorage.getItem('selectedElement'));
document.getElementById('detailName').textContent = element.name;
document.getElementById('detailSymbol').textContent = `Symbol: ${element.symbol}`;
document.getElementById('detailNumber').textContent = `Atomic Number: ${element.number}`;
document.getElementById('detailSummary').textContent = element.summary;

let camera, scene, renderer, loader, model;

init();
animate();

function init() {
  const container = document.getElementById('bohrContainer');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  loader = new THREE.GLTFLoader();
  loader.load(element.bohr_model_3d, gltf => {
    model = gltf.scene;
    model.scale.set(2, 2, 2);
    scene.add(model);
  });

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.005;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
