class PeriodicTableApp {
    constructor() {
        this.elements = {};
        this.currentElement = null;
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.electrons = [];
        this.isDetailPage = window.location.pathname.includes('element.html');
        this.init();
    }

    async init() {
        await this.loadData();
        if (this.isDetailPage) {
            this.initDetailPage();
        } else {
            this.initTablePage();
        }
    }

    async loadData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/refs/heads/master/periodic-table-lookup.json');
            this.elements = await response.json();
        } catch (error) {
            console.error('Failed to load periodic table data:', error);
            alert('Failed to load periodic table data. Please try again later.');
        }
    }

    initTablePage() {
        this.renderTable();
        this.renderSeries();
        this.bindTableEvents();
        document.getElementById('table-btn').classList.add('active');
    }

    initDetailPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const elementName = urlParams.get('element');
        if (elementName && this.elements[elementName]) {
            this.showDetail(this.elements[elementName]);
        } else {
            document.getElementById('detail-page').innerHTML = '<p>Element not found.</p>';
        }
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    renderTable() {
        const container = document.getElementById('periodic-page');
        container.innerHTML = '';

        for (let row = 1; row <= 7; row++) {
            for (let col = 1; col <= 18; col++) {
                const cell = document.createElement('div');
                cell.className = 'element empty';
                cell.dataset.row = row;
                cell.dataset.col = col;
                container.appendChild(cell);
            }
        }

        Object.values(this.elements).forEach(el => {
            if (el.ypos >= 1 && el.ypos <= 7) {
                const target = container.querySelector(`[data-row="${el.ypos}"][data-col="${el.xpos}"]`);
                if (target) {
                    this.renderElementCell(target, el);
                }
            }
        });
    }

    renderSeries() {
        this.renderLanthanides();
        this.renderActinides();
    }

    renderLanthanides() {
        const container = document.getElementById('lanthanides-row');
        container.innerHTML = '<div class="series-label">Lanthanides</div>';
        for (let num = 57; num <= 71; num++) {
            const elName = this.getElementNameByNumber(num);
            if (elName) {
                const el = this.elements[elName];
                const cell = document.createElement('div');
                cell.className = 'element';
                this.renderElementCell(cell, el);
                container.appendChild(cell);
            }
        }
    }

    renderActinides() {
        const container = document.getElementById('actinides-row');
        container.innerHTML = '<div class="series-label">Actinides</div>';
        for (let num = 89; num <= 103; num++) {
            const elName = this.getElementNameByNumber(num);
            if (elName) {
                const el = this.elements[elName];
                const cell = document.createElement('div');
                cell.className = 'element';
                this.renderElementCell(cell, el);
                container.appendChild(cell);
            }
        }
    }

    renderElementCell(target, data) {
        target.classList.remove('empty');
        const categoryClass = `category-${data.category.replace(/\s+/g, '-').toLowerCase()}`;
        target.classList.add(categoryClass);
        target.innerHTML = `
            <div class="element-number">${data.number}</div>
            <div class="element-symbol">${data.symbol}</div>
            <div class="element-name">${data.name}</div>
        `;
        target.dataset.element = data.name.toLowerCase();
    }

    getElementNameByNumber(num) {
        for (let key in this.elements) {
            if (this.elements[key].number === num) return key;
        }
        return null;
    }

    bindTableEvents() {
        const clickHandler = (e) => {
            const elCell = e.target.closest('.element');
            if (elCell && !elCell.classList.contains('empty')) {
                const elName = elCell.dataset.element;
                window.location.href = `element.html?element=${elName}`;
            }
        };

        document.getElementById('periodic-page').addEventListener('click', clickHandler);
        document.getElementById('lanthanides-row').addEventListener('click', clickHandler);
        document.getElementById('actinides-row').addEventListener('click', clickHandler);
    }

    showDetail(data) {
        this.currentElement = data;
        document.getElementById('detail-symbol').textContent = data.symbol;
        document.getElementById('detail-name').textContent = data.name;
        document.getElementById('detail-number').textContent = `Atomic Number: ${data.number} | Atomic Mass: ${data.atomic_mass}`;
        this.renderProperties(data);
        this.renderSummary(data);
        this.render3DBohrModel(data);
    }

    renderProperties(data) {
        const container = document.getElementById('properties');
        container.innerHTML = '';
        const props = [
            { label: 'Atomic Mass', value: data.atomic_mass },
            { label: 'Density', value: data.density },
            { label: 'Melting Point', value: data.melt },
            { label: 'Boiling Point', value: data.boil },
            { label: 'Phase', value: data.phase },
            { label: 'Category', value: data.category },
            { label: 'Group', value: data.group },
            { label: 'Period', value: data.period },
            { label: 'Block', value: data.block },
            { label: 'Electronegativity', value: data.electronegativity_pauling || 'N/A' },
            { label: 'Electron Affinity', value: data.electron_affinity || 'N/A' },
            { label: 'Electron Configuration', value: data.electron_configuration_semantic }
        ];
        props.forEach(prop => {
            if (prop.value !== null && prop.value !== undefined) {
                const div = document.createElement('div');
                div.className = 'property';
                div.innerHTML = `<span>${prop.label}:</span><span>${prop.value}</span>`;
                container.appendChild(div);
            }
        });
    }

    renderSummary(data) {
        document.getElementById('summary').textContent = data.summary;
    }

    render3DBohrModel(data) {
        const container = document.getElementById('bohr-container');
        container.innerHTML = '';

        if (!window.THREE) {
            container.innerHTML = '<p>Three.js failed to load. Please check your network and try again.</p>';
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / 400, 0.1, 1000);
        this.camera.position.set(0, 0, 10);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, 400);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const nucleusMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0x555500 });
        const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        this.scene.add(nucleus);

        const shellCapacities = [2, 8, 8, 18, 18, 32, 32];
        let remainingElectrons = data.number;
        let shellIndex = 0;
        this.electrons = [];

        while (remainingElectrons > 0 && shellIndex < shellCapacities.length) {
            const electronsInShell = Math.min(remainingElectrons, shellCapacities[shellIndex]);
            const radius = 1 + shellIndex * 0.8;

            const shellCurve = new THREE.EllipseCurve(0, 0, radius, radius);
            const points = shellCurve.getPoints(50);
            const shellGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const shellMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
            const shellLine = new THREE.Line(shellGeometry, shellMaterial);
            shellLine.rotation.x = Math.PI / 2;
            this.scene.add(shellLine);

            const angleStep = (2 * Math.PI) / electronsInShell;
            for (let i = 0; i < electronsInShell; i++) {
                const electronGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const electronMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff, emissive: 0x005577 });
                const electron = new THREE.Mesh(electronGeometry, electronMaterial);
                const angle = i * angleStep;
                electron.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
                this.scene.add(electron);
                this.electrons.push({ mesh: electron, radius, angle, speed: 0.02 + Math.random() * 0.01ទ:01
                    });
            remainingElectrons -= electronsInShell;
            shellIndex++;
        }

        const animate = () => {
            requestAnimationFrame(animate);
            this.electrons.forEach(e => {
                e.angle += e.speed;
                e.mesh.position.set(
                    e.radius * Math.cos(e.angle),
                    0,
                    e.radius * Math.sin(e.angle)
                );
            });
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();

        const resizeHandler = () => {
            this.camera.aspect = container.clientWidth / 400;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, 400);
        };
        window.addEventListener('resize', resizeHandler);
    }
}

new PeriodicTableApp();
