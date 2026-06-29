import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import {loadButtons, loadLightSensors, loadReactor, createSciFiCable, addReactorPedestal, createHologramTable, createWallConsole, createWallRadar, createFloorVent, createCryoPod, createMainframe, createEnergyPipe, createSciFiCeiling} from './room_props.js';
import {createSpaceshipExterior} from './spaceship.js';
import {createStars, createGalaxy, createBlackHole} from './space_props.js';
import {createPlayer} from './player.js';
import {addSun, addPlanets, addComet} from './solar_system.js';
import {addWall, addPlatform} from './walls_platforms.js';

import { State } from '../Core/state.js';

// --- 3. MONDO, TEXTURE E PIATTAFORME (Project 3) ---
export function createWorld() {
    //stelle nello spazio
    const starField = createStars();


    const loader = new GLTFLoader(State.loadingManager);

    // --- TEXTURES ---
    const floorTex = State.textureLoader.load('./textures/floor.png');
    const wallTex = State.textureLoader.load('./textures/wall_texture.jpg');
    const doorTex = State.textureLoader.load('./textures/door.png');
    const platformTex = State.textureLoader.load('./textures/debris.png');
    const metalTex = State.textureLoader.load('./textures/Metal046B_1k-JPG_Color.jpg');
    metalTex.wrapS = THREE.RepeatWrapping;
    metalTex.wrapT = THREE.RepeatWrapping;
    platformTex.wrapS = THREE.RepeatWrapping;
    platformTex.wrapT = THREE.RepeatWrapping;
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    doorTex.wrapS = THREE.RepeatWrapping;
    doorTex.wrapT = THREE.RepeatWrapping;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 4);
    doorTex.name="door";

    // --- STANZA PRINCIPALE (Allargata a 40x40) ---
    addPlatform(0, 0, 0, 41, 41, floorTex);

    // --- MURI (Ricalcolati per spazio 40x40) ---
    const h = 8; // Soffitto più alto per dare respiro (8 invece di 6)
    const t = 1;
    addWall(-20.5, h/2, 0, t, h, 40, 0xffffff, wallTex);      // Sinistra
    addWall(20.5, h/2, 0, t, h, 40, 0xffffff, wallTex);       // Destra
    
    // Frontale (Dove c'è la porta a Z = -20.5)
    // Essendo largo 40, dividiamo il muro in due pezzi larghi 17, lasciando 6 di buco per la porta
    addWall(-11.5, h/2, -20.5, 17, h, t, 0xffffff, wallTex);  // Davanti sx
    addWall(11.5, h/2, -20.5, 17, h, t, 0xffffff, wallTex);   // Davanti dx
    addWall(0, 6, -20.5, 6, 4, t, 0xffffff, wallTex);         // Trave alta sopra la porta

    // --- LA VETRATA PANORAMICA IN STILE PONTE DI COMANDO (Dietro) ---
    // Invece di un blocco piatto, creiamo una struttura a scomparti hi-tech.
    
    // 1. Muretto inferiore della vetrata (Bulkhead corazzato)
    // Alto 1.5 unità, impedisce al vetro di toccare il pavimento
    addWall(0, 0.75, 20.5, 41, 1.5, t, 0x2d323a, wallTex);

    // 2. Trave superiore della vetrata (Veletta del soffitto)
    // Scende dal soffitto per 1.5 unità (Altezza totale stanza = 8, quindi centrato a 7.25)
    addWall(0, 7.25, 20.5, 41, 1.5, t, 0x2d323a, wallTex);

    // 3. Montanti Verticali (Dividono la grande vetrata in 4 imponenti oblò panoramici)
    // Sono spessi 1.5 unità, alti 5 (lo spazio tra i due muretti) e sporgono leggermente in 3D (depth = 1.4)
    addWall(-10, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex); // Pilastro Sx
    addWall(0, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex);  // Pilastro Centrale
    addWall(10, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex); // Pilastro Dx
    
    // Rinforzi angolari fissi ai due lati estremi della stanza
    addWall(-20.25, 4.0, 20.5, 1, 5, 1.4, 0x2d323a, wallTex);
    addWall(20.25, 4.0, 20.5, 1, 5, 1.4, 0x2d323a, wallTex);

    // 4. Il Vetro Ottimizzato (Trucco: un unico grande pannello posizionato dietro al telaio)
    // Essendo dietro ai pilastri, sembreranno 4 finestre separate, ma Three.js renderizzerà un solo oggetto!
    const glassGeo = new THREE.BoxGeometry(40, 5, 0.2); 
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x0c1a30,       // Blu profondo fantascientifico
        transparent: true, 
        opacity: 0.4, 
        roughness: 0.05, 
        metalness: 0.9,
        clearcoat: 1.0,        // Aggiunge lo strato lucido riflessivo tipico dei vetri spessi da astronave
        clearcoatRoughness: 0.1,
        fog: false, 
        depthWrite: false   
    });
    const giantWindow = new THREE.Mesh(glassGeo, glassMat);
    giantWindow.position.set(0, 4.0, 20.4); // Un millimetro davanti al muro posteriore per evitare bug visivi (z-fighting)
    giantWindow.castShadow = true;
    giantWindow.receiveShadow = true;
    State.walls.push(giantWindow); // Aggiungiamo il vetro al sistema dei muri per le collisioni 
    State.scene.add(giantWindow);


    // --- COSTOLONI E ARCHI STRUTTURALI DELLA FUSELIERA (Hull Ribs) ---
    // Posizioniamo grandi archi metallici ad anello lungo la stanza a intervalli regolari (Z = -10, 0, 10).
    // Questo spezza completamente la forma a "cubo" della stanza dando un look cilindrico/industriale.
    const ribPositionsZ = [-10, 0, 10]; 

    ribPositionsZ.forEach(zPos => {
        // Pilastro sporgente sulla parete di Sinistra (X interna della stanza = -20)
        addWall(-19.8, h/2, zPos, 0.4, h, 1.5, 0x252a32, metalTex);
        
        // Pilastro sporgente sulla parete di Destra (X interna della stanza = 20)
        addWall(19.8, h/2, zPos, 0.4, h, 1.5, 0x252a32, metalTex);
        
        // Trave sul soffitto che unisce i due pilastri laterali (Y interna del soffitto = 8)
        addWall(0, 7.8, zPos, 40, 0.4, 1.5, 0x252a32, metalTex);
    });

    // --- PORTA ---
    State.door = addWall(0, h/10, -20.5, 6, h, 0.4, 0x442200, doorTex);

    // --- ARREDAMENTO DELLA STANZA ---
    // Inseriamo l'ologramma al centro della stanza
    createHologramTable(0, 0, 0);

    // Inseriamo due console/tablet ai lati della stanza
    createWallConsole(-19.6, 0.5, 7, Math.PI / 2); // Muro sinistro, ruotato di 90 gradi
    createWallConsole(19.6, 0.5, 7, -Math.PI / 2, true); // Muro destro, ruotato di -90 gradi

    // Esempio d'uso dentro createWorld():
    createEnergyPipe(-19, -19); // Angolo avanti-sinistra
    createEnergyPipe(19, -19);  // Angolo avanti-destra

    // Esempio d'uso vicino a un muro laterale:
    createCryoPod(-18, 0, -2, Math.PI / 2);
    createCryoPod(-18, 0, 1, Math.PI / 2);

    // Esempio d'uso:
    createMainframe(18.5, 0, -4, -Math.PI / 2);

    // Esempio d'uso (mettile dove il cammino è libero):
    createFloorVent(-10, 10);
    createFloorVent(10, 10);

    // Esempio d'uso (appeso sulla parete frontale, accanto alla porta):
    createWallRadar(8, 4, -19.9, 0);

    //piedistallo del reattore al centro della stanza
    addReactorPedestal(0, 0.5, 15);

    createSciFiCeiling();

    createSpaceshipExterior();

    const mainCablePoints = [
        new THREE.Vector3(-19, 1, 14),     
        new THREE.Vector3(-19.5, 1, 12.5),     
        new THREE.Vector3(-19.5, 3, 10),    
        new THREE.Vector3(-19.5, 5, 9.0), 
        new THREE.Vector3(-19.5, 6, 3.0),    
        new THREE.Vector3(-19.5, 5.5, -10.0),     
    ];
    createSciFiCable(mainCablePoints);


    //light sensors
    loadLightSensors();


    //buttons and interactive lamp
    loadButtons();

    //creazione giocatore
    createPlayer();

    // --- PERCORSO ESTERNO (Distanze Scalate ) ---

    // 2. Proseguimento centrale
    addPlatform(5, 0.5, -42, 3, 3, platformTex, true, 'normal', 'wreckage-A', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'x';

    // 3. Secondo bivio: A destra (Shadow - occhio!) o Sinistra (Normal)
    addPlatform(8, 0.7, -52, 3, 3, null, false, 'shadow', 'wreckage-C', true); 
    addPlatform(0, 0.8, -60, 4, 4, platformTex, false, 'normal', 'wreckage-B', true);

    // 4. Curva accentuata verso sinistra
    addPlatform(-8, 1.0, -70, 3, 3, platformTex, true, 'normal', 'wreckage-C', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'z';

    // 5. Piattaforma di "riposo" centrale
    addPlatform(-8, 1.2, -85, 5, 5, platformTex, false, 'normal', 'wreckage-A', true);

    // 6. Terzo bivio: Shadow (difficile) o Light (più facile ma devi trovarla)
    addPlatform(-16, 1.5, -75, 3, 3, null, false, 'shadow', 'wreckage-B', true);
    addPlatform(-14, 1.4, -98, 3, 3, platformTex, false, 'light-only', 'wreckage-C', true);

    // 7. Salto finale verso l'esterno sinistro
    addPlatform(-24, 1.8, -78, 4, 4, platformTex, false, 'normal', 'wreckage-A', true);
    addPlatform(-22, 2.0, -100, 6, 6, platformTex, false, 'normal', 'wreckage-C', true); 

    addPlatform(-30, 0.8, -85, 3, 3, platformTex, true, 'normal', 'wreckage-B', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'z';

    addPlatform(-38, 1.0, -85, 4, 4, platformTex, false, 'normal', 'wreckage-A', true);
    
    addPlatform(-46, 1.2, -93, 4, 4, platformTex, false, 'light-only', 'wreckage-B', true);

    addPlatform(-46, 3.5, -106, 6, 6, platformTex, true, 'normal', 'wreckage-C', true);
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'y';

    addPlatform(-47, 5, -115, 6, 6, platformTex, false, 'normal', 'wreckage-A', false); // Piattaforma finale, non più "wobble zone" ma punto di arrivo


    //piattaforme casuali per simulare un campo di detriti spaziali
    addPlatform(-60, 8, -80, 3, 3, platformTex, true, 'normal', 'wreckage-A', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'x';
    addPlatform(30, 2, -50, 4, 4, platformTex, false, 'normal', 'wreckage-B', true);
    addPlatform(-50, 6, -30, 5, 5, platformTex, false, 'normal', 'wreckage-C', true);

    //reattore esterno
    loadReactor();

    // Solar SYSTEM
    //sun
    addSun();
    //PLANETS
    addPlanets();

    //Comet
    addComet();

    createBlackHole(0, -200, 0);

    createGalaxy(-800, 400, -400);
    createGalaxy(200, 600, 1000, '#ffe6aa', '#15ff00');
    createGalaxy(1000, -300, -300, '#c4ecc4', '#ff0000');
    State.galaxies.forEach(gal => {
        State.scene.add(gal);
    });
}

