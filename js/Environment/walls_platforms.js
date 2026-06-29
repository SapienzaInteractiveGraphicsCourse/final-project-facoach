import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';


export function addWall(x, y, z, w, h, d, color = 0x777777, texture = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    let mat;

    if (texture) {
        // 1. Cloniamo la texture. Questo crea una copia delle impostazioni di ripetizione
        // ma condivide la stessa immagine in memoria (quindi non pesa sulle prestazioni).
        const localTex = texture.clone();
        if (texture.image) {
            localTex.needsUpdate = true;
        }

        if (texture.name === "door") {
            localTex.repeat.set(1, 1.1); // La porta non si ripete, rimane unica
        } else {
            // 1. Parametri di base
            const textureWidth = 10; // Larghezza desiderata (modificala come preferisci)
            const roomHeight = 8;    // L'altezza totale della tua stanza
            const wallLength = Math.max(w, d);

            // 2. Calcolo Ripetizioni
            const repeatX = wallLength / textureWidth;
            
            // Invece di 1 fisso, la texture si ripete in proporzione all'altezza del muro
            // Es: un muro alto 8 ha repeat 1. Un muro alto 4 ha repeat 0.5 (mezza texture)
            const repeatY = h / roomHeight;
            
            localTex.repeat.set(repeatX, repeatY);

            // 3. Calcolo dell'Offset (L'allineamento verticale)
            // Troviamo il punto più basso del muro (y è il centro, quindi sottraiamo metà altezza)
            const bottomY = y - (h / 2);
            
            // Spostiamo la texture verso l'alto in base a quanto il muro è staccato da terra
            localTex.offset.y = bottomY / roomHeight;
        }
        mat = new THREE.MeshStandardMaterial({ 
            map: localTex, 
            color: 0xffffff 
        });
    } else {
        // Se non passiamo nessuna texture, usiamo il colore base
        mat = new THREE.MeshStandardMaterial({ color: color });
    }
    
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;

    State.scene.add(wall);
    State.walls.push(wall);
    return wall;
}

// Funzione helper per aggiungere piattaforme/rottami

