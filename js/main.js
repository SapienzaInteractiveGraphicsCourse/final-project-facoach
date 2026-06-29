import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import {setupEventListeners} from './Core/controls.js';
import {createWorld} from './Environment/world.js';
import {animate} from './Animations/animation.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from './Core/state.js';


// Funzione Init
function init() {
    State.scene = new THREE.Scene();
    State.scene.background = new THREE.Color(0x020205);

    // 1. PRENDIAMO GLI ELEMENTI HTML DELLA SCHERMATA
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');

    // 2. INIZIALIZZIAMO IL LOADING MANAGER
    State.loadingManager = new THREE.LoadingManager();

    // Questo si attiva ogni volta che un singolo file (texture o modello) finisce di scaricarsi
    State.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        // Calcoliamo la percentuale di caricamento
        const percentage = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = percentage + '%';
        
        // Estraiamo solo il nome del file dal path per mostrarlo a schermo
        const fileName = url.split('/').pop();
        loadingText.innerText = `Loaded: ${fileName} (${itemsLoaded}/${itemsTotal})`;
    };

    // Questo si attiva SOLO quando TUTTI i file in coda sono stati caricati con successo
    State.loadingManager.onLoad = function () {
        console.log("Tutti gli asset sono caricati");
        loadingText.innerText = "Systems ready. Activating...";
        
        // Facciamo sparire la schermata con l'effetto CSS fade-out
        loadingScreen.classList.add('fade-out');
        
        // Opzionale: dopo 800ms (tempo del fade) rimuoviamo l'elemento dal DOM per pulizia
        setTimeout(() => {
            loadingScreen.remove();
        }, 800);
    };

    // Gestione di eventuali errori di file mancanti
    State.loadingManager.onError = function (url) {
        console.error('Error loading: ' + url);
    };

    // 3. PASSIAMO IL MANAGER AI LOADER (Importante!)
    // Inizializziamo il TextureLoader passandogli il nostro manager
    State.textureLoader = new THREE.TextureLoader(State.loadingManager);

    State.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    State.renderer = new THREE.WebGLRenderer({ antialias: true });
    State.renderer.setSize(window.innerWidth, window.innerHeight);
    State.renderer.shadowMap.enabled = true; 
    State.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    document.body.appendChild(State.renderer.domElement);

    createLights();
    createWorld(); // Questa funzione a sua volta chiamerà il caricamento dei modelli
    setupEventListeners();
    
    animate();
}


// --- 2. LUCI E OMBRE DINAMICHE (Project 4) ---
function createLights() {
    // Luce ambientale minima per vedere i contorni
    const ambient = new THREE.AmbientLight(0xffffff, 0.1); 
    State.scene.add(ambient);

    // Sole: lo teniamo solo come "luce lunare" senza ombre per non creare confusione
    State.sunLight = new THREE.DirectionalLight(0x4444ff, 0.1); 
    State.sunLight.position.set(10, 20, 10);
    State.sunLight.castShadow = false; // DISABILITA OMBRE SOLE
    State.scene.add(State.sunLight);
}



// Avvio del progetto
init();