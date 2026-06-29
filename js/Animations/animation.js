import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';
import {updateSolarSystem, updateBlackHole, updateComet} from './celestial_bodies_animations.js';
import {openSciFiDoor, closeSciFiDoor} from './door_animations.js';
import {updateMovement, updateCameraPosition} from './player_animations.js';
import {updateSpaceProps, updateRoomProps} from './props_animations.js';
import {victoryAnimation, updateUI} from './UI_animations.js';
import {checkCollisions, updateGravity} from './physics_animations.js';
import {updateSensors, updateSpecialPlatforms} from './interactive_animations.js';



// --- 4. ANIMAZIONE E LOGICA ---
export function animate() {
    requestAnimationFrame(animate);
    const oldPos = State.player.position.clone();

    TWEEN.update();

    // 2. MOVIMENTO
    updateMovement();

    checkCollisions(oldPos);

    updateGravity();


    updateSpaceProps();
    updateRoomProps();

    //aggiornamento sole e pianeti
    updateSolarSystem();

    updateComet();

    updateBlackHole();

    updateUI();


    //animazione di vittoria
    if (State.isReactorPlaced) {
        victoryAnimation();
    }

    // --- LOGICA CAMERA ANTI-CLIPPING ---
    if (!State.isConsoleScreenOpen) {
        updateCameraPosition();
    }

    updateSensors();
    updateSpecialPlatforms();
    State.renderer.render(State.scene, State.camera);
}