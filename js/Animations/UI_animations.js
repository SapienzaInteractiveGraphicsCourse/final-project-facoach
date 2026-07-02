import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

//function to animate the victory sceen, rotating camera around the player, the player cheers moving arms, and UI shows a victory message
export function victoryAnimation() {
    // periodically increment the angle to rotate the camera
        State.cinematicAngle += 0.01; 

        // set the coordinates of center of rotation
        const newX = State.player.position.x + 5 * Math.sin(State.cinematicAngle);
        const newZ = State.player.position.z + 5 * Math.cos(State.cinematicAngle);

        // update camera position during rotation
        State.camera.position.set(newX, 2, newZ);

        // Force camera to look at the player
        const targetLookAt = new THREE.Vector3(State.player.position.x, 1.0, State.player.position.z); 
        State.camera.lookAt(targetLookAt);

        //arms animation
        const speed1 = 0.006; // moving arms speed
        const time1 = Date.now() * speed1;
        const amplitude1 = 0.7;
        if (State.leftArm) State.leftArm.rotation.y = -1 - Math.sin(time1 + Math.PI) * amplitude1;
        if (State.rightArm) State.rightArm.rotation.y = 1 - Math.sin(time1) * amplitude1; // Invertito

        //UI is inserted already once at the placing of the reactor, no need to insert it at every frame

        //disable player interaction, game is won
        State.isConsoleScreenOpen = true; //it blocks jump and WASD
        document.exitPointerLock();
}

export function updateUI() {
    // if player is near a button, console or reactor, show the prompt "Press [F] to interact"
    if (State.player && State.promptUI) {
        // check if close to a point of interest
        const isNearButton = State.buttonSwitch && State.player.position.distanceTo(State.buttonSwitch.position) < 3;
        const isNearButton2 = State.buttonSwitch2 && State.player.position.distanceTo(State.buttonSwitch2.position) < 3;
        const isNearConsole = State.scifiConsole && State.player.position.distanceTo(State.scifiConsole.position) < 4;
        const isNearReactor = !State.isReactorPickedUp && State.ReactorGroup && State.player.position.distanceTo(State.ReactorGroup.position) < 2;
        const isNearPedestal = State.isReactorPickedUp && State.reactorPedestal && State.player.position.distanceTo(State.reactorPedestal.position) < 3;
        
        //if close, show the prompt
        if (isNearButton || isNearButton2 || isNearConsole || isNearReactor || isNearPedestal) {
            State.promptUI.style.display = 'block'; // Mostra "Press [F] to interact"
        } else {
            State.promptUI.style.display = 'none';  // Nasconde il suggerimento
        }
    }
}