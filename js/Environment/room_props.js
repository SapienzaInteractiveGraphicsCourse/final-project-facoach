import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function loadButtons() {

    const loader = new GLTFLoader(State.loadingManager);
        //bottone
        loader.load('./models/scifi_button.glb', (gltf) => {
            State.buttonSwitch = gltf.scene;
        
            // Configurazione Modello
            State.buttonSwitch.scale.set(1, 1, 1); 
    
            // Rendiamo il modello capace di proiettare ombre
            State.buttonSwitch.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            State.movingButton = State.buttonSwitch.getObjectByName('button');
    
            if (State.movingButton) {
                // Salviamo la posizione locale iniziale (sarà il nostro punto di partenza e ritorno)
                State.buttonInitialPos = State.movingButton.position.clone();
            }
    
            State.buttonSwitch.rotation.y = Math.PI/2;
            State.buttonSwitch.position.set(-19, 0.25, 14);

            // 3. HITBOX INVISIBILE PER LE COLLISIONI
            // Creiamo un cubo "finto" che copre l'area del bottone.
            const hitboxGeo = new THREE.BoxGeometry(1, 2, 1);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
            // Posizioniamo l'hitbox esattamente dove si trova il bottone
            hitbox.position.set(State.buttonSwitch.position.x, State.buttonSwitch.position.y, State.buttonSwitch.position.z);
            State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del bottone!
            State.scene.add(hitbox);

            State.scene.add(State.buttonSwitch);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        //bottone 2
        loader.load('./models/scifi_button.glb', (gltf) => {
            State.buttonSwitch2 = gltf.scene;
        
            // Configurazione Modello
            State.buttonSwitch2.scale.set(1, 1, 1); 
    
            // Rendiamo il modello capace di proiettare ombre
            State.buttonSwitch2.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            State.movingButton2 = State.buttonSwitch2.getObjectByName('button');
    
            if (State.movingButton2) {
                // Salviamo la posizione locale iniziale (sarà il nostro punto di partenza e ritorno)
                State.buttonInitialPos2 = State.movingButton2.position.clone();
            }
    
            State.buttonSwitch2.rotation.y = Math.PI;
            State.buttonSwitch2.position.set(8, 0, -22);
            State.scene.add(State.buttonSwitch2);

            // 3. HITBOX INVISIBILE PER LE COLLISIONI
            // Creiamo un cubo "finto" che copre l'area del bottone.
            const hitboxGeo = new THREE.BoxGeometry(1, 2, 1);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
            // Posizioniamo l'hitbox esattamente dove si trova il bottone
            hitbox.position.set(State.buttonSwitch2.position.x, State.buttonSwitch2.position.ye, State.buttonSwitch2.position.z);
            State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del bottone!
            State.scene.add(hitbox);

            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        //luce interattiva
        State.interactLight = new THREE.PointLight(0xffaa00, 0, 15, 2);
        State.interactLight.position.set(-18, 5.5, -10);
        State.interactLight.castShadow = true;
        State.interactLight.shadow.bias = -0.005; // Fondamentale per eliminare le righe nere
        State.interactLight.shadow.mapSize.width = 1024; // Opzionale: migliora la qualità
        State.interactLight.shadow.mapSize.height = 1024;
        State.scene.add(State.interactLight);
    
        loader.load('./models/scifi_prop_-_alert_lamp.glb', (gltf) => {
            State.luce = gltf.scene;
        
            // Configurazione Modello
            State.luce.scale.set(2, 2, 2); 
    
            // Rendiamo il modello capace di proiettare ombre
            State.luce.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            State.luce.rotation.y = Math.PI /2;
            State.luce.position.set(-19.5, 5.5, -10);
            State.scene.add(State.luce);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    }


export function loadLightSensors() {
    const loader = new GLTFLoader(State.loadingManager);
    // --- SENSORI E INTERRUTTORI (Posizioni regolate) ---
        loader.load('./models/Untitled.glb', (gltf) => {
            State.s1 = gltf.scene;
        
            // Configurazione Modello
            State.s1.scale.set(0.01,0.01,0.01);  
    
            // Rendiamo il modello capace di proiettare ombre
            State.s1.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            const crystal = State.s1.getObjectByName("Crystal");
            State.crystal1 = crystal;
    
            // --- 1. CARICAMENTO TEXTURE ---
            const crystalTex = State.textureLoader.load('./textures/crystal.png');
    
            crystal.material = new THREE.MeshStandardMaterial({
                map: crystalTex,            // La texture sulle facce
                emissiveMap: crystalTex,
                color: 0xffffff,           // Colore base (moltiplicatore della texture)
                emissive: 0x00ffff,        // Colore del bagliore (es. Ciano/Azzurro)
                emissiveIntensity: 0.7,    // Intensità del bagliore (0 = spento)
                metalness: 0.5,            // Opzionale: rende il cristallo più riflettente
                roughness: 0.2,            // Opzionale: lo rende più lucido
                opacity: 0.9
            });
    
            if (crystal) {
                // Creiamo i bordi basandoci sulla geometria del cristallo
                const edges = new THREE.EdgesGeometry(crystal.geometry);
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: 0x004444, // Un azzurro/verde molto scuro
                    linewidth: 2     // Nota: su Windows lo spessore è spesso fisso a 1
                });
                const wireframe = new THREE.LineSegments(edges, lineMat);
            
                // Aggiungiamo i bordi come figli del cristallo così si muovono insieme
                crystal.add(wireframe);
    
    
            }
    
            State.s1.rotation.y = -Math.PI/2; 
            State.s1.position.set(18, 1, -10);
            State.s1.userData = { activated: false };
            State.sensors.push(State.s1);

            State.scene.add(State.s1);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
    
        loader.load('./models/Untitled.glb', (gltf) => {
            State.s2 = gltf.scene;
        
            // Configurazione Modello
            State.s2.scale.set(0.01,0.01,0.01); 
    
            // Rendiamo il modello capace di proiettare ombre
            State.s2.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            const crystal = State.s2.getObjectByName("Crystal");
            State.crystal2 = crystal;
    
            // --- 1. CARICAMENTO TEXTURE ---
            const crystalTex = State.textureLoader.load('./textures/crystal.png');
    
            crystal.material = new THREE.MeshStandardMaterial({
                map: crystalTex,            // La texture sulle facce
                emissiveMap: crystalTex,
                color: 0xffffff,           // Colore base (moltiplicatore della texture)
                emissive: 0x00ffff,        // Colore del bagliore (es. Ciano/Azzurro)
                emissiveIntensity: 0.7,    // Intensità del bagliore (0 = spento)
                metalness: 0.5,            // Opzionale: rende il cristallo più riflettente
                roughness: 0.2,            // Opzionale: lo rende più lucido
                opacity: 0.9
            });
            
            if (crystal) {
                // Creiamo i bordi basandoci sulla geometria del cristallo
                const edges = new THREE.EdgesGeometry(crystal.geometry);
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: 0x004444, // Un azzurro/verde molto scuro
                    linewidth: 2     // Nota: su Windows lo spessore è spesso fisso a 1
                });
                const wireframe = new THREE.LineSegments(edges, lineMat);
            
                // Aggiungiamo i bordi come figli del cristallo così si muovono insieme
                crystal.add(wireframe);
    
                // Rendiamo il materiale del cristallo un po' trasparente
    
            }
    
            State.s2.rotation.y = Math.PI /2; 
            State.s2.position.set(-18, 1, -10);
            State.s2.userData = { activated: false };
            State.sensors.push(State.s2);

            State.scene.add(State.s2);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
}


export function loadReactor() {

    const loader = new GLTFLoader(State.loadingManager);
    //reattore
    loader.load('./models/Reactor.glb', (gltf) => {
        State.ReactorGroup = new THREE.Group();
        State.ReactorGroup.position.set(-47, 5.5, -115);
        State.ReactorModel = gltf.scene;
        
        // Configurazione Modello
        State.ReactorModel.scale.set(0.1, 0.1, 0.1); 
    
        // Rendiamo il modello capace di proiettare ombre
        State.ReactorModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
    
    
        State.ReactorModel.rotation.y = Math.PI;
        State.ReactorGroup.add(State.ReactorModel);
        State.scene.add(State.ReactorGroup);
        console.log("Modello reattore caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });
}


export function createSciFiCable(pointsArray) {
    // Controllo di sicurezza: servono almeno 2 punti per tracciare una curva!
    if (!pointsArray || pointsArray.length < 2) {
        console.warn("createSciFiCable: Servono almeno 2 punti (Vector3) per creare un cavo.");
        return null;
    }

    // Creiamo una curva morbida che unisce questi punti
    const cableCurve = new THREE.CatmullRomCurve3(pointsArray);

    // Generiamo la geometria del tubo: (curva, segmenti, raggio del cavo, segmenti radiali, chiuso)
    // Un raggio di 0.04 lo rende un cavo sottile ma ben visibile
    const cableGeometry = new THREE.TubeGeometry(cableCurve, 128, 0.04, 8, false);

    // Creiamo il materiale standard con proprietà emissive (per farlo illuminare)
    State.wireMaterial = new THREE.MeshStandardMaterial({
        color: 0x15151c,           // Colore base del cavo (un grigio scuro/nero plastica)
        roughness: 0.6,
        metalness: 0.2,
        emissive: 0x000000,        // All'inizio il bagliore è SPENTO (nero)
        emissiveIntensity: 2.0     // Intensità del bagliore quando si accenderà
    });

    const cableMesh = new THREE.Mesh(cableGeometry, State.wireMaterial);
    cableMesh.castShadow = true;
    cableMesh.receiveShadow = true;

    State.scene.add(cableMesh);
}

// Genera un tavolo olografico fantascientifico
export function createHologramTable(x, y, z) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(x, y, z);

    // 1. La base del tavolo (Cilindro metallico)
    const baseGeo = new THREE.CylinderGeometry(1.5, 2, 1, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5; // Solleviamo la base

    base.receiveShadow = true;
    base.castShadow = true;
    tableGroup.add(base);

    // 2. Il sistema solare olografico (Gruppo rotante)
    State.holoSystem = new THREE.Group();
    State.holoSystem.position.y = 2.5; // Fluttua sopra il tavolo

    // Materiale stile ologramma (Azzurro, trasparente, luminoso e a griglia)
    const holoMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.6, 
        wireframe: true, 
        blending: THREE.AdditiveBlending 
    });

    const sunGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sun = new THREE.Mesh(sunGeo, holoMat);
    State.holoSystem.add(sun);

    const planetGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const planet = new THREE.Mesh(planetGeo, holoMat);
    planet.position.set(1.5, 0, 0); // Orbita a distanza
    State.holoSystem.add(planet);

    const planetGeo2 = new THREE.SphereGeometry(0.15, 7, 8);
    const planet2 = new THREE.Mesh(planetGeo2, holoMat);
    planet2.position.set(-1.0, 0.5, 1); // Orbita a distanza
    State.holoSystem.add(planet2);

    tableGroup.add(State.holoSystem);

    // 3. HITBOX INVISIBILE PER LE COLLISIONI
    // Creiamo un cubo "finto" che copre l'area del bottone.
    const hitboxGeo = new THREE.BoxGeometry(3, 2, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Posizioniamo l'hitbox esattamente dove si trova il bottone
    hitbox.position.set(tableGroup.position.x, tableGroup.position.y, tableGroup.position.z);
    State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del bottone!
    State.scene.add(hitbox);

    State.scene.add(tableGroup);
}

// Genera un terminale a muro con schermo luminoso
export function createWallConsole(x, y, z, rotationY, isMainConsole = false) {
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(x, y, z);
    consoleGroup.rotation.y = rotationY;

    // --- 1. STRUTTURA (La Cornice) ---
    // Un telaio verticale solido
    const frameGeo = new THREE.BoxGeometry(2, 3.5, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, // Molto scuro
        metalness: 0.9, 
        roughness: 0.3 
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1.75; // Sollevato da terra
    consoleGroup.add(frame);

    // --- 2. LO SCHERMO TOUCH VERTICALE ---
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024; // Proporzione verticale
    const ctx = canvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(canvas);

    // Usa MeshBasicMaterial così sembra emettere luce propria
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    // Il piano è leggermente più piccolo del telaio
    const screenGeo = new THREE.PlaneGeometry(1.8, 3.3); 
    const screen = new THREE.Mesh(screenGeo, screenMat);
    
    // Lo posizioniamo a filo con la parte frontale della cornice (+0.21 sull'asse Z locale)
    screen.position.set(0, 1.75, 0.21);
    consoleGroup.add(screen);

    // Salviamo i dati dello schermo nell'array globale per usarli in animate()
    State.animatedScreens.push({
        ctx: ctx,
        canvas: canvas,
        texture: screenTexture,
        offsetY: 0 // Usato per l'animazione dello scorrimento
    });

    // --- 3. LOGICA CONSOLE PRINCIPALE (ESCLAMATIVO) ---
    if (isMainConsole) {
        State.scifiConsole = consoleGroup; // Salviamo il riferimento per l'interazione

        const questCanvas = document.createElement('canvas');
        questCanvas.width = 128; questCanvas.height = 128;
        const qCtx = questCanvas.getContext('2d');
        qCtx.font = 'Bold 110px Arial';
        qCtx.fillStyle = '#ffcc00';
        qCtx.textAlign = 'center'; qCtx.textBaseline = 'middle';
        qCtx.shadowColor = '#ff6600'; qCtx.shadowBlur = 15;
        qCtx.fillText('!', 64, 64);
        
        const indicatorTexture = new THREE.CanvasTexture(questCanvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: indicatorTexture, depthTest: false });
        State.consoleIndicator = new THREE.Sprite(spriteMaterial);
        
        State.consoleIndicator.scale.set(1.5, 1.5, 1);
        State.consoleIndicator.position.set(0, 4.2, 0); // Posizionato sopra il terminale
        State.consoleIndicator.castShadow = false;
        State.consoleIndicator.receiveShadow = false;
        consoleGroup.add(State.consoleIndicator);
    }

    consoleGroup.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }   
    });

    State.scene.add(consoleGroup);
}
export function createWallRadar(x, y, z, rotationY) {
    const radarGroup = new THREE.Group();
    radarGroup.position.set(x, y, z);
    radarGroup.rotation.y = rotationY;

    // Sfondo del radar
    const plateGeo = new THREE.CylinderGeometry(2, 2, 0.1, 32);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.x = Math.PI / 2; 
    radarGroup.add(plate);

    // Griglia del radar verde incandescente
    const gridGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.02, 32);
    const gridMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.4 
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 0.06; 
    radarGroup.add(grid);

    // --- NUOVO: IL PUNTINO LAMPEGGIANTE (BLIP) ---
    const blipGeo = new THREE.SphereGeometry(0.06, 16, 16); // Una microsfera
    const blipMat = new THREE.MeshBasicMaterial({ 
        color: 0x33ff33,      // Verde acido molto luminoso
        transparent: true,    // Fondamentale per poter gestire l'opacity nell'animate
        opacity: 0            // Parte invisibile
    });
    State.radarBlip = new THREE.Mesh(blipGeo, blipMat);
    
    // Lo posizioniamo a Z = 0.08 così sta leggermente DAVANTI alla griglia senza compenetrarsi
    State.radarBlip.position.set(0, 0, 0.08); 
    radarGroup.add(State.radarBlip);

    State.scene.add(radarGroup);
}

export function createFloorVent(x, z) {
    const ventGroup = new THREE.Group();
    ventGroup.position.set(x, 0.26, z); // Appena sopra il pavimento calpestabile per evitare sfarfallii (Z-fighting)

    // Cornice della grata
    const frameGeo = new THREE.BoxGeometry(4, 0.02, 4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    ventGroup.add(frame);

    // Luce arancione industriale che proviene da sotto la grata
    const ventLight = new THREE.PointLight(0xff5500, 0.8, 4);
    ventLight.position.y = 0.5;
    ventGroup.add(ventLight);

    // Sottili barre metalliche interne
    const barGeo = new THREE.BoxGeometry(0.1, 0.03, 3.6);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9 });
    
    for (let i = -5; i <= 5; i++) {
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.x = i * 0.3;
        ventGroup.add(bar);
    }

    State.scene.add(ventGroup);
}

export function createMainframe(x, y, z, rotationY) {
    const mainframe = new THREE.Group();
    mainframe.position.set(x, y, z);
    mainframe.rotation.y = rotationY;

    // --- MATERIALI ---
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.8, roughness: 0.4 });
    const lightMetal = new THREE.MeshStandardMaterial({ color: 0x333336, metalness: 0.9, roughness: 0.5 });
    const rackBlack = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });

    // --- 1. CHASSIS (La struttura esterna) ---
    // Telaio principale
    const cabinetGeo = new THREE.BoxGeometry(3.2, 6.2, 2.2);
    const cabinet = new THREE.Mesh(cabinetGeo, darkMetal);
    cabinet.position.y = 3.1;
    mainframe.add(cabinet);

    // Pannelli laterali bombati per dare spessore
    const sideGeo = new THREE.BoxGeometry(3.3, 6.0, 1.8);
    const sidePanel = new THREE.Mesh(sideGeo, lightMetal);
    sidePanel.position.y = 3.1;
    mainframe.add(sidePanel);

    // --- 2. VANO SERVER (La rientranza frontale scura) ---
    const rackAreaGeo = new THREE.BoxGeometry(2.6, 5.5, 2.3);
    const rackArea = new THREE.Mesh(rackAreaGeo, rackBlack);
    rackArea.position.y = 3.1;
    mainframe.add(rackArea);

    // --- 3. I MODULI (Server Blades) E I LED ---
    const bladeGeo = new THREE.BoxGeometry(2.4, 0.3, 0.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.6 });

    // Creiamo una colonna di 11 server, ma ne saltiamo alcuni per realismo (spazi vuoti)
    for (let i = 0; i < 11; i++) {
        if (i === 3 || i === 7) continue; // Crea degli slot vuoti nel rack

        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        let bladeY = 0.8 + (i * 0.45);
        blade.position.set(0, bladeY, 0.95);
        mainframe.add(blade);

        // Aggiungiamo 3 piccoli LED su ciascun server
        for (let j = 0; j < 3; j++) {
            const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
            
            // 70% verdi, 20% arancioni, 10% rossi
            const rand = Math.random();
            let ledColor = 0x00ffaa; // Verde scifi
            if (rand > 0.7 && rand <= 0.9) ledColor = 0xffaa00; // Arancione
            if (rand > 0.9) ledColor = 0xff3300; // Rosso allarme
            
            // Usiamo MeshBasicMaterial affinché brillino al buio
            const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
            const led = new THREE.Mesh(ledGeo, ledMat);
            
            // Posizionati sulla parte destra di ogni modulo
            led.position.set(0.7 + (j * 0.12), bladeY, 1.21);
            mainframe.add(led);

            // Salviamo il LED per l'animazione di lampeggio
            State.serverLEDs.push({
                material: ledMat,
                baseColor: ledColor,
                // Assegniamo una velocità di lampeggio casuale
                blinkRate: Math.random() * 0.05 + 0.01, 
                timeOffset: Math.random() * 100 
            });
        }
    }

    // --- 4. PANNELLO DI VENTILAZIONE (In alto) ---
    // Usiamo il wireframe per simulare velocemente una griglia di aerazione
    const ventGeo = new THREE.PlaneGeometry(2.4, 0.6, 10, 2);
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0, 5.5, 1.16);
    mainframe.add(vent);

    // 3. HITBOX INVISIBILE PER LE COLLISIONI
    // Creiamo un cubo "finto" che copre l'area del bottone.
    const hitboxGeo = new THREE.BoxGeometry(2, 2, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Posizioniamo l'hitbox esattamente dove si trova il bottone
    hitbox.position.set(mainframe.position.x, mainframe.position.y, mainframe.position.z);
    State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del bottone!
    State.scene.add(hitbox);

    mainframe.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    State.scene.add(mainframe);
}

