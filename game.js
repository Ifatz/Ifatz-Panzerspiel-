class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'MENU';
        this.selectedTankId = 'medium';
        this.isSecretUnlocked = false;

        // Multi-Touch Variablen
        this.touchMoveId = null;
        this.touchAimId = null;
        this.aimStartPos = { x: 0, y: 0 };
        this.aimStartTime = 0;
        this.isAutoAimActive = false;

        this.moveVector = { x: 0, y: 0 };
        this.aimAngle = 0;

        this.initResize();
        this.initUIEvents();
        this.initTouchControls();
        this.initDesktopSecretTrigger();
    }

    initResize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initUIEvents() {
        // Hauptmenü -> Panzer-Auswahl
        document.getElementById('main-play-btn').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('tank-select-screen').classList.remove('hidden');
            this.buildTankGrid();
            this.selectTank('medium');
        });

        // Panzer bestätigen -> Spiel starten
        document.getElementById('confirm-tank-btn').addEventListener('click', () => {
            document.getElementById('tank-select-screen').classList.add('hidden');
            document.getElementById('hud-overlay').classList.remove('hidden');
            const name = document.getElementById('player-name').value || 'Kommandant';
            document.getElementById('hud-player-name').innerText = name;
            this.state = 'PLAYING';
        });

        // Geheim-Element unten links
        document.getElementById('secret-trigger').addEventListener('click', () => {
            this.isSecretUnlocked = true;
            this.selectTank('secret_op');
        });

        // Rangliste Modal
        const modal = document.getElementById('leaderboard-modal');
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            modal.classList.toggle('hidden');
        });
        document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    buildTankGrid() {
        const grid = document.getElementById('tank-list');
        grid.innerHTML = '';
        Object.keys(TANK_CLASSES).forEach(key => {
            const t = TANK_CLASSES[key];
            if (t.isSecret && !this.isSecretUnlocked) return;

            const card = document.createElement('div');
            card.className = `tank-card ${key === this.selectedTankId ? 'selected' : ''}`;
            card.innerHTML = `
