import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function createPlayer(){
    // --- PLAYER (Posizionato sopra il nuovo pavimento) ---
        State.player = new THREE.Group();
        State.player.position.set(0, 2, 5); 
        State.scene.add(State.player);

        const loader = new GLTFLoader(State.loadingManager);
        // Caricamento Modello 3D
        loader.load('./models/small_robot_corrected2.glb', (gltf) => {
            const model = gltf.scene;
        
            // Configurazione Modello
            model.scale.set(1, 1, 1); 
        
            // Posizioniamo i piedi del modello alla base del gruppo (y=0 del gruppo)
            model.position.y = 0.7; 
    
            // Rendiamo il modello capace di proiettare ombre
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    // Rende le superfici lisce eliminando l'effetto "a quadratini"
                    node.geometry.computeVertexNormals();
    
                    if (node.name.includes("arm_l")) {
                        State.leftArm = node;
                    }
                    if (node.name.includes("arm_r")) {
                        State.rightArm = node;
                    }
                    if (node.name.includes("leg_l")) {
                        State.leftLeg = node;
                    }
                    if (node.name.includes("leg_r")) {
                        State.rightLeg = node;
                    }
                        
                }
            });
            model.rotation.y = Math.PI;
            State.player.add(model);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
        State.scene.add(State.camera);
        State.camera.position.set(0, 2, 5);
    
        // ... Torcia e Glow rimangono invariati ...
        State.playerLamp = new THREE.SpotLight(0xffffff, 0, 30, Math.PI / 4, 0.3, 2);
        State.playerLamp.position.set(0, 0.5, -0.5);
        State.playerLamp.castShadow = true;
        State.playerLamp.shadow.bias = -0.005; // Fondamentale per eliminare le righe nere
        State.playerLamp.shadow.mapSize.width = 1024; // Opzionale: migliora la qualità
        State.playerLamp.shadow.mapSize.height = 1024;
        State.player.add(State.playerLamp);
        const lampTarget = new THREE.Object3D();
        lampTarget.position.set(0, 0.5, -5);
        State.player.add(lampTarget);
        State.playerLamp.target = lampTarget;
        State.playerGlow = new THREE.PointLight(0xffffff, 0, 4, 2);
        State.playerGlow.position.set(0, -0.5, 0);
        State.player.add(State.playerGlow);
    
}