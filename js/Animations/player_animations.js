import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

export function updateMovement(){
    // 2. MOVIMENTO
    if (!State.isConsoleScreenOpen) {
        const currentSpeed = State.keys.shift ? 0.25 : 0.12;
        if (State.keys.w) State.player.translateZ(-currentSpeed);
        if (State.keys.s) State.player.translateZ(currentSpeed);
        if (State.keys.a) State.player.translateX(-currentSpeed);
        if (State.keys.d) State.player.translateX(currentSpeed);
    }

    if ((State.keys.w || State.keys.s || State.keys.a || State.keys.d) && !State.isConsoleScreenOpen) {
        const speed = 0.008; // Velocità dell'oscillazione
        const time = Date.now() * speed;
        const amplitude = 0.5; // Quanto deve oscillare (in radianti)

        // Usiamo Math.sin per creare un movimento avanti e indietro armonico
        if (State.leftArm) State.leftArm.rotation.x = Math.sin(time) * amplitude;
        if (State.rightArm) State.rightArm.rotation.x = -Math.sin(time) * amplitude; // Invertito
        if (State.leftLeg) State.leftLeg.rotation.x = -Math.sin(time) * amplitude;
        if (State.rightLeg) State.rightLeg.rotation.x = Math.sin(time) * amplitude; // Invertito
    } else {
        // Quando è fermo, riporta le braccia in posizione naturale (opzionale)
        if (State.leftArm) State.leftArm.rotation.x = THREE.MathUtils.lerp(State.leftArm.rotation.x, 0, 0.1);
        if (State.rightArm) State.rightArm.rotation.x = THREE.MathUtils.lerp(State.rightArm.rotation.x, 0, 0.1);
        if (State.leftLeg) State.leftLeg.rotation.x = THREE.MathUtils.lerp(State.leftLeg.rotation.x, 0, 0.1);
        if (State.rightLeg) State.rightLeg.rotation.x = THREE.MathUtils.lerp(State.rightLeg.rotation.x, 0, 0.1);
    }
}

export function updateCameraPosition() {
    // 1. Calcola dove "vorrebbe" stare la camera se non ci fossero muri.
        // Partiamo dall'origine del giocatore e andiamo all'indietro e in alto.
        const idealPos = new THREE.Vector3(0, State.cameraHeightOffset, State.idealCameraDistance);
        
        // Applichiamo l'inclinazione verticale (Pitch) e poi la rotazione orizzontale del player (Yaw)
        idealPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), State.cameraPitch);
        idealPos.applyQuaternion(State.player.quaternion);
        
        // Trasformiamo in coordinate globali sommandola alla posizione del player
        // Alziamo leggermente il punto di partenza (es. y + 1) per puntare alle spalle e non ai piedi
        const playerPos = new THREE.Vector3(State.player.position.x, State.player.position.y + 1.5, State.player.position.z);
        idealPos.add(playerPos);

        // 2. Prepara il raggio per il controllo collisioni
        // Direzione dal player verso la posizione ideale della camera
        const dir = new THREE.Vector3().subVectors(idealPos, playerPos).normalize();
        const maxDist = playerPos.distanceTo(idealPos);
        
        State.cameraRaycaster.set(playerPos, dir);

        // 3. Controlla se il raggio colpisce un muro
        const intersects = State.cameraRaycaster.intersectObjects(State.walls, false);

        let finalPos = idealPos;

        if (intersects.length > 0) {
            const hitDist = intersects[0].distance;
            // Se l'ostacolo è più vicino della telecamera, avviciniamo la telecamera
            if (hitDist < maxDist) {
                // Posizioniamo la telecamera leggermente "prima" del muro (es. 0.2 unità per margine)
                const safeDist = Math.max(State.minCameraDistance, hitDist - 0.2);
                finalPos = new THREE.Vector3().copy(playerPos).add(dir.multiplyScalar(safeDist));
            }
        }

        // 4. Aggiorna fluidamente la posizione della camera
        // Usiamo lerp per un movimento morbido ed evitare scatti improvvisi
        State.camera.position.lerp(finalPos, 0.2);

        // 5. Fai guardare la camera sempre verso il player (con l'offset verticale e il pitch)
        const lookAtPos = new THREE.Vector3(0, 1.5, 0); // Guarda le spalle del robot
        lookAtPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), State.cameraPitch);
        lookAtPos.applyQuaternion(State.player.quaternion);
        lookAtPos.add(State.player.position);
        
        State.camera.lookAt(lookAtPos);
    }