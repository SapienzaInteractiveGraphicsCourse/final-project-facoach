import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';


export function updateSpaceProps() {
    //flicker delle stelle
    const currenttime = Date.now() * 0.001; // Tempo in secondi
    if (State.starMaterial) {
        // Math.sin oscilla tra -1 e 1. 
        // Con questa formula lo facciamo oscillare tra 0.7 e 1.0
        State.starMaterial.opacity = 0.85 + Math.sin(currenttime * 3) * 0.4;
    }

    //ROTAZIIONE GALASSIA
    State.galaxies.forEach(galaxy => {
        galaxy.rotation.y += 0.0004; // Rotazione impercettibile e maestosa
    });

    //rotazione assi centrifuga
    if (State.spoke1 && State.spoke2){
        State.spoke1.rotation.x += 0.02;
        State.spoke2.rotation.x += 0.02; // Ruota in senso opposto per un effetto più dinamico
    }

}

export function updateRoomProps() {

    // --- FLUTTUAZIONE DEL PUNTO ESCLAMATIVO (!) ---
    if (State.consoleIndicator) {
        State.consoleIndicator.position.y = 3.5 + Math.sin(Date.now() * 0.004) * 0.15;
    }

    // Animazione anello piedistallo
    if (State.reactorPedestal && State.reactorPedestal.userData.warpRing) {
        // L'anello ruota su se stesso e fluttua leggermente su e giù
        State.reactorPedestal.userData.warpRing.rotation.z += 0.01;
        State.reactorPedestal.userData.warpRing.position.y = 1.0 + Math.sin(Date.now() * 0.002) * 0.1;
    }

    // --- ANIMAZIONE SCHERMI TERMINALI ---
    if (State.animatedScreens.length > 0) {
    
        State.animatedScreens.forEach(screenData => {
            const { ctx, canvas, texture } = screenData;
        
            // 1. Sfondo Azzurro scuro
            ctx.fillStyle = '#051024'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Elementi grafici della UI (Stile Pragmata / Ologramma)
            ctx.fillStyle = '#00e5ff'; // Ciano luminoso
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;

            // Disegna una griglia o delle linee fisse per dare l'idea di un'interfaccia
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            ctx.beginPath();
            ctx.moveTo(20, 100);
            ctx.lineTo(canvas.width - 20, 100);
            ctx.stroke();

            // 3. Testo animato illeggibile
            ctx.font = '24px monospace';
            screenData.offsetY = (screenData.offsetY + 2) % (canvas.height - 100); // Velocità di scorrimento

            for (let i = 0; i < 15; i++) {
                // Testo casuale esadecimale simulato
                let fakeData = Math.random().toString(16).substring(2, 12).toUpperCase();
                // Posizione Y calcolata con l'offset per far scorrere il testo verso il basso
                let y = 140 + ((screenData.offsetY + i * 40) % (canvas.height - 120));
            
                // Crea un effetto di "fade out" verso il basso
                ctx.globalAlpha = 1.0 - (y / canvas.height);
                ctx.fillText(`SYS_CHK_${i}: [${fakeData}]`, 40, y);
            }
            ctx.globalAlpha = 1.0; // Resetta l'alpha

            // Comunica a Three.js di aggiornare la texture a schermo
            texture.needsUpdate = true;
        });
    }

    // --- ANIMAZIONE LED MAINFRAME ---
    if (State.serverLEDs.length > 0) {
        const tempo = Date.now() * 0.005; // Regola il moltiplicatore per la velocità generale
        
        State.serverLEDs.forEach(ledData => {
            // Usa una funzione sinusoide combinata con offset per un lampeggio disordinato e tecnologico
            const intensity = Math.sin(tempo * ledData.blinkRate + ledData.timeOffset);
            
            // Se l'intensità scende sotto una certa soglia, spegniamo il LED (nero)
            if (intensity > 0.5) {
                ledData.material.color.setHex(ledData.baseColor);
            } else {
                ledData.material.color.setHex(0x111111); // "Spento" (grigio molto scuro)
            }
        });
    }

    // --- ANIMAZIONE ENERGY PIPES ---
    if (State.activePipes.length > 0) {
        const flowSpeed = 0.02; // Velocità di scorrimento del plasma
        
        State.activePipes.forEach(texture => {
            texture.offset.y -= flowSpeed; // Muove la texture verso l'alto
        });
    }

    if (State.holoSystem) {
        State.holoSystem.rotation.y += 0.01; // Fa ruotare il sistema olografico
    }

    // --- ANIMAZIONE DEL RADAR ---
    if (State.radarBlip) {
        State.blipTimer += 0.04; // Regola questo valore per cambiare la VELOCITÀ del lampeggio

        // Math.sin oscilla tra -1 e 1. Usiamo Math.max(0, ...) per fare in modo che 
        // resti invisibile per metà del tempo (quando il seno è negativo) simulando una pausa
        const opacityValue = Math.max(0, Math.sin(State.blipTimer));
        State.radarBlip.material.opacity = opacityValue;

        // Quando il timer compie un intero ciclo (2 * PI), il puntino è tornato invisibile.
        // Questo è il momento perfetto per spostarlo in un punto random senza che il giocatore lo veda saltare!
        if (State.blipTimer >= Math.PI * 2) {
            State.blipTimer = 0; // Resetta il ciclo del timer

            // Generiamo una posizione random dentro un cerchio usando la trigonometria.
            // Il radar ha un raggio di 1.9, quindi teniamo il puntino entro un raggio massimo di 1.6 per non farlo toccare i bordi.
            const randomAngle = Math.random() * Math.PI * 2;
            const randomRadius = Math.random() * 1.6; 

            // Calcoliamo le coordinate X e Y locali sulla faccia del radar
            State.radarBlip.position.x = Math.cos(randomAngle) * randomRadius;
            State.radarBlip.position.y = Math.sin(randomAngle) * randomRadius;
        }
    }

}