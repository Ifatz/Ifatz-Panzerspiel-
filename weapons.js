class Bullet {
    constructor(id, ownerId, x, y, angle) {
        this.id = id;
        this.ownerId = ownerId;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = window.CONFIG.BULLET_SPEED;
        this.radius = window.CONFIG.BULLET_RADIUS;
        this.createdAt = performance.now();
        this.maxLifespan = 3000; // 3 Sek.
    }

    update(dt) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    isExpired() {
        return performance.now() - this.createdAt > this.maxLifespan;
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glüh-Effekt
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

class Explosion {
    constructor(x, y, maxRadius) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = maxRadius;
        this.alpha = 1;
        this.finished = false;
    }

    update(dt) {
        this.radius += 60 * dt;
        this.alpha -= 1.8 * dt;

        if (this.alpha <= 0) {
            this.finished = true;
        }
    }

    render(ctx) {
        if (this.finished) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = "#facc15";
        ctx.fill();
        ctx.restore();
    }
}
