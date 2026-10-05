class Game {
    constructor(uiManager) {
        this.ui = uiManager;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.map = new GameMap(window.CONFIG.MAP_WIDTH, window.CONFIG.MAP_HEIGHT);
        this.playerController = null;
        this.multiplayer = null;
        
        this.localPlayerId = "player_" + Math.random().toString(36).substring(2, 9);
        this.localTank = null;
        this.remoteTanks = new Map();
        
        this.bullets = [];
        this.explosions = [];
        
        this.camera = { x: 0, y: 0 };
        this.isRunning = false;
        this.lastTime = performance.now();
        
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start(playerData) {
        const spawnPos = this.map.getRandomSpawnPoint();
        
        this.localTank = new Tank(
            this.localPlayerId,
            spawnPos.x,
            spawnPos.y,
            playerData.name,
            playerData.color
        );

        this.playerController = new PlayerController(this.localTank, this.canvas, () => this.shootLocalBullet());
        this.multiplayer = new MultiplayerManager(this);
        
        this.multiplayer.connect(this.localPlayerId, {
            name: playerData.name,
            colorIndex: playerData.colorIndex,
            x: this.localTank.x,
            y: this.localTank.y,
            bodyAngle: this.localTank.bodyAngle,
            turretAngle: this.localTank.turretAngle,
            health: this.localTank.health,
            score: this.localTank.score
        });

        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    shootLocalBullet() {
        if (!this.localTank || !this.localTank.isAlive) return;
        
        const bulletData = this.localTank.getMuzzlePosition();
        if (bulletData) {
            const bullet = new Bullet(
                "b_" + Math.random().toString(36).substring(2, 9),
                this.localPlayerId,
                bulletData.x,
                bulletData.y,
                bulletData.angle
            );
            this.bullets.push(bullet);
            this.multiplayer.broadcastShoot(bullet);
        }
    }

    spawnRemoteBullet(data) {
        const bullet = new Bullet(data.id, data.ownerId, data.x, data.y, data.angle);
        this.bullets.push(bullet);
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        // Lokalen Spieler aktualisieren
        if (this.localTank && this.localTank.isAlive) {
            this.playerController.update(dt, this.camera);
            this.map.checkTankCollision(this.localTank);
            this.multiplayer.syncLocalState(this.localTank);
            this.ui.updateHealth(this.localTank.health);
        }

        // Kamera auf den lokalen Spieler ausrichten
        if (this.localTank) {
            this.camera.x = this.localTank.x - this.canvas.width / 2;
            this.camera.y = this.localTank.y - this.canvas.height / 2;
        }

        // Projektile & Kollisionen verarbeiten
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt);

            if (this.map.checkBulletCollision(b)) {
                this.explosions.push(new Explosion(b.x, b.y, 12));
                this.bullets.splice(i, 1);
                continue;
            }

            // Hit-Detection für den lokalen Spieler (Serverseitige Autonomie)
            if (b.ownerId !== this.localPlayerId && this.localTank && this.localTank.isAlive) {
                const dist = Math.hypot(b.x - this.localTank.x, b.y - this.localTank.y);
                if (dist < window.CONFIG.TANK_RADIUS) {
                    this.explosions.push(new Explosion(b.x, b.y, 18));
                    this.bullets.splice(i, 1);
                    this.localTank.takeDamage(window.CONFIG.BULLET_DAMAGE);
                    
                    if (!this.localTank.isAlive) {
                        this.handleLocalDeath(b.ownerId);
                    }
                    continue;
                }
            }

            if (b.isExpired()) {
                this.bullets.splice(i, 1);
            }
        }

        // Explosionen aktualisieren
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(dt);
            if (this.explosions[i].finished) {
                this.explosions.splice(i, 1);
            }
        }

        this.ui.updateLeaderboard(this.localTank, this.remoteTanks);
    }

    handleLocalDeath(killerId) {
        this.explosions.push(new Explosion(this.localTank.x, this.localTank.y, 40));
        this.multiplayer.broadcastDeath(this.localPlayerId, killerId);
        
        setTimeout(() => {
            const respawn = this.map.getRandomSpawnPoint();
            this.localTank.respawn(respawn.x, respawn.y);
        }, 3000);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.map.render(this.ctx);

        // Entfernte Panzer rendern
        this.remoteTanks.forEach((tank) => {
            if (tank.isAlive) tank.render(this.ctx);
        });

        // Lokalen Panzer rendern
        if (this.localTank && this.localTank.isAlive) {
            this.localTank.render(this.ctx);
        }

        // Bullets & Explosionen rendern
        this.bullets.forEach((b) => b.render(this.ctx));
        this.explosions.forEach((e) => e.render(this.ctx));

        this.ctx.restore();
    }
}
