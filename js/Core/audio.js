import * as THREE from 'three';
import { State } from './state.js';

let listener = null;
let audioLoader = null;

const sounds = {};   // globali (musica, UI)
const positional = {}; // 3D, agganciati a oggetti

export function initAudio(camera, loadingManager) {
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader(loadingManager);
    listener.setMasterVolume(State.masterVolume);
}

export function setMasterVolume(v) {
    if (listener) listener.setMasterVolume(v);
}

// Il browser sospende l'AudioContext finché non c'è un gesto utente
export function resumeContext() {
    if (listener && listener.context.state === 'suspended') {
        listener.context.resume();
    }
}

export function loadGlobal(name, path, { loop = false, volume = 1 } = {}) {
    const s = new THREE.Audio(listener);
    audioLoader.load(path, (buffer) => {
        s.setBuffer(buffer);
        s.setLoop(loop);
        s.setVolume(volume);
    });
    sounds[name] = s;
}

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

export function play(name) {
    const s = sounds[name] || positional[name];
    if (!s || !s.buffer) return;      // non ancora caricato
    if (s.isPlaying) s.stop();        // riavvia: serve per SFX ripetuti
    s.play();
}

export function stop(name) {
    const s = sounds[name] || positional[name];
    if (s && s.isPlaying) s.stop();
}