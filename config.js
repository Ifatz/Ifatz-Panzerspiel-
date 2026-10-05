window.CONFIG = {
    SUPABASE_URL: "https://olviztyhnhhahtkyikjsx.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdml6dHlobmhhaHRreWlranN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjY1NDcsImV4cCI6MjEwNjcwMjU0N30.0_p8VFoJkYNRrOlEJK3BIVfV11MaVvSqFNH7OY8Ez58",
    
    // Map & Kamera
    MAP_WIDTH: 2800,
    MAP_HEIGHT: 2000,
    TICK_RATE: 30, // Broadcasts pro Sekunde
    
    // Panzer-Eigenschaften
    TANK_RADIUS: 24,
    TANK_SPEED: 3.5,
    TANK_ROTATE_SPEED: 0.05,
    TURRET_ROTATE_SPEED: 0.08,
    MAX_HEALTH: 100,
    
    // Waffen
    BULLET_SPEED: 11,
    BULLET_RADIUS: 5,
    BULLET_DAMAGE: 20,
    SHOOT_COOLDOWN: 300, // ms
    
    // Farben
    TANK_COLORS: [
        { name: "Grün", body: "#4CAF50", turret: "#2E7D32" },
        { name: "Blau", body: "#2196F3", turret: "#1565C0" },
        { name: "Rot", body: "#F44336", turret: "#C62828" },
        { name: "Gelb", body: "#FFEB3B", turret: "#F57F17" },
        { name: "Lila", body: "#9C27B0", turret: "#6A1B9A" }
    ]
};
