import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';

//animates objects outside the main room
export function updateSpaceProps() {
    //flicker of stars
    const currenttime = Date.now() * 0.001; // Tempo in secondi
    if (State.starMaterial) {
        // the material pulses/oscillates intensity
        State.starMaterial.opacity = 0.85 + Math.sin(currenttime * 3) * 0.4;
    }

    //galaxy rotation
    State.galaxies.forEach(galaxy => {
        galaxy.rotation.y += 0.0004;
    });

    //centrifuge rotation
    if (State.spoke1 && State.spoke2){
        State.spoke1.rotation.x += 0.02;
        State.spoke2.rotation.x += 0.02;
    }

}

//animates things inside the main room
export function updateRoomProps() {

    // exclamation point animation
    if (State.consoleIndicator) {
        State.consoleIndicator.position.y = 3.5 + Math.sin(Date.now() * 0.004) * 0.15;
    }

    // Reactor pedestal animation
    if (State.reactorPedestal && State.reactorPedestal.userData.warpRing) {
        //the ring rotates and wobbles
        State.reactorPedestal.userData.warpRing.rotation.z += 0.01;
        State.reactorPedestal.userData.warpRing.position.y = 1.0 + Math.sin(Date.now() * 0.002) * 0.1;
    }

    // console screens animation
    if (State.animatedScreens.length > 0) {
    
        State.animatedScreens.forEach(screenData => {
            const { ctx, canvas, texture } = screenData;
        
            // background
            ctx.fillStyle = '#051024'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00e5ff';
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;

            // sets up a grid
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            ctx.beginPath();
            ctx.moveTo(20, 100);
            ctx.lineTo(canvas.width - 20, 100);
            ctx.stroke();

            // text set up
            ctx.font = '24px monospace';
            screenData.offsetY = (screenData.offsetY + 2) % (canvas.height - 100); //moving speed

            for (let i = 0; i < 15; i++) {
                // random text
                let fakeData = Math.random().toString(16).substring(2, 12).toUpperCase();
                let y = 140 + ((screenData.offsetY + i * 40) % (canvas.height - 120));
            
                // fadeout effect of old text
                ctx.globalAlpha = 1.0 - (y / canvas.height);
                ctx.fillText(`SYS_CHK_${i}: [${fakeData}]`, 40, y);
            }
            ctx.globalAlpha = 1.0;

            // communicates to update text on screen
            texture.needsUpdate = true;
        });
    }

    // mainframe leds
    if (State.serverLEDs.length > 0) {
        const tempo = Date.now() * 0.005; // update speed
        
        State.serverLEDs.forEach(ledData => {
            // ssine function to update lights
            const intensity = Math.sin(tempo * ledData.blinkRate + ledData.timeOffset);
            
            // based on a threshold, the function decide if a led has to be lit up or down
            if (intensity > 0.5) {
                ledData.material.color.setHex(ledData.baseColor); //on
            } else {
                ledData.material.color.setHex(0x111111); // off
            }
        });
    }

    // energy pipes
    if (State.activePipes.length > 0) {
        const flowSpeed = 0.02; // speed of the texture
        
        State.activePipes.forEach(texture => {
            texture.offset.y -= flowSpeed; //move texture
        });
    }

    //holo system rotation
    if (State.holoSystem) {
        State.holoSystem.rotation.y += 0.01;
    }

    // radar animation blip
    if (State.radarBlip) {
        State.blipTimer += 0.04; // blip speed

        // sine function make the blip appear and then disappear deciding its intensity
        const opacityValue = Math.max(0, Math.sin(State.blipTimer));
        State.radarBlip.material.opacity = opacityValue;

        // after a full oscillation, the blip has to be reset
        if (State.blipTimer >= Math.PI * 2) {
            State.blipTimer = 0; // reset cycle timer

            // generate new position
            const randomAngle = Math.random() * Math.PI * 2;
            const randomRadius = Math.random() * 1.6; 

            // calculate new coordinate
            State.radarBlip.position.x = Math.cos(randomAngle) * randomRadius;
            State.radarBlip.position.y = Math.sin(randomAngle) * randomRadius;
        }
    }

}