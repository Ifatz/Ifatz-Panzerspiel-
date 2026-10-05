// Zentrale Panzer-Definitionen & Geheim-System
const TANK_CLASSES = {
    light: {
        id: 'light',
        name: 'Leichter Panzer',
        desc: 'Sehr schnell, wenig Lebenspunkte, schnelle Nachladezeit.',
        hp: 70, speed: 1.4, damage: 15, range: 60, reload: 80,
        trait: 'Schneller Nachladevorgang',
        color: '#81c995'
    },
    medium: {
        id: 'medium',
        name: 'Mittlerer Panzer',
        desc: 'Ausgewogene Lebenspunkte, Geschwindigkeit und Schaden.',
        hp: 100, speed: 1.0, damage: 25, range: 75, reload: 100,
        trait: 'Ausgewogener Allrounder',
        color: '#8ab4f8'
    },
    heavy: {
        id: 'heavy',
        name: 'Schwerer Panzer',
        desc: 'Sehr viele Lebenspunkte, langsam, hoher Schaden.',
        hp: 160, speed: 0.65, damage: 45, range: 70, reload: 140,
        trait: 'Hohe Panzerung',
        color: '#f28b82'
    },
    scout: {
        id: 'scout',
        name: 'Scout-Panzer',
        desc: 'Extrem schnell und wendig zum Auskundschaften.',
        hp: 60, speed: 1.7, damage: 12, range: 65, reload: 70,
        trait: 'Extrem hohe Geschwindigkeit',
        color: '#fde293'
    },
    destroyer: {
        id: 'destroyer',
        name: 'Jagdpanzer',
        desc: 'Starke Schüsse, hohe Reichweite, längere Nachladezeit.',
        hp: 90, speed: 0.8, damage: 50, range: 95, reload: 130,
        trait: 'Hohe Durchschlagskraft',
        color: '#c58af9'
    },
    artillery: {
        id: 'artillery',
        name: 'Artillerie-Panzer',
        desc: 'Sehr große Reichweite mit hoher Explosionswirkung.',
        hp: 75, speed: 0.6, damage: 60, range: 100, reload: 170,
        trait: 'Explosiver Flächenschaden',
        color: '#ff8a65'
    },
    shotgun: {
        id: 'shotgun',
        name: 'Schrot-Panzer',
        desc: 'Feuert mehrere Projektile gleichzeitig auf kurze Distanz.',
        hp: 110, speed: 1.1, damage: 40, range: 45, reload: 110,
        trait: 'Streuschuss auf kurze Distanz',
        color: '#a1887f'
    },
    sniper: {
        id: 'sniper',
        name: 'Präzisionspanzer',
        desc: 'Hohe Projektilgeschwindigkeit und Reichweite.',
        hp: 70, speed: 0.9, damage: 42, range: 90, reload: 120,
        trait: 'Hohe Projektilgeschwindigkeit',
        color: '#4dd0e1'
    },
    support: {
        id: 'support',
        name: 'Unterstützungspanzer',
        desc: 'Mittlere Werte mit Team-Unterstützungsfähigkeit.',
        hp: 100, speed: 0.95, damage: 20, range: 70, reload: 95,
        trait: 'Unterstützungs-Fähigkeit',
        color: '#aed581'
    },
    // Geheimer Spezialpanzer (Gleicher Name & Aussehen wie Medium)
    secret_op: {
        id: 'secret_op',
        name: 'Mittlerer Panzer',
        desc: 'Ausgewogene Lebenspunkte, Geschwindigkeit und Schaden.',
        hp: 100, speed: 1.05, damage: 65, range: 85, reload: 60,
        trait: 'Ausgewogener Allrounder',
        color: '#8ab4f8',
        isSecret: true
    }
};

// Geheim-Feature Konfiguration
const SECRET_CONFIG = {
    keySequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    currentKeyIndex: 0,
    isUnlocked: false
};