export function createCryoPod(x, y, z, rotationY) {
    const podGroup = new THREE.Group();
    podGroup.position.set(x, y, z);
    podGroup.rotation.y = rotationY;

    // 1. LA BASE (Diritta sul pavimento)
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    podGroup.add(base);

    // 2. IL GRUPPO INCLINATO (Corpo del pod)
    const tiltedGroup = new THREE.Group();
    tiltedGroup.position.y = 0.4;  // Si appoggia sulla base
    tiltedGroup.rotation.x = -0.25; // Inclinato all'indietro di circa 15 gradi!
    podGroup.add(tiltedGroup);

    // Corpo metallico interno (Cilindro intero)
    const bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 4.2, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2.1;
    tiltedGroup.add(body);

    // Vetro anteriore a semicerchio 
    // I parametri extra servono a tagliare il cilindro a metà (da -90° a +90°)
    const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 3.8, 16, 1, false, -Math.PI/2, Math.PI);
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x00ffaa, 
        transparent: true, 
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.5,
        depthWrite: false // Evita sfarfallii del vetro
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 2.1;
    tiltedGroup.add(glass);

    // Luce vitale interna
    const interiorLight = new THREE.PointLight(0x00ffaa, 1, 5);
    interiorLight.position.set(0, 2.1, 0.5);
    tiltedGroup.add(interiorLight);

    podGroup.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    State.scene.add(podGroup);

    // 3. HITBOX INVISIBILE PER LE COLLISIONI
    // Creiamo un cubo "finto" che copre l'area del pod.
    const hitboxGeo = new THREE.BoxGeometry(3, 5, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Posizioniamo l'hitbox esattamente dove si trova il pod
    hitbox.position.set(x, y + 2.5, z);
    State.scene.add(hitbox);


    
    // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del pod!
    State.walls.push(hitbox);
}

