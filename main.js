const container = document.getElementById('container');
const elementInfo = document.getElementById('elementInfo');
const elName = document.getElementById('elName');
const elSymbol = document.getElementById('elSymbol');
const elNumber = document.getElementById('elNumber');
const viewMore = document.getElementById('viewMore');

let camera, scene, renderer, group;
let elementsData = {};
let objects = [];

init();

async function init() {
  // CAMERA
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 3000;

  // SCENE & GROUP
  scene = new THREE.Scene();
  group = new THREE.Group();
  scene.add(group);

  // RENDERER (CSS3D)
  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // FETCH DATA
  const response = await fetch(
    'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/refs/heads/master/periodic-table-lookup.json'
  );
  const data = await response.json();
  elementsData = data;

  buildTable(data);

  animate();

  window.addEventListener('resize', onWindowResize);
}

function buildTable(data) {
  const order = data.order;
  order.forEach(key => {
    const el = data[key];
    if (!el) return;

    const elemDiv = document.createElement('div');
    elemDiv.className = 'element';
    elemDiv.innerHTML = `
      <div class="number">${el.number}</div>
      <div class="symbol">${el.symbol}</div>
      <div class="mass">${Number(el.atomic_mass).toFixed(2)}</div>
    `;
    elemDiv.style.border = `2px solid #${el['cpk-hex'] || 'ffffff'}`;

    elemDiv.addEventListener('click', () => {
      elName.textContent = el.name;
      elSymbol.textContent = `Symbol: ${el.symbol}`;
      elNumber.textContent = `Atomic Number: ${el.number}`;
      elementInfo.classList.remove('hidden');
      viewMore.onclick = () => {
        localStorage.setItem('selectedElement', JSON.stringify(el));
        window.location.href = 'element.html';
      };
    });

    const objectCSS = new THREE.CSS3DObject(elemDiv);

    // 🔥 Correct positioning — table centered in view
    const spacingX = 120;
    const spacingY = 160;
    const centerOffsetX = 9;
    const centerOffsetY = 4;
    const x = (el.xpos - centerOffsetX) * spacingX;
    const y = -(el.ypos - centerOffsetY) * spacingY;

    objectCSS.position.set(x, y, 0);
    group.add(objectCSS);
    objects.push(objectCSS);
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (group) group.rotation.y += 0.001;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
