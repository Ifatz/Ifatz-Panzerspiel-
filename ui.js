class UIManager {
    constructor() {
        this.selectedColorIndex = 0;
        this.startScreen = document.getElementById("start-screen");
        this.hudOverlay = document.getElementById("hud-overlay");
        this.playerNameInput = document.getElementById("player-name");
        this.colorPicker = document.getElementById("color-picker");
        this.startBtn = document.getElementById("start-btn");

        this.hudPlayerName = document.getElementById("hud-player-name");
        this.hudHealthBar = document.getElementById("hud-health-bar");
        this.leaderboardList = document.getElementById("leaderboard-list");
    }

    init(onStartCallback) {
        this.renderColorPicker();

        this.startBtn.addEventListener("click", () => {
            const name = this.playerNameInput.value.trim() || "Kommandant";
            const playerData = {
                name: name,
                colorIndex: this.selectedColorIndex,
                color: window.CONFIG.TANK_COLORS[this.selectedColorIndex]
            };

            this.startScreen.classList.add("hidden");
            this.hudOverlay.classList.remove("hidden");
            this.hudPlayerName.textContent = name;

            onStartCallback(playerData);
        });
    }

    renderColorPicker() {
        this.colorPicker.innerHTML = "";
        window.CONFIG.TANK_COLORS.forEach((color, index) => {
            const opt = document.createElement("div");
            opt.className = `color-option ${index === 0 ? "selected" : ""}`;
            opt.style.backgroundColor = color.body;

            opt.addEventListener("click", () => {
                document.querySelectorAll(".color-option").forEach((el) => el.classList.remove("selected"));
                opt.classList.add("selected");
                this.selectedColorIndex = index;
            });

            this.colorPicker.appendChild(opt);
        });
    }

    updateHealth(health) {
        const pct = Math.max(0, health) / window.CONFIG.MAX_HEALTH * 100;
        this.hudHealthBar.style.width = `${pct}%`;
        this.hudHealthBar.style.backgroundColor = pct > 40 ? "#22c55e" : "#ef4444";
    }

    updateLeaderboard(localTank, remoteTanksMap) {
        const players = [];

        if (localTank) {
            players.push({ name: localTank.name, score: localTank.score, isLocal: true });
        }

        remoteTanksMap.forEach((tank) => {
            players.push({ name: tank.name, score: tank.score, isLocal: false });
        });

        players.sort((a, b) => b.score - a.score);

        this.leaderboardList.innerHTML = "";
        players.slice(0, 5).forEach((p) => {
            const li = document.createElement("li");
            li.textContent = `\({p.name}:\){p.score} Kills`;
            if (p.isLocal) li.style.fontWeight = "bold";
            this.leaderboardList.appendChild(li);
        });
    }
}
