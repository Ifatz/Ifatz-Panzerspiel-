class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Spielstatus: 'MENU', 'SELECT', 'PLAYING'
        this.state = 'MENU';
        this.selectedTankId = 'medium';
        this.isSecretUnlocked = false;

        // Spieler-Position & Eigenschaften
        this.player = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            bodyAngle: 0,
            turretAngle: 0,
            currentHp: 100,
            maxHp: 100,
            lastShotTime: 0
        };

        // Gegner-Dummies (für Testzwecke & Auto-Aim)
        this.enemies = [
            { id: 1, x: window.innerWidth / 2 + 200, y: window.innerHeight / 2 - 150, hp: 100, radius: 25 },
            { id: 2, x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 + 100, hp: 100, radius: 25 }
        ];

        // Projektile
        this.projectiles = [];

        // Multi-Touch Tracker
        this.touchMoveId = null;
        this.touchAimId = null;
        this.aimStartPos = { x: 0, y: 0 };
        this.aimStartTime = 0;
        
        // Steuerungswerte
        this.moveVector = { x: 0, y: 0 };
        this.aimAngle = 0;
        this.isAutoAimActive = false;
        this.autoAimTarget = null;

        // Desktop Tastatur-Tracker
        this.keysPressed = {};

        this.initCanvasSize();
        this.initUIEvents();
        this.initTouchControls();
        this.initDesktopControls();
        this.initSecretListeners();

        // Game Loop starten
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    initCanvasSize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initUIEvents() {
        // Hauptmenü -> Panzer-Auswahl
        const mainPlayBtn = document.getElementById('main-play-btn');
        if (mainPlayBtn) {
            mainPlayBtn.addEventListener('click', () => {
                document.getElementById('main-menu').classList.add('hidden');
                document.getElementById('tank-select-screen').classList.remove('hidden');
                this.state = 'SELECT';
                this.buildTankGrid();
                this.selectTank('medium');
            });
        }

        // Panzer-Auswahl -> Spiel starten
        const confirmBtn = document.getElementById('confirm-tank-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                document.getElementById('tank-select-screen').classList.add('hidden');
                document.getElementById('hud-overlay').classList.remove('hidden');
                
                const nameInput = document.getElementById('player-name');
                const pName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Kommandant';
                document.getElementById('hud-player-name').innerText = pName;

                // Spielwerte anhand des gewählten Panzers setzen
                const tankData = TANK_CLASSES[this.selectedTankId];
                this.player.maxHp = tankData.hp;
                this.player.currentHp = tankData.hp;

                this.state = 'PLAYING';
            });
        }

        // Geheim-Element Klick (Unten Links)
        const secretTrigger = document.getElementById('secret-trigger');
        if (secretTrigger) {
            secretTrigger.addEventListener('click', () => {
                this.unlockSecretTank();
            });
        }

        // Ranglisten Modal Toggle
        const lbBtn = document.getElementById('leaderboard-btn');
        const lbModal = document.getElementById('leaderboard-modal');
        const closeLbBtn = document.getElementById('close-leaderboard-btn');

        if (lbBtn && lbModal) {
            lbBtn.addEventListener('click', () => lbModal.classList.toggle('hidden'));
        }
        if (closeLbBtn && lbModal) {
            closeLbBtn.addEventListener('click', () => lbModal.classList.add('hidden'));
        }
    }

    buildTankGrid() {
        const grid = document.getElementById('tank-list');
        if (!grid) return;
        grid.innerHTML = '';

        Object.keys(TANK_CLASSES).forEach(key => {
            const tank = TANK_CLASSES[key];
            // Geheimpanzer nicht im normalen Menü anzeigen, außer er ist freigeschaltet
            if (tank.isSecret && !this.isSecretUnlocked) return;

            const card = document.createElement('div');
            card.className = `tank-card ${key === this.selectedTankId ? 'selected' : ''}`;
            card.innerHTML = `
