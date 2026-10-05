class PlayerController {
    constructor(tank, canvas, onShootCallback) {
        this.tank = tank;
        this.canvas = canvas;
        this.onShoot = onShootCallback;

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.touchMove = { active: false, x: 0, y: 0 };
        this.touchAim = { active: false, x: 0, y: 0 };

        this.setupKeyboard();
        this.setupTouchControls();
    }

    setupKeyboard() {
        window.addEventListener("keydown", (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key.toLowerCase()] = false);

        window.addEventListener("mousemove", (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        window.addEventListener("mousedown", (e) => {
            if (e.button === 0 && this.tank.isAlive) {
                this.onShoot();
            }
        });
    }

    setupTouchControls() {
        const moveZone = document.getElementById("move-joystick-zone");
        const moveStick = document.getElementById("move-joystick-stick");
        const aimZone = document.getElementById("aim-joystick-zone");
        const aimStick = document.getElementById("aim-joystick-stick");
        const fireBtn = document.getElementById("touch-fire-btn");

        this.bindJoystick(moveZone, moveStick, (dir) => {
            this.touchMove = dir;
        });

        this.bindJoystick(aimZone, aimStick, (dir) => {
            this.touchAim = dir;
        });

        if (fireBtn) {
            fireBtn.addEventListener("touchstart", (e) => {
                e.preventDefault();
                this.onShoot();
            });
        }
    }

    bindJoystick(zone, stick, onChange) {
        if (!zone || !stick) return;

        let touchId = null;
        let startX = 0;
        let startY = 0;
        const maxDist = 45;

        zone.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (touchId !== null) return;

            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = zone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        });

        window.addEventListener("touchmove", (e) => {
            if (touchId === null) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchId) {
                    const dx = touch.clientX - startX;
                    const dy = touch.clientY - startY;
                    const dist = Math.hypot(dx, dy);
                    const angle = Math.atan2(dy, dx);

                    const clampedDist = Math.min(dist, maxDist);
                    const stickX = Math.cos(angle) * clampedDist;
                    const stickY = Math.sin(angle) * clampedDist;

                    stick.style.transform = `translate(\({stickX}px,\){stickY}px)`;
                    onChange({ active: true, x: stickX / maxDist, y: stickY / maxDist });
                }
            }
        });

        const handleTouchEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null;
                    stick.style.transform = `translate(0px, 0px)`;
                    onChange({ active: false, x: 0, y: 0 });
                }
            }
        };

        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("touchcancel", handleTouchEnd);
    }

    update(dt, camera) {
        // 1. Bewegungssteuerung (Tastatur oder Touch-Joystick)
        let moveX = 0;
        let moveY = 0;

        if (this.keys["w"] || this.keys["arrowup"]) moveY -= 1;
        if (this.keys["s"] || this.keys["arrowdown"]) moveY += 1;
        if (this.keys["a"] || this.keys["arrowleft"]) moveX -= 1;
        if (this.keys["d"] || this.keys["arrowright"]) moveX += 1;

        if (this.touchMove.active) {
            moveX = this.touchMove.x;
            moveY = this.touchMove.y;
        }

        if (moveX !== 0 || moveY !== 0) {
            const targetAngle = Math.atan2(moveY, moveX);
            this.tank.rotateTowards(targetAngle, window.CONFIG.TANK_ROTATE_SPEED);
            
            const speed = window.CONFIG.TANK_SPEED * Math.min(Math.hypot(moveX, moveY), 1);
            this.tank.moveForward(speed);
        }

        // 2. Turmausrichtung (Maus auf Desktop vs Aim-Joystick auf iPad)
        if (this.touchAim.active) {
            const aimAngle = Math.atan2(this.touchAim.y, this.touchAim.x);
            this.tank.turretAngle = aimAngle;
        } else {
            const worldMouseX = this.mousePos.x + camera.x;
            const worldMouseY = this.mousePos.y + camera.y;
            const angleToMouse = Math.atan2(worldMouseY - this.tank.y, worldMouseX - this.tank.x);
            this.tank.rotateTurretTowards(angleToMouse, window.CONFIG.TURRET_ROTATE_SPEED);
        }
    }
}
