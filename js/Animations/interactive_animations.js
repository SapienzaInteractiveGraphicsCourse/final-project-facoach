import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

import {getIntensityOnObject} from '../Core/utils.js';
import {openSciFiDoor, closeSciFiDoor} from './door_animations.js';

// --- AGGIORNAMENTO STATI ---
export function updateSensors() {
    //oscillazione sensori
    const currenttime = Date.now() * 0.001; // Tempo in secondi
    if (State.crystal1) State.crystal1.position.y = 2 + Math.sin(currenttime) * 17;
    if (State.crystal2) State.crystal2.position.y = 2 + Math.sin(currenttime) * 17;

    State.sensors.forEach(sensor => {
        const crystal = sensor.getObjectByName("Crystal");
        if (!crystal) return;

        // PASSIAMO IL CRYSTAL, NON IL SENSOR
        const i1 = State.isLampOn ? getIntensityOnObject(State.playerLamp, crystal) : 0;
        const i2 = State.isLightOn ? getIntensityOnObject(State.interactLight, crystal) : 0;
        
        if (i1 + i2 > 0.1) {
            sensor.userData.activated = true;
        } else {
            sensor.userData.activated = false;
        }

        if (sensor.userData.activated) {
            crystal.rotation.y += 0.04;
        }
    });
    if (State.sensors[0].userData.activated === true && State.sensors[1].userData.activated === true && !State.isDoorOpen) {
        openSciFiDoor();
    }
}

export function updateSpecialPlatforms() {

    State.platforms.forEach(plat => {
        //oscillazione piattaforme
        const currenttime = Date.now() * 0.001; // Tempo in secondi
        if (plat && plat.userData.wobble) {
            plat.position.y += Math.sin(currenttime + plat.userData.id) * 0.005; // Oscillazione verticale leggera
        }

        //piattaforme speciali on o off in base alla luce
        if (plat.userData.type === 'normal') return;

        const i1 = State.isLampOn ? getIntensityOnObject(State.playerLamp, plat) : 0;
        const i2 = State.isLightOn ? getIntensityOnObject(State.interactLight, plat) : 0;
        const i3 = State.isLampOn ? getIntensityOnObject(State.playerGlow, plat) : 0;
        const isHitByLight = (i1 + i2 + i3) > 0.07;

        if (plat.userData.type === 'shadow') {
            plat.visible = !isHitByLight;
            plat.userData.active = !isHitByLight;
            if (!isHitByLight) plat.material.emissiveIntensity = 1.0;
        } 
        else if (plat.userData.type === 'light-only') {
            plat.visible = isHitByLight;
            plat.userData.active = isHitByLight;
            plat.material.opacity = isHitByLight ? 1.0 : 0;
        }
    });
}