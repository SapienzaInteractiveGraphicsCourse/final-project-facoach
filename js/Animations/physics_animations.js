import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';
import { play } from '../Core/audio.js';

//control if there should be collitions
export function checkCollisions(oldPos) {
    let onObject = false; 

    //check for every platform
    State.platforms.forEach(plat => {
        if (plat.userData.active === false) return;

        // moving platforms animation
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

        //dimentions of the platforms for coordinates on where to stop
        const dX = Math.abs(State.player.position.x - plat.position.x);
        const dZ = Math.abs(State.player.position.z - plat.position.z);
        const halfW = plat.geometry.parameters.width / 2 + 0.4;
        const halfD = plat.geometry.parameters.depth / 2 + 0.4;

        if (dX < halfW && dZ < halfD) {
            const pHeight = plat.geometry.parameters.height / 2;
            const topLevel = plat.position.y + pHeight + 0.5; 
            const bottomLevel = plat.position.y - pHeight - 0.5;

            //stop player from falling (velocityY=0) if it's on a platform coordinates
            if (State.player.position.y <= topLevel && State.player.position.y > plat.position.y && State.velocityY <= 0) {
                State.player.position.y = topLevel;
                State.velocityY = 0;
                onObject = true;
                //move the player with the platform if it's a moving one
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

    // specific collition for the disk (it's not a platform
    //disk parameters
    const dX = State.player.position.x - State.floorDisk.position.x;
    const dZ = State.player.position.z - State.floorDisk.position.z;
    const distance = Math.sqrt(dX * dX + dZ * dZ);

    const radius = 34;
    const pHeight = 1;
    const topLevel = State.floorDisk.position.y + pHeight + 0.5;

    // check like the platforms if the coordinates of player are on top of the disk, and in that case set falling to 0
    if (distance < radius) {
        if (State.player.position.y <= topLevel && State.player.position.y > State.floorDisk.position.y && State.velocityY <= 0) {
            State.player.position.y = topLevel;
            State.velocityY = 0;
            onObject = true; //player is on disk
        }
    }

    // gravity set
    if (onObject) {
        State.isJumping = false;
        State.velocityY = 0;
    }   

    // wall collisions
    State.walls.forEach(wall => {
        const dX = Math.abs(State.player.position.x - wall.position.x);
        const dZ = Math.abs(State.player.position.z - wall.position.z);

        const halfW = wall.geometry.parameters.width / 2 + 0.4;
        const halfD = wall.geometry.parameters.depth / 2 + 0.4;
        const h = wall.geometry.parameters.height / 2;

        // if coordinates are on the borders of the walls, don't let the player coordinates to be updated by WASD
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
    // vertical updates for gravity
    State.velocityY += State.gravity;
    State.player.position.y += State.velocityY;

    // Reset position if fall to black hole
    if (State.player.position.y < -30) {
        State.player.position.set(0, 5, 5);
        State.velocityY = 0;

        //respawn message
        const msg = document.getElementById('respawn-message');
        if (!msg) return;

        // remove and reapply the classs to allow multiple falls and always have the message
        msg.classList.remove('show');
        void msg.offsetWidth;   // without this, browsseer doesn't reproduce the message multiple times
        msg.classList.add('show');

        //respawn audio
        play('respawn');
    }
}