export function addPlatform(x, y, z, w, d, texture, isMoving = false, type = 'normal', shape = 'square', wobble = false) {
    let geo;

    // --- 1. DISEGNO DEI FRAMMENTI DI NAVE IRREGOLARI ---
    if (shape === 'wreckage-A') {
        // Forma 1: Lamiera frastagliata a "L"
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/2);
        s.lineTo(w/2 * 0.8, -d/2 * 0.9); // Bordo storto
        s.lineTo(w/2, -d/2 * 0.2);       // Spacco profondo
        s.lineTo(w/2 * 0.7, 0);
        s.lineTo(w/2, d/2 * 0.8);
        s.lineTo(w/2 * 0.3, d/2);
        s.lineTo(-w/2 * 0.7, d/2 * 0.9);
        s.lineTo(-w/2 * 0.9, 0);
        s.lineTo(-w/2, -d/2);

        // Gonfiamo il disegno in 3D e smussiamo i bordi (bevel) per renderli metallici
        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2); // Lo sdraiamo a terra
        geo.translate(0, 0.25, 0); // Lo centriamo sull'asse Y per le collisioni

        // Applichiamo una proiezione cubica manuale alle UV
        const pos = geo.attributes.position;
        const uvs = [];

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            // Proiezione basata sulla posizione: 
            // "avvolge" la texture attorno all'oggetto
            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        // IL TRUCCO DELLE COLLISIONI: Falsifichiamo i parametri per ingannare animate()
        geo.parameters = { width: w, height: 0.5, depth: d };

    } else if (shape === 'wreckage-B') {
        // Forma 2: Ponte di volo spezzato a metà da un asteroide
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/2);
        s.lineTo(w/2, -d/2);
        s.lineTo(w/2, d/2);
        s.lineTo(-w/2 * 0.2, d/2); 
        s.lineTo(-w/2 * 0.5, d/2 * 0.5); // Area distrutta verso l'interno
        s.lineTo(-w/2 * 0.1, 0); 
        s.lineTo(-w/2, -d/2 * 0.5);
        s.lineTo(-w/2, -d/2);

        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2);
        geo.translate(0, 0.25, 0);

        // Applichiamo una proiezione cubica manuale alle UV
        const pos = geo.attributes.position;
        const uvs = [];


        //PER LE TEXTURE, MODIFICARE MAGARI USANDO MODELLI BLENDER
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            // Proiezione basata sulla posizione: 
            // "avvolge" la texture attorno all'oggetto
            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        
        // TRUCCO COLLISIONI
        geo.parameters = { width: w, height: 0.5, depth: d };

    } else if (shape === 'wreckage-C') {
        // Forma 3: Frammento "a croce" o strutturale (tipico di una trave spezzata)
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/4);
        s.lineTo(-w/4, -d/4);
        s.lineTo(-w/5, -d/2);
        s.lineTo(w/4, -d/2);
        s.lineTo(w/3, -d/4);
        s.lineTo(w/2, -d/5);
        s.lineTo(w/2, d/4);
        s.lineTo(w/3, d/3);
        s.lineTo(w/3.5, d/3);
        s.lineTo(-w/4, d/2);
        s.lineTo(-w/5, d/4);
        s.lineTo(-w/2, d/4);

        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2);
        geo.translate(0, 0.25, 0);

        // Applichiamo una proiezione cubica manuale alle UV
        const pos = geo.attributes.position;
        const uvs = [];

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            // Proiezione basata sulla posizione: 
            // "avvolge" la texture attorno all'oggetto
            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        geo.parameters = { width: w, height: 0.5, depth: d };
    } else {
        // Quadrato classico di default
        geo = new THREE.BoxGeometry(w, 0.5, d);
    }

    // --- 2. MATERIALI ---
    let mat;
    if (type === 'shadow') {
        mat = new THREE.MeshStandardMaterial({ 
            map: texture,
            metalness: 0.6,
            roughness: 0.4,
            opacity: 0
        });
    } else if (type === 'light-only') {
        mat = new THREE.MeshStandardMaterial({ 
            map: texture, 
            transparent: true, 
            opacity: 0 
        });
    } else {
        // Materiale più consono a rottami spaziali
        mat = new THREE.MeshStandardMaterial({ 
            map: texture,
            metalness: 0.6,
            roughness: 0.4 
        });
    }

    const plat = new THREE.Mesh(geo, mat);
    plat.position.set(x, y, z);
    plat.castShadow = true;
    plat.receiveShadow = true;

    // --- 3. CAVI ROTTI E MENO INGOMBRANTI ---
    if (type === 'normal' || type === 'shadow') {
        const brokenCablesCount = Math.floor(Math.random() * 3) + 1; // 1 o 3 cavi
        
        //MODIFICARE USANDO FUNZIONE APPOSTA
        for (let i = 0; i < brokenCablesCount; i++) {
            // Scegliamo un punto casuale LUNGO IL PERIMETRO (i bordi) usando un po' di trigonometria
            const randomAngle = Math.random() * Math.PI * 2;
            // Posizioniamo il cavo all'85% della distanza dal centro (quindi sui bordi)
            const localStartX = Math.cos(randomAngle) * (w / 2) * 0.85;
            const localStartZ = Math.sin(randomAngle) * (d / 2) * 0.85;

            // Cavi molto più corti e dinamici
            const cablePoints = [
                new THREE.Vector3(localStartX, -0.25, localStartZ), 
                new THREE.Vector3(localStartX + (Math.random() - 0.5) * 0.2, -0.6, localStartZ + (Math.random() - 0.5) * 0.2), 
                new THREE.Vector3(localStartX + (Math.random() - 0.5) * 0.5, -0.9, localStartZ + (Math.random() - 0.5) * 0.5)  
            ];

            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            // Raggio del tubo dimezzato (0.015 invece di 0.03) -> Molto più snelli!
            const cableGeo = new THREE.TubeGeometry(cableCurve, 16, 0.015, 6, false);
            
            const brokenCableMat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.8,
                emissive: type === 'shadow' ? 0xc30010 : 0xc30010, 
                emissiveIntensity: 1.2
            });

            const cableMesh = new THREE.Mesh(cableGeo, brokenCableMat);
            plat.add(cableMesh);
        }
    }

    // --- 4. DATI DI STATO ---
    plat.userData = {
        id: Math.random() * 100,
        isMoving: isMoving, 
        startZ: z, 
        startX: x,
        time: 0, 
        type: type, 
        active: (type === 'normal' || type === 'shadow'),
        wobble: wobble 
    };
    
    if (type === 'light-only') plat.visible = false;

    State.scene.add(plat);
    State.platforms.push(plat);
}