class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.supabase = window.supabase.createClient(
            window.CONFIG.SUPABASE_URL,
            window.CONFIG.SUPABASE_ANON_KEY
        );
        this.channel = null;
        this.lastSync = 0;
    }

    connect(localId, initialPayload) {
        this.channel = this.supabase.channel("tank-game-room", {
            config: { presence: { key: localId } }
        });

        // 1. Presence Integration (Spieler verbinden/trennen)
        this.channel.on("presence", { event: "sync" }, () => {
            const state = this.channel.presenceState();
            this.syncRemotePlayers(state, localId);
        });

        // 2. Broadcast Listener (Echtzeit Positions- & Schussdaten)
        this.channel.on("broadcast", { event: "tank-state" }, (payload) => {
            if (payload.payload.id === localId) return;
            this.updateRemoteTankState(payload.payload);
        });

        this.channel.on("broadcast", { event: "shoot" }, (payload) => {
            if (payload.payload.ownerId === localId) return;
            this.game.spawnRemoteBullet(payload.payload);
        });

        this.channel.on("broadcast", { event: "player-death" }, (payload) => {
            if (payload.payload.killerId === localId) {
                this.game.localTank.score += 1;
            }
        });

        this.channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await this.channel.track(initialPayload);
            }
        });
    }

    syncRemotePlayers(presenceState, localId) {
        const currentIds = new Set();

        Object.keys(presenceState).forEach((key) => {
            if (key === localId) return;
            currentIds.add(key);

            const user = presenceState[key][0];
            if (!this.game.remoteTanks.has(key)) {
                const color = window.CONFIG.TANK_COLORS[user.colorIndex || 0];
                const newTank = new Tank(key, user.x, user.y, user.name, color);
                this.game.remoteTanks.set(key, newTank);
            }
        });

        // Verlassene Spieler aufräumen
        this.game.remoteTanks.forEach((_, id) => {
            if (!currentIds.has(id)) {
                this.game.remoteTanks.delete(id);
            }
        });
    }

    updateRemoteTankState(data) {
        const tank = this.game.remoteTanks.get(data.id);
        if (tank) {
            // Sanfte Interpolation der Position & Winkel
            tank.x += (data.x - tank.x) * 0.4;
            tank.y += (data.y - tank.y) * 0.4;
            tank.bodyAngle = data.bodyAngle;
            tank.turretAngle = data.turretAngle;
            tank.health = data.health;
            tank.score = data.score;
            tank.isAlive = data.isAlive;
        }
    }

    syncLocalState(localTank) {
        const now = performance.now();
        if (now - this.lastSync < (1000 / window.CONFIG.TICK_RATE)) return;
        this.lastSync = now;

        if (!this.channel) return;

        this.channel.send({
            type: "broadcast",
            event: "tank-state",
            payload: {
                id: localTank.id,
                x: localTank.x,
                y: localTank.y,
                bodyAngle: localTank.bodyAngle,
                turretAngle: localTank.turretAngle,
                health: localTank.health,
                score: localTank.score,
                isAlive: localTank.isAlive
            }
        });
    }

    broadcastShoot(bullet) {
        if (!this.channel) return;
        this.channel.send({
            type: "broadcast",
            event: "shoot",
            payload: {
                id: bullet.id,
                ownerId: bullet.ownerId,
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle
            }
        });
    }

    broadcastDeath(victimId, killerId) {
        if (!this.channel) return;
        this.channel.send({
            type: "broadcast",
            event: "player-death",
            payload: { victimId, killerId }
        });
    }
}
