import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import {setupEventListeners} from './Core/controls.js';
import {createWorld} from './Environment/world.js';
import {animate} from './Animations/animation.js';
import { initAudio, loadGlobal } from './Core/audio.js';

// global variables
import {State} from './Core/state.js';


// Init function: sets up everything and manages the loading screen
function init() {
    State.scene = new THREE.Scene();
    State.scene.background = new THREE.Color(0x020205);

    // gets HTML elements for the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');

    // Loading manager initialization
    State.loadingManager = new THREE.LoadingManager();

    // this activates every time a file is loaded, advancing the progress
    State.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        // Calcoliamo la percentuale di caricamento
        const percentage = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = percentage + '%';
        
        // take only the file name from the file for display
        const fileName = url.split('/').pop();
        loadingText.innerText = `Loaded: ${fileName} (${itemsLoaded}/${itemsTotal})`;
    };

    // this starts when all files are loaded, so we can hide the loading screen
    State.loadingManager.onLoad = function () {
        console.log("Tutti gli asset sono caricati");
        loadingText.innerText = "Systems ready. Activating...";
        
        // looading screen disappears with fade-out
        loadingScreen.classList.add('fade-out');
        
        // after the fade, we remove the loading screen from the DOM
        setTimeout(() => {
            loadingScreen.remove();
        }, 800);
    };

    // error management
    State.loadingManager.onError = function (url) {
        console.error('Error loading: ' + url);
    };

    // passing the manager to loader
    State.textureLoader = new THREE.TextureLoader(State.loadingManager);

    State.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    State.renderer = new THREE.WebGLRenderer({ antialias: true });
    State.renderer.setSize(window.innerWidth, window.innerHeight);
    State.renderer.shadowMap.enabled = true; 
    State.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    document.body.appendChild(State.renderer.domElement);

    //audio
    initAudio(State.camera, State.loadingManager);

    loadGlobal('ambient', './audio/music/ambient_loop.mp3', { loop: true, volume: 0.35 });
    loadGlobal('button', './audio/sfx/button.mp3', { volume: 0.9 });
    loadGlobal('lamp', './audio/sfx/torchlight.mp3', { volume: 0.9 });
    loadGlobal('pickup', './audio/sfx/pickup.mp3', { volume: 0.8 });
    loadGlobal('place', './audio/sfx/pickup.mp3', { volume: 0.8 });
    loadGlobal('victory', './audio/sfx/victory.mp3', { volume: 0.5 });
    loadGlobal('door', './audio/sfx/door.mp3', { volume: 2 });
    loadGlobal('footstep', './audio/sfx/footstep.mp3', { volume: 0.8 });
    loadGlobal('respawn', './audio/sfx/fail.mp3', { volume: 0.3 });


    createLights();
    createWorld(); //calls all of the objects loading, that will be waited during the loading
    setupEventListeners();
    
    animate();
}


// ambient lights
function createLights() {
    // low global light to avoid total darkness in shadows
    const ambient = new THREE.AmbientLight(0xffffff, 0.1); 
    State.scene.add(ambient);

    // we keep sunlight only as lunar light without shadows to avoid confusion
    State.sunLight = new THREE.DirectionalLight(0x4444ff, 0.1); 
    State.sunLight.position.set(10, 20, 10);
    State.sunLight.castShadow = false;
    State.scene.add(State.sunLight);
}



// start
init();