export function createEnergyPipe(x, z) {
    const pipeGroup = new THREE.Group();
    pipeGroup.position.set(x, 0, z);

    // Il tubo esterno (Griglia metallica o semitrasparente)
    const outerGeo = new THREE.CylinderGeometry(0.6, 0.6, 8, 16);
    const outerMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        metalness: 0.9, 
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
    });
    const outerPipe = new THREE.Mesh(outerGeo, outerMat);
    outerPipe.position.y = 4; // Centrato verticalmente rispetto all'altezza della stanza (h=8)
    pipeGroup.add(outerPipe);

    // Il nucleo di energia interno (Luminoso!)
    const energyTex = State.textureLoader.load('./textures/plasma.jpg'); 
    
    // Essenziale per permettere lo scorrimento e la ripetizione
    energyTex.wrapS = THREE.RepeatWrapping;
    energyTex.wrapT = THREE.RepeatWrapping;
    energyTex.repeat.set(1, 3); // Ripete la texture 3 volte lungo l'asse Y per non stirarla

    const innerGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
    const innerMat = new THREE.MeshStandardMaterial({ 
        map: energyTex,            // La texture sulle facce
        emissiveMap: energyTex,      // La stessa texture per il bagliore
        color: 0xffffff,           // Colore base (moltiplicatore della texture)
        emissive: 0x00ffff,        // Colore del bagliore (es. Ciano/Azzurro)
        emissiveIntensity: 2,    // Intensità del bagliore (0 = spento)
        opacity: 0.9
    });
    const innerPipe = new THREE.Mesh(innerGeo, innerMat);
    innerPipe.position.y = 4;
    pipeGroup.add(innerPipe);

    // 4. Aggiungiamo la texture all'array globale per l'animazione
    State.activePipes.push(energyTex);

    // 3. HITBOX INVISIBILE PER LE COLLISIONI
    // Creiamo un cubo "finto" che copre l'area del pod.
    const hitboxGeo = new THREE.BoxGeometry(1, 5, 1);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Posizioniamo l'hitbox esattamente dove si trova il pod
    hitbox.position.set(pipeGroup.position.x, pipeGroup.position.y , pipeGroup.position.z);
    State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del pod!ew
    State.scene.add(hitbox);

    State.scene.add(pipeGroup);
}

