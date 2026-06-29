import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function createSpaceshipExterior() {
    const shipGroup = new THREE.Group();

    // --- MATERIALI IN STILE NASA / HARD SCI-FI ---
    const nasaWhiteMat = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee, // Bianco ceramica spaziale
        roughness: 0.9,  // Opaco, tipo scudo termico
        metalness: 0.1 
    });
    const darkTrussMat = new THREE.MeshStandardMaterial({
        color: 0x222225, // Metallo scuro per le strutture di supporto
        roughness: 0.7,
        metalness: 0.6
    });
    const solarMat = new THREE.MeshStandardMaterial({
        color: 0x0a1530, // Blu notte per i pannelli fotovoltaici
        roughness: 0.2,
        metalness: 0.9
    });
    const goldFoilMat = new THREE.MeshStandardMaterial({
        color: 0xcca622, // Kapton (la pellicola dorata tipica dei satelliti)
        roughness: 0.5,
        metalness: 0.8
    });
    const engineGlowMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff // Plasma azzurro
    });

    // --- 1. IL MODULO DI COMANDO (Ingloba la tua stanza quadrata) ---
    // Mettiamo la stanza (40x40) a "panino" tra due enormi dischi circolari.
    // Il raggio 32 copre perfettamente gli angoli della stanza, creando una tettoia
    // sopra la porta e sopra la vetrata, senza bloccarne la vista!
    const saucerGeo = new THREE.CylinderGeometry(34, 34, 2, 64);
    
    const roofDisk = new THREE.Mesh(saucerGeo, nasaWhiteMat);
    roofDisk.position.set(0, 9.2, 0); // Appoggiato sopra il soffitto
    shipGroup.add(roofDisk);

    State.floorDisk = new THREE.Mesh(saucerGeo, nasaWhiteMat);
    State.floorDisk.position.set(0, -1, 0); // Appoggiato sotto il pavimento
    shipGroup.add(State.floorDisk);

    // Un anello grigio attorno al tetto per spezzare il colore
    // Bumper doppio (sopra e sotto)
    const bumperGeo = new THREE.TorusGeometry(34, 0.8, 16, 64);
    bumperGeo.rotateX(Math.PI / 2);
    const bumperTop = new THREE.Mesh(bumperGeo, darkTrussMat);
    bumperTop.position.set(0, 9.2, 0);
    shipGroup.add(bumperTop);
    
    const bumperBottom = bumperTop.clone();
    bumperBottom.position.set(0, -1.2, 0);
    shipGroup.add(bumperBottom);

    const aftGroup = new THREE.Group(); // Gruppo per la parte posteriore della nave (spina dorsale + anello centrifuga + motori)
    // --- 2. LA SPINA DORSALE (Estesa lontanissimo verso sinistra / asse -X) ---
    // Questo è il corpo principale della nave. Essendo lungo e spostato,
    // sarà perfettamente visibile quando esci dalla porta.
    const spineGeo = new THREE.CylinderGeometry(8, 8, 150, 32);
    spineGeo.rotateZ(Math.PI / 2); // Lo sdraiamo lungo l'asse X
    const spine = new THREE.Mesh(spineGeo, nasaWhiteMat);
    spine.position.set(-82.5, 4, 0); // Va da X = -20 a X = -160
    aftGroup.add(spine);


    // --- 3. L'ANELLO CENTRIFUGA (Gravity Ring) ---
    // Un elemento classico della fantascienza, avvolge la spina dorsale.
    const ringGeo = new THREE.TorusGeometry(35, 6, 32, 64);
    ringGeo.rotateY(Math.PI / 2); // Lo ruotiamo in modo che "rotoli" sull'asse X
    const gravityRing = new THREE.Mesh(ringGeo, nasaWhiteMat);
    gravityRing.position.set(-70, 4, 0);
    aftGroup.add(gravityRing);

    // Supporti che collegano l'anello alla spina centrale
    const spokeGeo = new THREE.CylinderGeometry(1.5, 1.5, 70, 16);
    State.spoke1 = new THREE.Mesh(spokeGeo, darkTrussMat);
    State.spoke1.position.set(-70, 4, 0);
    aftGroup.add(State.spoke1);
    
    State.spoke2 = new THREE.Mesh(spokeGeo, darkTrussMat);
    State.spoke2.position.set(-70, 4, 0);
    State.spoke2.rotation.x = Math.PI / 2;
    aftGroup.add(State.spoke2);


    // --- 4. I PANNELLI SOLARI ---
    // Enormi vele blu che sporgono lateralmente dalla nave, coperte d'oro alla base
    const panelGeo = new THREE.BoxGeometry(20, 0.5, 80);
    
    const leftPanel = new THREE.Mesh(panelGeo, solarMat);
    leftPanel.position.set(-110, 4, 45); // Sporge in avanti
    aftGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeo, solarMat);
    rightPanel.position.set(-110, 4, -45); // Sporge all'indietro
    aftGroup.add(rightPanel);

    // Traliccio dorato che regge i pannelli
    const panelTrussGeo = new THREE.CylinderGeometry(2, 2, 90, 16);
    panelTrussGeo.rotateX(Math.PI / 2);
    const panelTruss = new THREE.Mesh(panelTrussGeo, goldFoilMat);
    panelTruss.position.set(-110, 4, 0);
    aftGroup.add(panelTruss);


    // --- 5. IL BLOCCO MOTORI (Lontanissimo a sinistra) ---
    // Una struttura sferica con i propulsori attaccati in fondo alla spina.
    const reactorGeo = new THREE.SphereGeometry(14, 32, 32);
    const reactor = new THREE.Mesh(reactorGeo, nasaWhiteMat);
    reactor.position.set(-160, 4, 0);
    aftGroup.add(reactor);

    // Tre enormi ugelli di scarico (Thrusters)
    const bellGeo = new THREE.CylinderGeometry(3, 8, 12, 32);
    bellGeo.rotateZ(Math.PI / 2); // Puntano verso -X

    const thrusterPositions = [
        { y: 8, z: 0 },   // Motore in alto
        { y: 0, z: -8 },  // Motore in basso a destra
        { y: 0, z: 8 }    // Motore in basso a sinistra
    ];

    thrusterPositions.forEach(pos => {
        const bell = new THREE.Mesh(bellGeo, darkTrussMat);
        bell.position.set(-170, pos.y, pos.z);
        aftGroup.add(bell);

        // Il plasma incandescente
        const glowGeo = new THREE.SphereGeometry(4.5, 16, 16);
        const glow = new THREE.Mesh(glowGeo, engineGlowMat);
        glow.position.set(-172, pos.y, pos.z);
        // Scala l'asse X per farlo sembrare una fiamma allungata
        glow.scale.set(2, 1, 1);
        aftGroup.add(glow);
    });

    // Luce ambientale emessa dai motori
    const engineLight = new THREE.PointLight(0x00aaff, 5, 200);
    engineLight.position.set(-180, 4, 0);
    engineLight.castShadow = true; // I motori proiettano ombre dinamiche
    aftGroup.add(engineLight);

    // --- SCALA E RIPOSIZIONAMENTO DELLA CODA ---
    // Impostiamo la scala al 70% (0.7). Rimpicciolirà tutto il blocco posteriore.
    aftGroup.scale.set(0.7, 0.7, 0.7);
    
    // Scalando, il collo della spina dorsale si sarà "ritirato" verso i motori.
    // Dobbiamo spingere tutto il gruppo in avanti (verso la stanza) per riattaccarlo.
    aftGroup.position.set(-15, 0, 0); 

    // Infine, aggiungiamo il blocco posteriore alla nave completa
    shipGroup.add(aftGroup);

    // --- 6. LA PRUA (TESTA DELLA NAVE - STILE ENTERPRISE RIALZATO) ---
    const bowGroup = new THREE.Group();
    
    // A. Il "Collo" Inclinato (Pylon di collegamento)
    // Usiamo un BoxGeometry inclinato verso l'alto per un look più solido e aerodinamico
    const neckGeo = new THREE.BoxGeometry(18, 6, 10);
    const neck = new THREE.Mesh(neckGeo, nasaWhiteMat);
    // Lo posizioniamo a metà strada in alto (Y=10) e spostato a destra (X=46)
    neck.position.set(36, 10, 0); 
    // Lo incliniamo di 30 gradi verso l'alto
    neck.rotation.z = Math.PI / 6; 
    bowGroup.add(neck);

    // B. Il Disco Principale (Saucer Section)
    // Più spesso (altezza 4.5 invece di 2.5) e rialzato
    const saucerRadius = 26;
    const saucerFrontGeo = new THREE.CylinderGeometry(saucerRadius, saucerRadius - 3, 4.5, 64);
    const mainSaucer = new THREE.Mesh(saucerFrontGeo, nasaWhiteMat);
    mainSaucer.position.set(62, 17, 0); // Alzato a Y=17!
    bowGroup.add(mainSaucer);

    // Anello scuro (Bumper) più massiccio
    const saucerBumperGeo = new THREE.TorusGeometry(saucerRadius, 0.8, 16, 64);
    saucerBumperGeo.rotateX(Math.PI / 2);
    const saucerBumper = new THREE.Mesh(saucerBumperGeo, darkTrussMat);
    saucerBumper.position.set(62, 17, 0);
    bowGroup.add(saucerBumper);

    // C. Il Ponte di Comando (Bridge)
    // Struttura rialzata proporzionata al nuovo disco
    const bridgeBaseGeo = new THREE.CylinderGeometry(8, 12, 2, 64);
    const bridgeBase = new THREE.Mesh(bridgeBaseGeo, nasaWhiteMat);
    bridgeBase.position.set(62, 19.5, 0); 
    bowGroup.add(bridgeBase);

    // La Cupola del Ponte
    const bridgeDomeGeo = new THREE.SphereGeometry(6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bridgeDome = new THREE.Mesh(bridgeDomeGeo, nasaWhiteMat);
    bridgeDome.position.set(62, 20.5, 0);
    bridgeDome.scale.set(1, 0.8, 1);
    bowGroup.add(bridgeDome);

    // D. La Vetrata Panoramica del Cockpit (Spostata alla nuova altezza)
    const visorMat = new THREE.MeshStandardMaterial({ 
        color: 0x050508, 
        roughness: 0.1, 
        metalness: 0.9 
    });
    const visorGeo = new THREE.CylinderGeometry(6.1, 6.1, 2, 32, 1, false, -Math.PI / 4, Math.PI / 2);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(62, 21.5, 0);
    visor.rotation.y = -Math.PI / 2;
    bowGroup.add(visor);

    // E. Cupola Sensori Inferiore (Sotto il disco)
    const lowerDomeGeo = new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lowerDome = new THREE.Mesh(lowerDomeGeo, darkTrussMat);
    lowerDome.position.set(62, 14.75, 0); // Sotto il nuovo disco a Y=17
    lowerDome.rotation.x = Math.PI; 
    lowerDome.scale.set(1, 0.5, 1);
    bowGroup.add(lowerDome);

    // F. Propulsori a Impulso (Sul retro del disco)
    // Li spostiamo in alto, attaccati alla parte posteriore della nuova Saucer Section
    const impulseGeo = new THREE.BoxGeometry(3, 2, 8);
    
    const leftImpulse = new THREE.Mesh(impulseGeo, darkTrussMat);
    leftImpulse.position.set(40, 17.5, 8);
    bowGroup.add(leftImpulse);
    
    const leftImpulseGlow = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 7.6), engineGlowMat);
    leftImpulseGlow.position.set(40, 17.5, 8);
    bowGroup.add(leftImpulseGlow);

    const rightImpulse = new THREE.Mesh(impulseGeo, darkTrussMat);
    rightImpulse.position.set(40, 17.5, -8);
    bowGroup.add(rightImpulse);

    const rightImpulseGlow = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 7.6), engineGlowMat);
    rightImpulseGlow.position.set(40, 17.5, -8);
    bowGroup.add(rightImpulseGlow);
    // Aggiungiamo tutta la prua al gruppo principale

    bowGroup.scale.set(1.6, 1.6, 1.6);
    bowGroup.position.set(-22, -6, 0);
    shipGroup.add(bowGroup);




    // --- 7. RIVESTIMENTO ESTERNO DELLA STANZA (Hull Cladding) ---
    const claddingPanels = [
        // Lato Sinistro (copre la faccia esterna del muro a X=-21)
        { w: 0.6,   h: 9.5,  d: 42,  x: -21.0,  y: 4.1,   z: 0     },
        // Lato Destro (copre la faccia esterna del muro a X=+21)
        { w: 0.6,   h: 9.5,  d: 42,  x: 21.0,   y: 4.1,   z: 0     },
        // Frontale Sinistro (da oltre l'angolo fino al bordo porta: X da -21.3 a -3)
        { w: 18.25,  h: 9.5,  d: 0.6, x: -12.15, y: 4.1,   z: -21.0 },
        // Frontale Destro (dal bordo porta fino a oltre l'angolo: X da 3 a 21.3)
        { w: 18.25,  h: 9.5,  d: 0.6, x: 12.15,  y: 4.1,   z: -21.0 },
        // Architrave sopra la porta (copre la trave bianca; passaggio libero sotto Y=4)
        { w: 6.1,     h: 4.84, d: 0.6, x: 0,      y: 6.425, z: -21.0 },
    ];

    claddingPanels.forEach(p => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.d), nasaWhiteMat);
        panel.position.set(p.x, p.y, p.z);
        shipGroup.add(panel); // shadows impostate dal traverse qui sotto
    });


    // --- RENDERIZZAZIONE ---
    shipGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // NOTA IMPORTANTE: Abbiamo RIMOSSO `walls.push(child)`. 
            // Essendo una struttura che sporge sopra e sotto la stanza, 
            // se avesse collisioni il giocatore si incastrerebbe uscendo dalla porta.
            // I muri invisibili della tua stanza originale bastano e avanzano!
        }
    });

    State.scene.add(shipGroup);
}