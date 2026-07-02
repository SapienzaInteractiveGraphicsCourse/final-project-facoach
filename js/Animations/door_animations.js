import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

//open door
export function openSciFiDoor() {
    if (State.isDoorOpen) return; // door is already open, don't do anything
    State.isDoorOpen = true;

    // set original position to make it go back
    if (State.doorOriginalY === null) State.doorOriginalY = State.door.position.y;

    // tween animation to open
    new TWEEN.Tween(State.door.position)
        .to({ y: State.doorOriginalY + 8 }, 1200)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // remove temporarly collitions
    const doorIndex = State.walls.indexOf(State.door);
    if (doorIndex > -1) {
        State.walls.splice(doorIndex, 1);
    }

    // timer before closing
    setTimeout(() => {
        closeSciFiDoor();
    }, 8000); 
}

//close door
export function closeSciFiDoor() {
    // tween animation to close
    new TWEEN.Tween(State.door.position)
        .to({ y: State.doorOriginalY }, 1200)
        .easing(TWEEN.Easing.Cubic.In)
        .onComplete(() => {
            //when animation is done, door can be opened again
            State.isDoorOpen = false; 
            
            // set collisions again
            if (!State.walls.includes(State.door)) {
                State.walls.push(State.door);
            }
        })
        .start();
}