import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function addSun(){
    // --- IL SOLE ---
    
        // Posizioniamo il Sole più lontano nel cielo (Valori originali x2)
        const sunPosition = new THREE.Vector3(360, 160, -500);
        State.sunPosition = sunPosition;
    
        // Geometria più grande (raggio 25) perché è molto distante
        const sunGeo = new THREE.SphereGeometry(25, 32, 32); 
        const sunMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,           
            emissive: 0xff5500,        
            emissiveIntensity: 2.5,    
            wireframe: false,
            fog: false // Immune alla nebbia
        });
        State.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        State.sunMesh.position.copy(sunPosition);
        State.scene.add(State.sunMesh);
    
        // 2. Luce del sole
        State.sunPointLight = new THREE.PointLight(0xffaa00, 2.0, 1200); // Aumentato il raggio della luce a 1200 visto che è più lontano
        State.sunPointLight.castShadow = true;
        State.sunPointLight.shadow.mapSize.width = 2048; 
        State.sunPointLight.shadow.mapSize.height = 2048;
        State.sunPointLight.shadow.bias = -0.0001; 
        State.sunPointLight.shadow.normalBias = 0.002; 
        State.sunMesh.add(State.sunPointLight);
    
        // 3. CREAZIONE DEI PIVOT NELLO STESSO PUNTO DEL SOLE
        State.sunPivot1 = new THREE.Group();
        State.sunPivot1.position.copy(sunPosition);
        State.scene.add(State.sunPivot1);
    
        State.sunPivot2 = new THREE.Group();
        State.sunPivot2.position.copy(sunPosition);
        State.scene.add(State.sunPivot2);
    
        State.sunPivot3 = new THREE.Group();
        State.sunPivot3.position.copy(sunPosition);
        State.scene.add(State.sunPivot3);
    
        State.sunPivot4 = new THREE.Group();
        State.sunPivot4.position.copy(sunPosition);
        State.scene.add(State.sunPivot4);
    
        State.sunPivot5 = new THREE.Group();
        State.sunPivot5.position.copy(sunPosition);
        State.scene.add(State.sunPivot5);
    
        State.binaryPivot = new THREE.Group();
        State.binaryPivot.position.set(260, 70, -400);
        State.scene.add(State.binaryPivot);
    
        // 2. LE FIAMME SOLARI (Tempesta di particelle)
        const flareGeo = new THREE.BufferGeometry();
        const flareCount = 600; // Quante fiammelle/scintille vuoi
        const flarePositions = new Float32Array(flareCount * 3);
    
        for(let i = 0; i < flareCount * 3; i += 3) {
            // Matematica per distribuire le particelle casualmente su una sfera
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
        
            // Distanza casuale dal centro (tra la superficie a 25 e l'atmosfera a 29)
            const r = 22.5 + Math.random() * 4; 
    
            flarePositions[i] = r * Math.sin(phi) * Math.cos(theta);     // Asse X
            flarePositions[i+1] = r * Math.sin(phi) * Math.sin(theta);   // Asse Y
            flarePositions[i+2] = r * Math.cos(phi);                     // Asse Z
        }
    
        flareGeo.setAttribute('position', new THREE.BufferAttribute(flarePositions, 3));
        const flareMat = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.8,                 // Grandezza delle scintille
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            fog: false
        });
        State.solarFlares = new THREE.Points(flareGeo, flareMat);
        State.sunMesh.add(State.solarFlares); // Agganciamo anche le particelle al sole
    
}

