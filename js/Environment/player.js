import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// global variables
import {State} from '../Core/state.js';

export function createPlayer(){
    // create the player group and add it to the scene
        State.player = new THREE.Group();
        State.player.position.set(0, 2, 5); 
        State.scene.add(State.player);

        const loader = new GLTFLoader(State.loadingManager);
        // load 3d model
        loader.load('./models/small_robot_corrected2.glb', (gltf) => {
            const model = gltf.scene;
        
            model.scale.set(1, 1, 1); 
        
            //add the model at the base of the group
            model.position.y = 0.7; 
    
            // add shadows to the group
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    // avoids bug for lighting that is not smooth on the model surface
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
    
        // add player torch and glow
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