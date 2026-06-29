import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';


export function updateSolarSystem() {
    const currenttime = Date.now() * 0.001; // Tempo in secondi
    // 1. Il Sole ruota lentamente su se stesso
    if (State.sunMesh) {
        State.sunMesh.rotation.y += 0.0005;

        // Animazione delle fiamme (Le particelle turbinano veloci)
        if (State.solarFlares) {
            State.solarFlares.rotation.y -= 0.0015; 
            State.solarFlares.rotation.x += 0.0008;
        }
    }

    // 2. I due pianeti orbitano attorno al sole a velocità differenti
    if (State.sunPivot1) {
        State.sunPivot1.rotation.y += 0.001;  // Pianeta 1 più veloce (orbita interna)
    }
    if (State.sunPivot2) {
        State.sunPivot2.rotation.y += 0.0004; // Pianeta 2 più lento (orbita esterna)
    }
    if (State.sunPivot3) {
        State.sunPivot3.rotation.y += 0.0005; // Pianeta 3 più lento (orbita esterna)
    }
    if (State.sunPivot4) {
        State.sunPivot4.rotation.y += 0.0007; // Pianeta 4 più lento (orbita esterna)
    }
    if (State.sunPivot5) {
        State.sunPivot5.rotation.y += 0.0003; // Pianeta 5 più lento (orbita esterna)
    }
    //intergrazione seconda legge di Keplero per il sistema binario
    if (State.binaryPivot && State.planet5 && State.planet6) {
        // 1. Estraiamo il valore del seno per usarlo in due posti (oscilla sempre tra -1 e 1)
        const sineWave = Math.sin(1.5 * currenttime); 

        // 2. Rotazione variabile
        State.binaryPivot.rotation.y += Math.max(0.01, 0.05 * sineWave);

        // 3. Calcolo della distanza dinamica
        const baseDistance = 15; // La distanza media dal centro
        const variation = 6;     // Di quante unità si avvicineranno/allontaneranno al massimo
        
        // Sottraendo la variazione moltiplicata per il seno, otteniamo l'effetto elastico:
        // Quando sineWave è +1 (massima velocità) -> distanza = 15 - 6 = 9 (molto vicini)
        // Quando sineWave è -1 (minima velocità) -> distanza = 15 - (-6) = 21 (molto lontani)
        const currentDistance = baseDistance - (variation * sineWave);

        // 4. Aggiorniamo in tempo reale la posizione locale dei due pianeti
        State.planet5.position.x = -currentDistance;
        State.planet6.position.x = currentDistance;
    }

    // 3. I pianeti ruotano sul proprio asse
    if (State.planet) State.planet.rotation.y += 0.005;
    if (State.planet2) State.planet2.rotation.y += 0.003;
    if (State.planet3) State.planet3.rotation.y += 0.008;
    if (State.planet4) State.planet4.rotation.y += 0.003;
    if (State.planet5) State.planet5.rotation.y += 0.004;
    if (State.planet6) State.planet6.rotation.y += 0.004;

    // 4. La luna gira attorno al pianeta 2 
    if (State.moonPivot) {
        State.moonPivot.rotation.y += 0.015;
    }
}

export function updateComet() {
    // --- FISICA E LOGICA DELLA COMETA ---
    if (State.cometGroup && State.sunMesh && State.cometTail) {
        // 1. Dimensioni dell'ellisse
        const a = 550; // Semi-asse maggiore (lunghezza)
        const b = 320; // Semi-asse minore (larghezza)

        // 2. Calcolo del Fuoco (Distanza dal centro)
        // Formula: c = radice quadrata di (a^2 - b^2)
        const c = Math.sqrt((a * a) - (b * b)); 

        // 3. Spostiamo l'ellisse! 
        // Sottraendo 'c' ad 'a * cos', mettiamo il Sole esattamente nel fuoco dell'ellisse.
        const xLoc = (a * Math.cos(State.cometGroup.userData.theta)) - c;
        const zLoc = b * Math.sin(State.cometGroup.userData.theta);
        State.cometGroup.position.set(xLoc, 0, zLoc);

        // 4. LA SCIA PERFETTA
        // Ora diciamo alla cometa di guardare la posizione GLOBALE del Sole.
        // Così facendo, il suo "muso" punta al sole e la scia si allunga perfettamente alle sue spalle.
        State.cometGroup.lookAt(State.sunMesh.position);

        // 5. SECONDA LEGGE DI KEPLERO (Velocità variabile)
        // distanceToSun ora è la distanza reale dal fuoco
        const distanceToSun = State.cometGroup.position.length();
    
        // La velocità è inversamente proporzionale alla distanza.
        // Quando passa vicinissima al sole (perielio) schizzerà a gran velocità, 
        // quando è lontana (afelio) sembrerà quasi ferma.
        const orbitSpeed = 20 / distanceToSun;
        
        //la lunghezza della coda si adatta alla distanza dal sole (più vicina = coda più lunga, più lontana = coda più corta)
        State.cometTail.scale.z = 0.4 + 200/distanceToSun; // La coda si allunga drasticamente quando è vicina al sole

        // Moltiplicatore 0.02 per bilanciare i frame e non farla andare a scatti
        State.cometGroup.userData.theta += orbitSpeed * 0.02; 
    }

    // --- ANIMAZIONE FLUIDA DELLA CODA (Zero impatto sulle prestazioni) ---
    if (State.cometTail) {
        const tail = State.cometTail;
        
        // Usiamo il tempo corrente per creare oscillazioni fluide
        const time = Date.now() * 0.004; 

        // 1. EFFETTO VORTICE
        // Facciamo ruotare la coda sul suo asse. Le particelle sembreranno 
        // turbinare come in un vero flusso di plasma energetico.
        tail.rotation.z += 0.1;

        // 2. EFFETTO FOLATA (Vento Solare instabile)
        // Usiamo Math.sin e Math.cos per far "sfarfallare" leggermente il diametro della coda.
        // Il moltiplicatore 0.04 significa un'oscillazione massima del 4%, molto naturale.
        tail.scale.x = 1.0 + Math.sin(time) * 0.1;
        tail.scale.y = 1.0 + Math.cos(time * 1.2) * 0.1;

    }

}

export function updateBlackHole() {
    // ROTAZIONE DEL BUCO NERO
    if (State.accretionDisk) {
        // Estraiamo l'array con le posizioni (X, Y, Z) di tutte le 10.000 particelle
        const positions = State.accretionDisk.geometry.attributes.position.array;
        
        // Cicliamo attraverso tutte le particelle
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2]; // La Y non la tocchiamo (i + 1)
            
            // 1. Calcoliamo la distanza attuale di questa particella dal centro (Teorema di Pitagora)
            const r = Math.sqrt(x * x + z * z);
            
            // 2. Fisica reale (Keplero): la velocità angolare aumenta DRASTICAMENTE vicino al centro.
            // Il numero 12 è il "moltiplicatore di velocità". Alzalo (es. 20) per renderlo più rapido!
            const speed = 15 / Math.pow(r, 1.5); 
            
            // 3. Matrice di rotazione 2D: calcoliamo la nuova posizione lungo l'orbita
            const cos = Math.cos(-speed); // Il segno meno stabilisce il senso orario/antiorario
            const sin = Math.sin(-speed);
            
            // 4. Aggiorniamo le coordinate X e Z
            positions[i] = x * cos - z * sin;
            positions[i + 2] = x * sin + z * cos;
        }
        
        // 5. Comunichiamo obbligatoriamente alla scheda video che le posizioni sono state modificate
        State.accretionDisk.geometry.attributes.position.needsUpdate = true;
    }

}