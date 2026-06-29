import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

export function victoryAnimation() {
    // 1. Incrementiamo l'angolo nel tempo per far girare la camera.
        // Cambia 0.01 per regolare la velocità di rotazione (più alto = più veloce)
        State.cinematicAngle += 0.01; 

        // 2. Calcoliamo le nuove coordinate X e Z locali per l'orbita circolare attorno a (0,0,0)
        const newX = State.player.position.x + 5 * Math.sin(State.cinematicAngle);
        const newZ = State.player.position.z + 5 * Math.cos(State.cinematicAngle);

        // 3. Aggiorniamo la posizione della camera
        State.camera.position.set(newX, 2, newZ);

        // 4. Forza la telecamera a guardare l'origine locale del gruppo player.
        // Poiché model.position.y = 0.7, puntiamo leggermente più in alto (es. y=1) 
        // per inquadrare il busto/testa del robot invece che i suoi piedi.
        const targetLookAt = new THREE.Vector3(State.player.position.x, 1.0, State.player.position.z); 
        State.camera.lookAt(targetLookAt);

        //animazione braccia
        const speed1 = 0.006; // Velocità dell'oscillazione
        const time1 = Date.now() * speed1;
        const amplitude1 = 0.7;
        if (State.leftArm) State.leftArm.rotation.y = -1 - Math.sin(time1 + Math.PI) * amplitude1;
        if (State.rightArm) State.rightArm.rotation.y = 1 - Math.sin(time1) * amplitude1; // Invertito

        //ATTIVARE SCHERMATA VITTORIA

        //impostiamo la disabilitazione dei comandi
        State.isConsoleScreenOpen = true; // Blocca i comandi di movimento e salto
        document.exitPointerLock();
}

export function updateUI() {
    // --- SEZIONE UI (Controllo prossimità unificato) ---
    if (State.player && State.promptUI) {
        // Controlliamo se siamo vicini al bottone OPPURE alla console
        const isNearButton = State.buttonSwitch && State.player.position.distanceTo(State.buttonSwitch.position) < 3;
        const isNearButton2 = State.buttonSwitch2 && State.player.position.distanceTo(State.buttonSwitch2.position) < 3;
        const isNearConsole = State.scifiConsole && State.player.position.distanceTo(State.scifiConsole.position) < 4;
        const isNearReactor = !State.isReactorPickedUp && State.ReactorGroup && State.player.position.distanceTo(State.ReactorGroup.position) < 2;
        const isNearPedestal = State.isReactorPickedUp && State.reactorPedestal && State.player.position.distanceTo(State.reactorPedestal.position) < 3;
        
        if (isNearButton || isNearButton2 || isNearConsole || isNearReactor || isNearPedestal) {
            State.promptUI.style.display = 'block'; // Mostra "Press [F] to interact"
        } else {
            State.promptUI.style.display = 'none';  // Nasconde il suggerimento
        }
    }
}