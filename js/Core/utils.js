import * as THREE from 'three';

// global variables
import {State} from './state.js';

// logic for illumination: gets how much intensity is hitting an object from a light source, considering distance, angle and occlusion
export function getIntensityOnObject(lightSource, targetObj) {
    const lightPos = new THREE.Vector3();
    lightSource.getWorldPosition(lightPos);
    const targetPos = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);

    const dist = lightPos.distanceTo(targetPos);
    if (dist > 20) return 0; // if the object is too far, we don't even calculate the intensity

    let intensity = lightSource.intensity / (dist * dist);

    //if the light source is the torch, we need to check if the player is facing the object, and if the object is in the cone of light
    if (lightSource.isSpotLight) {
        const lampDir = new THREE.Vector3(0, 0, -1).applyQuaternion(State.player.quaternion);
        const dirToTarget = new THREE.Vector3().subVectors(targetPos, lightPos).normalize();
        const dot = lampDir.dot(dirToTarget);
        
        if (dot < Math.cos(lightSource.angle)) return 0;
        
        const penumbraMod = Math.pow(
            (dot - Math.cos(lightSource.angle)) / (1 - Math.cos(lightSource.angle)), 
            lightSource.penumbra * 10
        );
        intensity *= penumbraMod;
    }

    //use raycaster to check colllision
    const rayDir = new THREE.Vector3().subVectors(targetPos, lightPos).normalize();
    const raycaster = new THREE.Raycaster(lightPos, rayDir, 0, dist + 0.5);
    
    // to solve lag, we use an array that contains only the solid obstacles (walls and platforms) to check rays
    const ostacoliSolidi = [...State.walls, ...State.platforms, targetObj];
    
    // we use that array to check intersections
    const intersects = raycaster.intersectObjects(ostacoliSolidi, true);

    if (intersects.length > 0 && intersects[0].object !== targetObj && intersects[0].object.parent !== targetObj) {
        return 0; // in this case light is blocked by an obstacle, so we return 0
    }

    return intensity; // we return the light that hits the object
}