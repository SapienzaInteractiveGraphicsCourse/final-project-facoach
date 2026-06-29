import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

export function openSciFiDoor() {
    if (State.isDoorOpen) return; // Se la porta è già aperta o si sta aprendo, non fare nulla
    State.isDoorOpen = true;

    // La prima volta che si apre, memorizziamo l'altezza iniziale della porta
    if (State.doorOriginalY === null) State.doorOriginalY = State.door.position.y;

    // 1. Animazione di Apertura (La porta sale di 8 unità)
    new TWEEN.Tween(State.door.position)
        .to({ y: State.doorOriginalY + 8 }, 1200)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // 2. Rimuoviamo temporaneamente la porta dalle collisioni per poter passare
    const doorIndex = State.walls.indexOf(State.door);
    if (doorIndex > -1) {
        State.walls.splice(doorIndex, 1);
    }

    // 3. IL TIMER: Aspetta 5 secondi (5000 millisecondi) e poi avvia la chiusura
    setTimeout(() => {
        closeSciFiDoor();
    }, 8000); 
}

export function closeSciFiDoor() {
    // 1. Animazione di Chiusura (La porta torna alla sua Y originale)
    new TWEEN.Tween(State.door.position)
        .to({ y: State.doorOriginalY }, 1200)
        .easing(TWEEN.Easing.Cubic.In)
        .onComplete(() => {
            // Quando l'animazione è del tutto finita:
            State.isDoorOpen = false; // La porta può essere riaperta dai sensori
            
            // 2. Ripristiniamo la collisione della porta nel sistema dei muri
            if (!State.walls.includes(State.door)) {
                State.walls.push(State.door);
            }
        })
        .start();
}