export function createSciFiCeiling() {
    const ceilingGroup = new THREE.Group();
    
    // Supponendo che la tua stanza sia alta 8 e larga 40x40
    const roomHeight = 8; 
    ceilingGroup.position.y = roomHeight;

    // 1. IL PANNELLO BASE (Il vero e proprio soffitto scuro)
    const baseGeo = new THREE.BoxGeometry(40, 0.5, 40);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, 
        roughness: 0.9, // Molto ruvido, non deve riflettere troppo
        metalness: 0.3
    });
    const ceilingBase = new THREE.Mesh(baseGeo, baseMat);
    ceilingBase.position.y = 0.25; // Lo alziamo a filo con il bordo inferiore
    ceilingBase.castShadow = true;
    ceilingBase.receiveShadow = true;
    ceilingGroup.add(ceilingBase);

    // 2. LE TRAVI INDUSTRIALI CON NEON
    const beamGeo = new THREE.BoxGeometry(40, 0.6, 1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8 });
    
    // Creiamo una trave ogni 4 metri usando un ciclo for
    for (let i = -18; i <= 18; i += 4) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, -0.09, i);
        ceilingGroup.add(beam);
        
        // Ogni due travi (quando 'i' è multiplo di 8), aggiungiamo una striscia LED
        if (i % 8 === 0 ) {
            // Il neon luminoso
            const ledGeo = new THREE.BoxGeometry(38, 0.05, 0.3);
            const ledMat = new THREE.MeshBasicMaterial({ color: 0x00aaff }); // Azzurro ciano
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(0, -0.4, i); // Appena sotto la trave
            ceilingGroup.add(led);
            
            // La luce effettiva che illumina la stanza dall'alto
            const ceilLight = new THREE.PointLight(0x00aaff, 0.6, 20);
            ceilLight.position.set(0, -1, i);
            ceilingGroup.add(ceilLight);
        }
    }

    // 3. IL GENERATORE CENTRALE / BOCCHETTONE
    // Un dettaglio circolare al centro del soffitto per rompere tutte queste linee rette
    const coreGeo = new THREE.CylinderGeometry(3, 3, 0.8, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 1 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = -0.2;
    ceilingGroup.add(core);

    const coreRingGeo = new THREE.CylinderGeometry(2, 2, 0.9, 32);
    const coreRingMat = new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.position.y = -0.25;
    ceilingGroup.add(coreRing);

    // Parametri: Colore (arancione), Intensità (3), Distanza massima (20 unità), Decadimento (2)
    const coreLight = new THREE.PointLight(0xff5500, 4, 25, 2);
    
    // La posizioniamo a x=0, z=0 (al centro) e a y=-0.4 (leggermente sotto il ring arancione)
    // in modo che la luce "esca" dal bocchettone senza essere bloccata dal cilindro stesso.
    coreLight.position.set(0, -0.4, 0);
    // CONSIGLIO DI PERFORMANCE: Disattiviamo le ombre per questa luce.
    // Le PointLight calcolano le ombre su 6 facce (come un cubo) e sono pesantissime.
    // Lasciandola a false farà da perfetta luce ambientale diffusa senza cali di FPS.
    coreLight.castShadow = false; 
    ceilingGroup.add(coreLight); // Aggiungiamo la luce al gruppo del soffitto


    State.scene.add(ceilingGroup);

    ceilingGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

}

