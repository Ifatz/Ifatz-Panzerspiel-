class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.obstacles = [];

        this.generateObstacles();
    }

    generateObstacles() {
        // Feste Hindernisse (Blöcke) auf der Karte platzieren
        const cols = 7;
        const rows = 5;
        const spacingX = this.width / cols;
        const spacingY = this.height / rows;

        for (let c = 1; c < cols; c++) {
            for (let r = 1; r < rows; r++) {
                if ((c + r) % 2 === 0) {
                    this.obstacles.push({
                        x: c * spacingX - 60,
                        y: r * spacingY - 60,
                        width: 120,
                        height: 120
                    });
                }
            }
        }
    }

    getRandomSpawnPoint() {
        let valid = false;
        let x = 0;
        let y = 0;

        while (!valid) {
            x = Math.random() * (this.width - 200) + 100;
            y = Math.random() * (this.height - 200) + 100;
            valid = !this.obstacles.some((obs) => 
                x > obs.x - 40 && x < obs.x + obs.width + 40 &&
                y > obs.y - 40 && y < obs.y + obs.height + 40
            );
        }
        return { x, y };
    }

    checkTankCollision(tank) {
        const r = window.CONFIG.TANK_RADIUS;

        // Weltbegrenzung
        tank.x = Math.max(r, Math.min(this.width - r, tank.x));
        tank.y = Math.max(r, Math.min(this.height - r, tank.y));

        // Hinderniskollision
        this.obstacles.forEach((obs) => {
            const closestX = Math.max(obs.x, Math.min(tank.x, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(tank.y, obs.y + obs.height));

            const distX = tank.x - closestX;
            const distY = tank.y - closestY;
            const distance = Math.hypot(distX, distY);

            if (distance < r) {
                const overlap = r - distance;
                const angle = Math.atan2(distY, distX);
                tank.x += Math.cos(angle) * overlap;
                tank.y += Math.sin(angle) * overlap;
            }
        });
    }

    checkBulletCollision(bullet) {
        // Außerhalb der Map
        if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
            return true;
        }

        // Kollision mit Blöcken
        return this.obstacles.some((obs) => 
            bullet.x >= obs.x && bullet.x <= obs.x + obs.width &&
            bullet.y >= obs.y && bullet.y <= obs.y + obs.height
        );
    }

    render(ctx) {
        // Hintergrundeigenschaften (Gitter/Boden)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, this.width, this.height);

        // Gitterlinien
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        const gridSize = 80;

        for (let x = 0; x <= this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let y = 0; y <= this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Außenwand
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, this.width, this.height);

        // Hindernisse zeichnen
        ctx.fillStyle = "#475569";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;

        this.obstacles.forEach((obs) => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
}
