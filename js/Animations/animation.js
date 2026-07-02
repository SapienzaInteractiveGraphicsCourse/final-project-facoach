import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

//import auxiliary functions from other modules
import {getIntensityOnObject} from '../Core/utils.js';
import {updateSolarSystem, updateBlackHole, updateComet} from './celestial_bodies_animations.js';
import {openSciFiDoor, closeSciFiDoor} from './door_animations.js';
import {updateMovement, updateCameraPosition} from './player_animations.js';
import {updateSpaceProps, updateRoomProps} from './props_animations.js';
import {victoryAnimation, updateUI} from './UI_animations.js';
import {checkCollisions, updateGravity} from './physics_animations.js';
import {updateSensors, updateSpecialPlatforms} from './interactive_animations.js';


// all animations are managed here
export function animate() {
    //setup
    requestAnimationFrame(animate);
    const oldPos = State.player.position.clone();
    const deltaTime = State.clock.getDelta(); //time that lets adapt the speed of the animations to the framerate, so that they are always smooth indepenently of the machine
    TWEEN.update();

    // player movement, with collision detection and gravity
    updateMovement(deltaTime);

    checkCollisions(oldPos);

    updateGravity();

    // props animations, like the hologram table, the wall consoles etc.
    updateSpaceProps();
    updateRoomProps();

    //celestial bodies animations, like the solar system, the comet and the black hole
    updateSolarSystem();

    updateComet();

    updateBlackHole();

    //UI animation
    updateUI();


    //victory screen
    if (State.isReactorPlaced) {
        victoryAnimation();
    }

    // camera anticlipping
    if (!State.isConsoleScreenOpen) {
        updateCameraPosition();
    }

    //check if sensors and special platforms need to be updated (if they interact with light)
    updateSensors();
    updateSpecialPlatforms();
    State.renderer.render(State.scene, State.camera);
}