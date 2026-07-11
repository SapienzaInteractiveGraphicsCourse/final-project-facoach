import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';


export function updateSolarSystem() {
    const currenttime = Date.now() * 0.001; // time in seconds
    // sun rotates on itself
    if (State.sunMesh) {
        State.sunMesh.rotation.y += 0.0005;

        // flames on sun surface, rotate oround sun
        if (State.solarFlares) {
            State.solarFlares.rotation.y -= 0.0015; 
            State.solarFlares.rotation.x += 0.0008;
        }
    }

    // planets rotation around the sun at different speeds
    if (State.sunPivot1) {
        State.sunPivot1.rotation.y += 0.001; 
    }
    if (State.sunPivot2) {
        State.sunPivot2.rotation.y += 0.0004;
    }
    if (State.sunPivot3) {
        State.sunPivot3.rotation.y += 0.0005; 
    }
    if (State.sunPivot4) {
        State.sunPivot4.rotation.y += 0.0007; 
    }
    if (State.sunPivot5) {
        State.sunPivot5.rotation.y += 0.0003; 
    }
    //binary sistem, planets 5 and 6 orbiting around a common center
    // by having distance and rotation speed variable, it looks like they come closer and faster, and then slower when they are further, simulating physics
    if (State.binaryPivot && State.planet5 && State.planet6) {
        // get a sine function to apply it to rotation and distance of the planets aligned
        const sineWave = Math.sin(1.5 * currenttime); 

        // variable rotation speed around the binary pivot
        State.binaryPivot.rotation.y += Math.max(0.01, 0.05 * sineWave);

        // variable distance based on the sine function, so that when they are closer they rotate faster, and when they are further they rotate slower
        const baseDistance = 15; // average distance 
        const variation = 6;     // how much the distance varies from the base distance    
        // how the distance changes over time, based on the sine wave
        const currentDistance = baseDistance - (variation * sineWave);

        // update position
        State.planet5.position.x = -currentDistance;
        State.planet6.position.x = currentDistance;
    }

    // satellite orbit and its blinking light
    if (State.satellitePivot) {
        State.satellitePivot.rotation.y += 0.02; // orbital velocity
    }
    if (State.satelliteLight) {
        // blink: sine guides the oscillation, max makes the light be off for some time
        const blink = Math.max(0, Math.sin(currenttime * 5));
        State.satelliteLight.intensity = blink * 40;
    }

    // planet axis rotations
    if (State.planet) State.planet.rotation.y += 0.005;
    if (State.planet2) State.planet2.rotation.y += 0.003;
    if (State.planet3) State.planet3.rotation.y += 0.008;
    if (State.planet4) State.planet4.rotation.y += 0.003;
    if (State.planet5) State.planet5.rotation.y += 0.004;
    if (State.planet6) State.planet6.rotation.y += 0.004;

    // planet 2 moon rotation
    if (State.moonPivot) {
        State.moonPivot.rotation.y += 0.015;
    }
}

//comet animation, with kepler physics
export function updateComet() {
    if (State.cometGroup && State.sunMesh && State.cometTail) {
        // Ellipse dimentions (semi-major and semi-minor axes)
        const a = 550; 
        const b = 320;

        // Focus calculation, where sun should be
        const c = Math.sqrt((a * a) - (b * b)); 

        // move ellipse to have sun in the focus, not in the center
        const xLoc = (a * Math.cos(State.cometGroup.userData.theta)) - c;
        const zLoc = b * Math.sin(State.cometGroup.userData.theta);
        State.cometGroup.position.set(xLoc, 0, zLoc);

        // set the comet to look at the sun to have tail opposite to the sun
        State.cometGroup.lookAt(State.sunMesh.position);

        // 5distance from the sun
        const distanceToSun = State.cometGroup.position.length();
    
        // angular speed, inversly proportional to distance
        const orbitSpeed = 20 / distanceToSun;
        
        //tail lenght is inversely proportional to distance from the sun
        State.cometTail.scale.z = 0.4 + 200/distanceToSun;

        // angle increment based on speed
        State.cometGroup.userData.theta += orbitSpeed * 0.02; 
    }

    // comet tail animation
    if (State.cometTail) {
        const tail = State.cometTail;
        
        // time measure
        const time = Date.now() * 0.004; 

        // tail rotation
        tail.rotation.z += 0.1;

        // add wobble to tail
        tail.scale.x = 1.0 + Math.sin(time) * 0.1;
        tail.scale.y = 1.0 + Math.cos(time * 1.2) * 0.1;

    }

}


//black hole animation, every point in the accretion disk has its rotation inversly proportional to distance from the center
export function updateBlackHole() {
    if (State.accretionDisk) {
        // get position array
        const positions = State.accretionDisk.geometry.attributes.position.array;
        
        // cycle every particle
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2]; //i+1 is Y axis, and the disk is only on X and Z
            
            // with pythagora we calculate distance from center
            const r = Math.sqrt(x * x + z * z);
            
            // angular speed increases inversly proportional to distance from center elevated to 1.5
            const speed = 15 / Math.pow(r, 1.5); 
            
            // calculate new position and insert them in the array
            const cos = Math.cos(-speed);
            const sin = Math.sin(-speed);
            
            positions[i] = x * cos - z * sin;
            positions[i + 2] = x * sin + z * cos;
        }
        
        // communicate the new coordinates
        State.accretionDisk.geometry.attributes.position.needsUpdate = true;
    }

}