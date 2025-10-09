const container = document.getElementById('container');
const elementInfo = document.getElementById('elementInfo');
const elName = document.getElementById('elName');
const elSymbol = document.getElementById('elSymbol');
const elNumber = document.getElementById('elNumber');
const viewMore = document.getElementById('viewMore');

let camera, scene, renderer;
let controls;
let objects = [];
let elementsData = {};

init();
animate();

async function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 3000;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const response = await fetch(
    'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/refs/heads/master/periodic-table-lookup.json'
  );
  const data = await response.json();
  elementsData = data;

  buildTable(data);

  window.addEventListener('resize', onWindowResize);
}

function buildTable(data) {
  const order = data.order;
  order.forEach(key => {
    const el = data[key];
    const elemDiv = document.createElement('div');
    elemDiv.className = 'element';
    elemDiv.innerHTML = `
      <div class="number">${el.number}</div>
      <div class="symbol">${el.symbol}</div>
      <div class="mass">${el.atomic_mass.toFixed(2)}</div>
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
    const x = (el.xpos - 9) * 160;
    const y = -(el.ypos - 5) * 180;
    objectCSS.position.set(x, y, 0);
    scene.add(objectCSS);
    objects.push(objectCSS);
  });
}

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.001;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
