import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

export function updateMovement(deltaTime){
    // movement
    if (!State.isConsoleScreenOpen) {
        // adapt speed based on frames of the screen
        const baseSpeed = State.keys.shift ? 15.0 : 7.2; 
        const currentSpeed = baseSpeed * deltaTime;
        //move the player based on the key pressed
        if (State.keys.w) State.player.translateZ(-currentSpeed);
        if (State.keys.s) State.player.translateZ(currentSpeed);
        if (State.keys.a) State.player.translateX(-currentSpeed);
        if (State.keys.d) State.player.translateX(currentSpeed);
    }

    // animate arms and legs
    if ((State.keys.w || State.keys.s || State.keys.a || State.keys.d) && !State.isConsoleScreenOpen) {
        const speed = 0.008; //oscillation speed
        const time = Date.now() * speed;
        const amplitude = 0.5; // radiants of how much oscillates

        // using sine function to make oscillations of arms and legs
        if (State.leftArm) State.leftArm.rotation.x = Math.sin(time) * amplitude;
        if (State.rightArm) State.rightArm.rotation.x = -Math.sin(time) * amplitude; // inverted
        if (State.leftLeg) State.leftLeg.rotation.x = -Math.sin(time) * amplitude;
        if (State.rightLeg) State.rightLeg.rotation.x = Math.sin(time) * amplitude; // inverted
    } else {
        // when not moving, go back to default position of arms and legs using linear interpolation (lerp)
        if (State.leftArm) State.leftArm.rotation.x = THREE.MathUtils.lerp(State.leftArm.rotation.x, 0, 0.1);
        if (State.rightArm) State.rightArm.rotation.x = THREE.MathUtils.lerp(State.rightArm.rotation.x, 0, 0.1);
        if (State.leftLeg) State.leftLeg.rotation.x = THREE.MathUtils.lerp(State.leftLeg.rotation.x, 0, 0.1);
        if (State.rightLeg) State.rightLeg.rotation.x = THREE.MathUtils.lerp(State.rightLeg.rotation.x, 0, 0.1);
    }
}

export function updateCameraPosition() {
    // calculate where the camera should be
        const idealPos = new THREE.Vector3(0, State.cameraHeightOffset, State.idealCameraDistance);
        
        // we apply the inclination
        idealPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), State.cameraPitch);
        idealPos.applyQuaternion(State.player.quaternion);
        
        // we find the global coordinates adding the calculated ones relative to the player position
        const playerPos = new THREE.Vector3(State.player.position.x, State.player.position.y + 1.5, State.player.position.z);
        idealPos.add(playerPos);

        // prepare the ray from player to the desired position
        const dir = new THREE.Vector3().subVectors(idealPos, playerPos).normalize();
        const maxDist = playerPos.distanceTo(idealPos);
        
        State.cameraRaycaster.set(playerPos, dir);

        //check if there are position
        const intersects = State.cameraRaycaster.intersectObjects(State.walls, false);

        let finalPos = idealPos;

        if (intersects.length > 0) {
            const hitDist = intersects[0].distance;
            // if there's an obstacle, set the distance to the hit point
            if (hitDist < maxDist) {
                // set position to just before the wall to avoid clipping
                const safeDist = Math.max(State.minCameraDistance, hitDist - 0.2);
                finalPos = new THREE.Vector3().copy(playerPos).add(dir.multiplyScalar(safeDist));
            }
        }

        // smooth update of the position
        State.camera.position.lerp(finalPos, 0.2);

        // set camera to look at the player
        const lookAtPos = new THREE.Vector3(0, 1.5, 0); // Guarda le spalle del robot
        lookAtPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), State.cameraPitch);
        lookAtPos.applyQuaternion(State.player.quaternion);
        lookAtPos.add(State.player.position);
        
        State.camera.lookAt(lookAtPos);
    }