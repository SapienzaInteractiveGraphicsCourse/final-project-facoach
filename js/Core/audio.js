import * as THREE from 'three';
import { State } from './state.js';

let listener = null;
let audioLoader = null;

const sounds = {};   // globals
const positional = {}; // 3D for spacial audios

export function initAudio(camera, loadingManager) {
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader(loadingManager);
    listener.setMasterVolume(State.masterVolume);
}

//adjust volume globally (every sound)
export function setMasterVolume(v) {
    if (listener) listener.setMasterVolume(v);
}

// browser stops audiocontext until first user interaction to avoid initializaton problems
export function resumeContext() {
    if (listener && listener.context.state === 'suspended') {
        listener.context.resume();
    }
}

//gets all audios
export function loadGlobal(name, path, { loop = false, volume = 1 } = {}) {
    const s = new THREE.Audio(listener);
    audioLoader.load(path, (buffer) => {
        s.setBuffer(buffer);
        s.setLoop(loop);
        s.setVolume(volume);
    });
    sounds[name] = s;
}

//sets a positional audio
export function loadPositional(name, path, target, { loop = false, volume = 1, refDistance = 5 } = {}) {
    const s = new THREE.PositionalAudio(listener);
    audioLoader.load(path, (buffer) => {
        s.setBuffer(buffer);
        s.setLoop(loop);
        s.setVolume(volume);
        s.setRefDistance(refDistance);
    });
    target.add(s);
    positional[name] = s;
}

//start an audio
export function play(name) {
    const s = sounds[name] || positional[name];
    if (!s || !s.buffer) return;      // non ancora caricato
    if (s.isPlaying) s.stop();        // riavvia: serve per SFX ripetuti
    s.play();
}


//stops an audio
export function stop(name) {
    const s = sounds[name] || positional[name];
    if (s && s.isPlaying) s.stop();
}