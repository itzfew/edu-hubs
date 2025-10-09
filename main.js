const container = document.getElementById('container');
const elementInfo = document.getElementById('elementInfo');
const elName = document.getElementById('elName');
const elSymbol = document.getElementById('elSymbol');
const elNumber = document.getElementById('elNumber');
const viewMore = document.getElementById('viewMore');

let camera, scene, renderer;
let group; // make sure declared at top
let elementsData = {};
let objects = [];

init();

async function init() {
  // === CAMERA ===
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = 3000;

  // === SCENE & GROUP ===
  scene = new THREE.Scene();
  group = new THREE.Group();
  scene.add(group); // 🟢 this ensures group is always defined

  // === RENDERER ===
  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // === FETCH DATA ===
  const response = await fetch(
    'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/refs/heads/master/periodic-table-lookup.json'
  );
  const data = await response.json();
  elementsData = data;

  buildTable(data);
  animate(); // 🟢 Call after group has been created

  window.addEventListener('resize', onWindowResize);
}

function buildTable(data) {
  const order = data.order;

  order.forEach(key => {
    const el = data[key];
    if (!el) return; // safety check

    // === Element DIV ===
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

    // === Position in 3D Space ===
    const objectCSS = new THREE.CSS3DObject(elemDiv);
    const x = (el.xpos - 9) * 160;
    const y = -(el.ypos - 5) * 180;
    objectCSS.position.set(x, y, 0);
    group.add(objectCSS);
    objects.push(objectCSS);
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (group) group.rotation.y += 0.001; // ✅ check group exists
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
