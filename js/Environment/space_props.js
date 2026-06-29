import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    State.starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1, // Grandezza delle stelle
        transparent: true,
        opacity:1
    });

    const starVertices = [];
    for (let i = 0; i < 3200; i++) {
        // Creiamo posizioni casuali in un raggio molto ampio (es. tra -500 e 500)
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        //Escludiamo le stelle troppo vicine alla stanza
        if (x > -50 && x < 50 && y > -200 && y < 50 && z > -50 && z < 50) {
        } else{
            starVertices.push(x, y, z);
        }
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    
    const stars = new THREE.Points(starGeometry, State.starMaterial);
    State.scene.add(stars);
    
    return stars; // Lo restituiamo se vogliamo farlo ruotare dopo
}

export function createGalaxy( x, y, z, coreColorInput = '#ffe6aa', armColorInput = '#ff00aa') {
    const particleCount = 15000; // Numero di stelle nella galassia
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Parametri della galassia
    const arms = 3;             // Numero di bracci della spirale
    const galaxyRadius = 80;    // Raggio della galassia
    const coreColor = new THREE.Color(coreColorInput); // Centro caldo (giallo/bianco)
    const armColor = new THREE.Color(armColorInput);  // Bracci freddi (viola/magenta)

    for (let i = 0; i < particleCount; i++) {
        // 1. POSIZIONE
        // Distanza dal centro (più stelle vicino al centro, meno fuori)
        const radius = Math.random() * galaxyRadius * Math.pow(Math.random(), 2);
        
        // Calcolo dell'angolo per creare l'effetto spirale (Bracci)
        const armAngle = ((i % arms) / arms) * Math.PI * 2;
        const spinAngle = radius * 0.1; // Determina quanto si "avvolge" la spirale

        // Casualità per dare spessore ai bracci (effetto nuvola)
        const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.1);
        const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.05); // Più piatta sull'asse Y
        const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.1);

        const i3 = i * 3;
        positions[i3]     = Math.cos(armAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY; // Altezza della galassia
        positions[i3 + 2] = Math.sin(armAngle + spinAngle) * radius + randomZ;

        // 2. COLORE (Sfumatura dal nucleo ai bracci)
        const mixedColor = coreColor.clone();
        // Sfumiamo tra il colore del nucleo e quello dei bracci in base alla distanza
        mixedColor.lerp(armColor, radius / galaxyRadius);

        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Materiale delle singole stelle della galassia
    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true, // Dice a Three.js di usare i colori calcolati sopra
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending, // Illumina fondendo le particelle al centro
        depthWrite: false, // Impedisce alle particelle di coprirsi a vicenda con quadrati neri
        fog: false // Non viene cancellata dalla nebbia di gioco
    });

    State.galaxy = new THREE.Points(geometry, material);
    
    // Posizioniamo la galassia LONTANISSIMA nel cielo
    // Scegli coordinate molto grandi (es. x: 500, y: 300, z: -600)
    State.galaxy.position.set(x, y, z);
    
    // Ruotiamola leggermente per vederla "di taglio/in diagonale" (più suggestiva)
    State.galaxy.rotation.x = 0.6;
    State.galaxy.rotation.z = 0.2;

    State.galaxies.push(State.galaxy);
}

export function createBlackHole(x, y, z){
    // --- IL BUCO NERO ---
    State.blackHoleGroup = new THREE.Group();
    // Posizionalo esattamente sotto la stanza iniziale, molto in profondità
    State.blackHoleGroup.position.set(x, y, z); 

    // 1. L'Orizzonte degli Eventi (La sfera nera del nulla)
    const bhGeo = new THREE.SphereGeometry(40, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeo, bhMat);
    State.blackHoleGroup.add(blackHole);

    // 2. Il Disco di Accrescimento (Sistema di Particelle Attivo)
    const particleCount = 10000; // 10.000 frammenti di materia!
    const diskGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const innerRadius = 42; // Appena fuori dalla sfera nera
    const outerRadius = 130; // Fin dove si estende il disco

    // Colori termici: caldissimo al centro, freddo ai bordi
    const hotColor = new THREE.Color(0xffffff); // Bianco/Giallo incandescente
    const coldColor = new THREE.Color(0xaa1100); // Viola profondo

    for (let i = 0; i < particleCount; i++) {
        // Distribuiamo le particelle. La formula "Math.pow" concentra più polvere vicino al centro
        const r = innerRadius + Math.pow(Math.random(), 3) * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;

        // Variazione sull'asse Y per dare spessore al disco
        // Più le particelle sono vicine al centro, più il disco è sottile e schiacciato dalla gravità
        const yThickness = (Math.random() - 0.5) * (800 / r); 

        const i3 = i * 3;
        positions[i3] = Math.cos(theta) * r;
        positions[i3 + 1] = yThickness; 
        positions[i3 + 2] = Math.sin(theta) * r;

        // Sfumatura di colore in base alla distanza
        const mixedColor = hotColor.clone();
        mixedColor.lerp(coldColor, (r - innerRadius) / (outerRadius - innerRadius));

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    diskGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const diskMat = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // La luce si somma rendendo il centro abbagliante
        depthWrite: false, // LA MAGIA ANTI-COMPENETRAZIONE! Ora i bordi non "tagliano" la sfera.
        fog: false
    });

    State.accretionDisk = new THREE.Points(diskGeo, diskMat);
    
    // Incliniamo leggermente l'intero buco nero per un effetto più cinematografico
    State.blackHoleGroup.rotation.z = 0.2; 
    State.blackHoleGroup.add(State.accretionDisk);

    State.scene.add(State.blackHoleGroup);
}