export function addPlanets(){

    const loader = new GLTFLoader(State.loadingManager);

    loader.load('./models/Planet2.glb', (gltf) => {
        State.planet2 = gltf.scene;
        State.planet2.scale.set(5, 5, 5);
        State.planet2.castShadow = true;
        State.planet2.receiveShadow = true;

        // Distanza dal sole (es: 150 unità a destra, su un'orbita più larga)
        State.planet2.position.set(300, -20, -20);
    
        // Agganciamo il Pianeta 2 al secondo Pivot del sole
        State.sunPivot2.add(State.planet2);

        // --- SPOSTIAMO QUI IL CARICAMENTO DELLA LUNA ---
        loader.load('./models/moon.glb', (gltf) => {
            State.moon = gltf.scene;
            State.moon.scale.set(0.5, 0.5, 0.5);
            State.moon.castShadow = true;
            State.moon.receiveShadow = true;

            // Creiamo il perno della luna
            State.moonPivot = new THREE.Group();
        
            // IMPORTANTE: Mettiamo il perno della luna a (0,0,0) LOCALI del pianeta
            State.moonPivot.position.set(0, 0, 0); 
        
            // Allontaniamo la luna dal suo perno
            State.moon.position.set(2, 0, 0); 
        
            State.moonPivot.add(State.moon);
        
            // TRUCCO: Aggiungiamo il perno della luna DENTRO al pianeta 2!
            State.planet2.add(State.moonPivot); 
        });
    });

    loader.load('./models/Planet.glb', (gltf) => {
        State.planet = gltf.scene;
        State.planet.scale.set(4, 4, 4); 
        // Posizioniamo il pianeta
        State.planet.position.set(-300, -40, 60);
        // Rendiamo il modello capace di proiettare ombre
        State.planet.castShadow = true;
        State.planet.receiveShadow = true;

        //inclinazione asse
        State.planet.rotation.z = 0.41;
        State.sunPivot1.add(State.planet);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    loader.load('./models/Planet3.glb', (gltf) => {
        State.planet3 = gltf.scene;
        State.planet3.scale.set(2, 2, 2); 
        // Posizioniamo il pianeta
        State.planet3.position.set(-300, 20, 100);
        // Rendiamo il modello capace di proiettare ombre
        State.planet3.castShadow = true;
        State.planet3.receiveShadow = true;

        // --- AGGIUNTA DELLA POINTLIGHT VIOLA ---
        // Argomenti: (colore esadecimale, intensità, distanza massima della luce)
        const coreLight = new THREE.PointLight(0x9900ff, 15, 40); 
        // Posizione 0,0,0 significa "esattamente nel centro del pianeta"
        coreLight.position.set(0, 0, 0); 
        // Se vuoi che i frammenti proiettino ombre sui muri o sulla mappa grazie a questa luce:
        coreLight.castShadow = true; 
        // Regoliamo il bilanciamento dell'ombra per evitare artefatti grafici (opzionale ma consigliato)
        coreLight.shadow.bias = -0.002; 
        // Agganciamo la luce direttamente AL PIANETA
        State.planet3.add(coreLight);

        State.sunPivot3.add(State.planet3);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    loader.load('./models/Planet4.glb', (gltf) => {
        State.planet4 = gltf.scene;
        State.planet4.scale.set(5, 5, 5); 
        // Posizioniamo il pianeta
        State.planet4.position.set(200, 0, 80);
        // Rendiamo il modello capace di proiettare ombre
        State.planet4.castShadow = true;
        State.planet4.receiveShadow = true;

        //inclinazione asse
        State.planet4.rotation.z = 0.41;
        State.sunPivot4.add(State.planet4);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    loader.load('./models/Planet5.glb', (gltf) => {
        // Assegniamo il modello caricato a planet5
        State.planet5 = gltf.scene;

        State.planet5.scale.set(4, 4, 4); 
        
        // Posizioniamo i pianeti speculari rispetto al centro del loro pivot (0,0,0 locale)
        // Invece di usare coordinate assolute mondiali, li spostiamo rispetto al binaryPivot
        State.planet5.position.set(-15, 0, 0); 
        
        // Rendiamo i modelli capaci di proiettare ombre
        State.planet5.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        

        // Aggiungiamo il baricentro al perno orbitale attorno al sole
        State.sunPivot5.add(State.binaryPivot);

        // Aggiungiamo i due pianeti al loro baricentro comune
        State.binaryPivot.add(State.planet5);

        console.log("Sistema binario caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello binario:", error);
    });

    loader.load('./models/Planet6.glb', (gltf) => {
        // Assegniamo il modello caricato a planet5
        State.planet6 = gltf.scene;
        
        State.planet6.scale.set(4, 4, 4);
        
        State.planet6.position.set(15, 0, 0); 
        
        State.planet6.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        State.binaryPivot.add(State.planet6);

        console.log("Sistema binario caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello binario:", error);
    });


}

export function addComet(){
    // --- LA COMETA ---

        const loader = new GLTFLoader(State.loadingManager);
        // 1. Gruppo principale posizionato esattamente sul Sole
        State.cometOrbitGroup = new THREE.Group();
        State.cometOrbitGroup.position.copy(State.sunPosition); 
    
        // INCLINAZIONE: Ruotiamo il piano dell'orbita per non renderlo parallelo agli altri pianeti
        State.cometOrbitGroup.rotation.x = 0.7; // Inclinazione trasversale
        State.cometOrbitGroup.rotation.z = 0.3; // Inclinazione longitudinale
        State.scene.add(State.cometOrbitGroup);
    
        // 2. Gruppo locale della cometa (conterrà nucleo + scia)
        State.cometGroup = new THREE.Group();
        State.cometGroup.userData = { theta: 0 }; // Angolo iniziale dell'orbita
        State.cometOrbitGroup.add(State.cometGroup);
    
        // 3. Il Nucleo della cometa (una sfera luminosa)
        loader.load('./models/Comet.glb', (gltf) => {
            const model = gltf.scene;
        
            // Configurazione Modello
            model.scale.set(1.5, 1.5, 1.5); 
    
            // Rendiamo il modello capace di proiettare ombre
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            model.rotation.y = Math.PI;
            State.cometGroup.add(model);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        // 4. La Scia di Particelle (Sistema ottimizzato)
        const CometparticleCount = 1500; // Ottimo compromesso tra densità e prestazioni
        const tailLength = 45;      // Lunghezza della coda
        
        const tailGeo = new THREE.BufferGeometry();
        const tailPositions = new Float32Array(CometparticleCount * 3);
        const tailColors = new Float32Array(CometparticleCount * 3);
    
        // Colori della scia: da bianco/azzurro incandescente (vicino al nucleo) a blu scuro (alla fine)
        const colorHead = new THREE.Color(0xe6ffff); 
        const colorTail = new THREE.Color(0x0022cc);
    
        for (let i = 0; i < CometparticleCount; i++) {
            // La posizione Z va da 0 (vicino al nucleo) a tailLength (lontano)
            // NOTA: Usiamo valori positivi di Z. Poiché lookAt punta l'asse -Z verso il Sole,
            // posizionare le particelle su +Z le farà allungare perfettamente dalla parte opposta!
            const z = Math.random() * tailLength;
    
            // La scia si allarga man mano che ci si allontana dal nucleo
            const spread = (z / tailLength) * 5; 
            
            // Distribuzione circolare casuale (crea la forma del cono)
            const angle = Math.random() * Math.PI * 2;
            // Concentriamo più particelle al centro del cono e meno sui bordi esterni
            const radius = Math.pow(Math.random(), 2) * spread;
    
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
    
            const i3 = i * 3;
            tailPositions[i3] = x;
            tailPositions[i3 + 1] = y;
            tailPositions[i3 + 2] = z;
    
            // Sfumiamo il colore in base alla distanza Z dal nucleo
            const mixedColor = colorHead.clone();
            mixedColor.lerp(colorTail, z / tailLength);
            
            tailColors[i3] = mixedColor.r;
            tailColors[i3 + 1] = mixedColor.g;
            tailColors[i3 + 2] = mixedColor.b;
        }
    
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
        tailGeo.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
        tailGeo.rotateX(Math.PI );
    
        const tailMat = new THREE.PointsMaterial({
            size: 0.5,                  // Grandezza della singola particella
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending, // Somma i colori creando un bagliore intenso al centro
            depthWrite: false,          // Previene i fastidiosi "quadrati neri" di sovrapposizione
            fog: false
        });
    
        State.cometTail = new THREE.Points(tailGeo, tailMat);
        
        // IMPORTANTE: Spostiamo leggermente la coda all'indietro per non farla compenetrare col nucleo
        State.cometTail.position.z = 1.0; 
        
        State.cometGroup.add(State.cometTail);
}