// Crea un piedistallo in stile "Nomai" (Outer Wilds) per il reattore
export function addReactorPedestal(x, y, z) {
    State.reactorPedestal = new THREE.Group();
    State.reactorPedestal.position.set(x, y, z);

    // --- MATERIALI ---
    // Pietra scura e rovinata per la base
    const stoneMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a24, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    // Metallo color rame/bronzo scuro tipico dei Nomai
    const nomaiCopperMat = new THREE.MeshStandardMaterial({ 
        color: 0x995533, 
        roughness: 0.4, 
        metalness: 0.8 
    }); 
    // Luce viola/blu della gravità
    const warpGlowMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        emissive: 0x5500ff, // Viola Nomai
        emissiveIntensity: 2.0 
    });

    // --- GEOMETRIE ---
    // 1. La Base (Esagonale)
    // CylinderGeometry(raggioSuperiore, raggioInferiore, altezza, segmentiRadiali)
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.4, 66); 
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.2; // Sollevato per appoggiarsi sul pavimento
    base.castShadow = true;
    base.receiveShadow = true;
    State.reactorPedestal.add(base);

    // 2. Il Pilastro centrale in rame
    const stemGeo = new THREE.CylinderGeometry(0.6, 0.9, 1.2, 64);
    const stem = new THREE.Mesh(stemGeo, nomaiCopperMat);
    stem.position.y = 1.0;
    stem.castShadow = true;
    stem.receiveShadow = true;
    State.reactorPedestal.add(stem);

    // 3. Anello fluttuante luminoso (Gira attorno al pilastro)
    const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 12);
    const ring = new THREE.Mesh(ringGeo, warpGlowMat);
    ring.position.y = 1.0;
    ring.rotation.x = Math.PI / 2;
    // Lo salviamo in userData così possiamo farlo ruotare nell'animate()
    State.reactorPedestal.userData.warpRing = ring; 
    State.reactorPedestal.add(ring);

    // 4. La Coppa Superiore (Dove alloggia il reattore)
    const topGeo = new THREE.CylinderGeometry(1.0, 0.5, 0.4, 64);
    const top = new THREE.Mesh(topGeo, stoneMat);
    top.position.y = 1.8;
    top.castShadow = true;
    top.receiveShadow = true;
    State.reactorPedestal.add(top);

    // 3. HITBOX INVISIBILE PER LE COLLISIONI
    // Creiamo un cubo "finto" che copre l'area del pod.
    const hitboxGeo = new THREE.BoxGeometry(2, 5, 2);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile!
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Posizioniamo l'hitbox esattamente dove si trova il pod
    hitbox.position.set(State.reactorPedestal.position.x, State.reactorPedestal.position.y + 2.5, State.reactorPedestal.position.z);
    State.walls.push(hitbox); // Aggiungiamo l'hitbox invisibile al sistema dei muri invece del pod!ew
    State.scene.add(hitbox);

    State.scene.add(State.reactorPedestal);
}
