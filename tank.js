class Tank {
    constructor(id, x, y, name, colorConfig) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = colorConfig || window.CONFIG.TANK_COLORS[0];
        
        this.bodyAngle = 0;
        this.turretAngle = 0;
        this.health = window.CONFIG.MAX_HEALTH;
        this.score = 0;
        this.isAlive = true;

        this.trackOffset = 0;
    }

    moveForward(speed) {
        this.x += Math.cos(this.bodyAngle) * speed;
        this.y += Math.sin(this.bodyAngle) * speed;
        this.trackOffset = (this.trackOffset + speed * 0.5) % 10;
    }

    rotateTowards(targetAngle, maxStep) {
        let diff = targetAngle - this.bodyAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) < maxStep) {
            this.bodyAngle = targetAngle;
        } else {
            this.bodyAngle += Math.sign(diff) * maxStep;
        }
    }

    rotateTurretTowards(targetAngle, maxStep) {
        let diff = targetAngle - this.turretAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) < maxStep) {
            this.turretAngle = targetAngle;
        } else {
            this.turretAngle += Math.sign(diff) * maxStep;
        }
    }

    getMuzzlePosition() {
        const barrelLength = 32;
        return {
            x: this.x + Math.cos(this.turretAngle) * barrelLength,
            y: this.y + Math.sin(this.turretAngle) * barrelLength,
            angle: this.turretAngle
        };
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.isAlive = false;
        }
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.health = window.CONFIG.MAX_HEALTH;
        this.isAlive = true;
    }

    render(ctx) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // 1. Ketten & Panzerchassis
        ctx.save();
        ctx.rotate(this.bodyAngle);

        // Ketten (Links & Rechts)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-22, -20, 44, 8);
        ctx.fillRect(-22, 12, 44, 8);

        // Ketten-Muster Animation
        ctx.fillStyle = "#475569";
        for (let i = -20 + (this.trackOffset % 10); i < 20; i += 8) {
            ctx.fillRect(i, -20, 3, 8);
            ctx.fillRect(i, 12, 3, 8);
        }

        // Hauptgehäuse
        ctx.fillStyle = this.color.body;
        ctx.fillRect(-20, -14, 40, 28);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, -14, 40, 28);
        ctx.restore();

        // 2. Turm & Kanonenrohr
        ctx.save();
        ctx.rotate(this.turretAngle);

        // Kanonenrohr
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, -4, 30, 8);
        ctx.strokeRect(0, -4, 30, 8);

        // Mündungsbremse
        ctx.fillRect(26, -5, 6, 10);

        // Turmbasis
        ctx.fillStyle = this.color.turret;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 3. Name & Lebensbalken über dem Panzer
        ctx.restore();

        ctx.save();
        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y - 32);

        // Healthbar
        const barW = 40;
        const barH = 5;
        const pct = this.health / window.CONFIG.MAX_HEALTH;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - barW / 2, this.y - 27, barW, barH);
        ctx.fillStyle = pct > 0.4 ? "#22c55e" : "#ef4444";
        ctx.fillRect(this.x - barW / 2, this.y - 27, barW * pct, barH);
        ctx.restore();
    }
}
