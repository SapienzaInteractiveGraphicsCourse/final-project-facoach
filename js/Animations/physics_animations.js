import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

export function checkCollisions(oldPos) {
    // 4. COLLISIONI (Unificate)
    let onObject = false; 

    State.platforms.forEach(plat => {
        if (plat.userData.active === false) return;

        // Movimento piattaforme (Logica X/Z già discussa)
        if (plat.userData.isMoving) {
            plat.userData.time += 0.02;
            const movement = Math.sin(plat.userData.time) * 3;
            if (plat.userData.moveAxis === 'x') {
                const nextX = (plat.userData.startX || 0) + movement;
                plat.userData.deltaX = nextX - plat.position.x;
                plat.position.x = nextX;
            } else if (plat.userData.moveAxis === 'z') {
                const nextZ = (plat.userData.startZ || 0) + movement;
                plat.userData.deltaZ = nextZ - plat.position.z;
                plat.position.z = nextZ;
            } else { 
                const nextY = (plat.userData.startY || 0) + movement;
                plat.userData.deltaY = nextY - plat.position.y;
                plat.position.y = nextY;
            }
        }

        const dX = Math.abs(State.player.position.x - plat.position.x);
        const dZ = Math.abs(State.player.position.z - plat.position.z);
        const halfW = plat.geometry.parameters.width / 2 + 0.4;
        const halfD = plat.geometry.parameters.depth / 2 + 0.4;

        if (dX < halfW && dZ < halfD) {
            // Regoliamo i margini di collisione basandoci sull'altezza della geometria
            const pHeight = plat.geometry.parameters.height / 2;
            const topLevel = plat.position.y + pHeight + 0.5; 
            const bottomLevel = plat.position.y - pHeight - 0.5;

            if (State.player.position.y <= topLevel && State.player.position.y > plat.position.y && State.velocityY <= 0) {
                State.player.position.y = topLevel;
                State.velocityY = 0;
                onObject = true;
                if (plat.userData.isMoving) {
                    State.player.position.x += (plat.userData.deltaX || 0);
                    State.player.position.z += (plat.userData.deltaZ || 0);
                }
            } 
            else if (State.player.position.y < topLevel && State.player.position.y > bottomLevel) {
                // COLLISIONE LATERALE (Mura e lati piattaforme)
                State.player.position.x = oldPos.x;
                State.player.position.z = oldPos.z;
            }
        }
    });

    // 2. COLLISIONE DISCO SPECIFICA
    // Calcoliamo la distanza orizzontale dal centro del disco
    const dX = State.player.position.x - State.floorDisk.position.x;
    const dZ = State.player.position.z - State.floorDisk.position.z;
    const distance = Math.sqrt(dX * dX + dZ * dZ);

    const radius = 34; // Il raggio del tuo disco
    const pHeight = 1; // Metà altezza della geometria del disco (saucerGeo ha altezza 2)
    const topLevel = State.floorDisk.position.y + pHeight + 0.5;

    // Se il giocatore è sopra il disco
    if (distance < radius) {
        if (State.player.position.y <= topLevel && State.player.position.y > State.floorDisk.position.y && State.velocityY <= 0) {
            State.player.position.y = topLevel;
            State.velocityY = 0;
            onObject = true; // Il giocatore è sul disco
        }
    }

    // 3. GRAVITÀ E SALTO (Usano onObject)
    if (onObject) {
        State.isJumping = false;
        State.velocityY = 0;
    }   

    // --- B. COLLISIONE MURI (Solo blocco laterale) ---
    State.walls.forEach(wall => {
        const dX = Math.abs(State.player.position.x - wall.position.x);
        const dZ = Math.abs(State.player.position.z - wall.position.z);

        const halfW = wall.geometry.parameters.width / 2 + 0.4;
        const halfD = wall.geometry.parameters.depth / 2 + 0.4;
        const h = wall.geometry.parameters.height / 2;

        // Se siamo dentro i confini X e Z del muro E la nostra altezza Y è "dentro" il muro
        if (dX < halfW && dZ < halfD) {
            if (State.player.position.y < wall.position.y + h + 0.5 && State.player.position.y > wall.position.y - h - 0.5) {
                State.player.position.x = oldPos.x;
                State.player.position.z = oldPos.z;
            }
        }
    });

    State.isJumping = !onObject;


}

export function updateGravity() {
    // 3. GRAVITÀ
    State.velocityY += State.gravity;
    State.player.position.y += State.velocityY;

    // Reset caduta
    if (State.player.position.y < -30) {
        State.player.position.set(0, 5, 5);
        State.velocityY = 0;
    }
}