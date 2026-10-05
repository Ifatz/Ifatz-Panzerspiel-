window.addEventListener("DOMContentLoaded", () => {
    const ui = new UIManager();
    const game = new Game(ui);

    ui.init((playerData) => {
        game.start(playerData);
    });

    window.addEventListener("resize", () => {
        game.resizeCanvas();
    });
});
