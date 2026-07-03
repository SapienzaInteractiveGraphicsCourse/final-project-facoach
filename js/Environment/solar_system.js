import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// global variabless
import {State} from '../Core/state.js';

export function addSun(){
    // aggiunge il sole al centro del sistema solare
    
        // place sun far in the space
        const sunPosition = new THREE.Vector3(360, 160, -500);
        State.sunPosition = sunPosition;
    
        // define the sun dimentions and model
        const sunGeo = new THREE.SphereGeometry(25, 32, 32); 
        const sunMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,           
            emissive: 0xff5500,        
            emissiveIntensity: 2.5,    
            wireframe: false,
            fog: false // Immune alla nebbia
        });
        State.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        State.sunMesh.position.copy(sunPosition);
        State.scene.add(State.sunMesh);
    
        // sun pointlight
        State.sunPointLight = new THREE.PointLight(0xffaa00, 2.0, 1200); // set up intensity and distance of light
        State.sunPointLight.castShadow = true;
        State.sunPointLight.shadow.mapSize.width = 2048; 
        State.sunPointLight.shadow.mapSize.height = 2048;
        State.sunPointLight.shadow.bias = -0.0001; 
        State.sunPointLight.shadow.normalBias = 0.002; 
        State.sunMesh.add(State.sunPointLight);
    
        // pivots for the planets
        State.sunPivot1 = new THREE.Group();
        State.sunPivot1.position.copy(sunPosition);
        State.scene.add(State.sunPivot1);
    
        State.sunPivot2 = new THREE.Group();
        State.sunPivot2.position.copy(sunPosition);
        State.scene.add(State.sunPivot2);
    
        State.sunPivot3 = new THREE.Group();
        State.sunPivot3.position.copy(sunPosition);
        State.scene.add(State.sunPivot3);
    
        State.sunPivot4 = new THREE.Group();
        State.sunPivot4.position.copy(sunPosition);
        State.scene.add(State.sunPivot4);
    
        State.sunPivot5 = new THREE.Group();
        State.sunPivot5.position.copy(sunPosition);
        State.scene.add(State.sunPivot5);
    
        State.binaryPivot = new THREE.Group();
        State.binaryPivot.position.set(260, 70, -400);
        State.scene.add(State.binaryPivot);
    
        // solar flares (small particles animated to make sun alive)
        const flareGeo = new THREE.BufferGeometry();
        const flareCount = 600; //how many points
        const flarePositions = new Float32Array(flareCount * 3);
    
        for(let i = 0; i < flareCount * 3; i += 3) {
            // math to distribute particles on surface
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
        
            // casual distance from center
            const r = 22.5 + Math.random() * 4; 
    
            flarePositions[i] = r * Math.sin(phi) * Math.cos(theta);     // X axis
            flarePositions[i+1] = r * Math.sin(phi) * Math.sin(theta);   // Y axis
            flarePositions[i+2] = r * Math.cos(phi);                     // Z axis
        }
    
        flareGeo.setAttribute('position', new THREE.BufferAttribute(flarePositions, 3));
        const flareMat = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.8,                
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            fog: false
        });
        State.solarFlares = new THREE.Points(flareGeo, flareMat);
        State.sunMesh.add(State.solarFlares); // add pareticles to sun group
    
}

//load planets models and place them in the scene
export function addPlanets(){

    const loader = new GLTFLoader(State.loadingManager);

    //planet with moon
    loader.load('./models/Planet2.glb', (gltf) => {
        State.planet2 = gltf.scene;
        State.planet2.scale.set(5, 5, 5);
        State.planet2.castShadow = true;
        State.planet2.receiveShadow = true;

        // how distant from the sun
        State.planet2.position.set(300, -20, -20);
    
        // lock the planet to its pivot
        State.sunPivot2.add(State.planet2);

        // loading of the moon
        loader.load('./models/moon.glb', (gltf) => {
            State.moon = gltf.scene;
            State.moon.scale.set(0.5, 0.5, 0.5);
            State.moon.castShadow = true;
            State.moon.receiveShadow = true;

            // create the pivot for the moon
            State.moonPivot = new THREE.Group();
        
            // place the pivot on the local 0 0 0, that is the planet
            State.moonPivot.position.set(0, 0, 0); 
        
            // place the moon distant from the planet
            State.moon.position.set(2, 0, 0); 
        
            State.moonPivot.add(State.moon);
        
            // add the pivot to the planet
            State.planet2.add(State.moonPivot); 
        });
    });

    //planet standard
    loader.load('./models/Planet.glb', (gltf) => {
        State.planet = gltf.scene;
        State.planet.scale.set(4, 4, 4); 
        // place the planet
        State.planet.position.set(-300, -40, 60);
        // make model project shadows
        State.planet.castShadow = true;
        State.planet.receiveShadow = true;

        //axis inclination
        State.planet.rotation.z = 0.41;
        State.sunPivot1.add(State.planet);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    //load fractured planet
    loader.load('./models/Planet3.glb', (gltf) => {
        State.planet3 = gltf.scene;
        State.planet3.scale.set(2, 2, 2); 
        // place planet
        State.planet3.position.set(-300, 20, 100);
        // add shadows
        State.planet3.castShadow = true;
        State.planet3.receiveShadow = true;

        // add purpple light inside
        const coreLight = new THREE.PointLight(0x9900ff, 15, 40); 
        coreLight.position.set(0, 0, 0); 
        coreLight.castShadow = true; 
        coreLight.shadow.bias = -0.002; 
        // add light to planet
        State.planet3.add(coreLight);
        //add planet to ppivot
        State.sunPivot3.add(State.planet3);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    //add ringed planet
    loader.load('./models/Planet4.glb', (gltf) => {
        State.planet4 = gltf.scene;
        State.planet4.scale.set(5, 5, 5); 
        // pllace the planet
        State.planet4.position.set(200, 0, 80);
        // add shadows
        State.planet4.castShadow = true;
        State.planet4.receiveShadow = true;

        //axis inclination and adding to pivot
        State.planet4.rotation.z = 0.41;
        State.sunPivot4.add(State.planet4);

        console.log("Modello caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });

    //planet 5 and 6 are the binary
    loader.load('./models/Planet5.glb', (gltf) => {
        // load model
        State.planet5 = gltf.scene;

        State.planet5.scale.set(4, 4, 4); 
        
        // place the planet specular to the other one
        State.planet5.position.set(-15, 0, 0); 
        
        // add shadow
        State.planet5.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        

        // Add common pivot to the sun pivot
        State.sunPivot5.add(State.binaryPivot);

        // Add to pivot common with the other planet
        State.binaryPivot.add(State.planet5);

        console.log("Sistema binario caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello binario:", error);
    });

    loader.load('./models/Planet6.glb', (gltf) => {
        // load planet 6
        State.planet6 = gltf.scene;
        //set scale and position
        State.planet6.scale.set(4, 4, 4);
        State.planet6.position.set(15, 0, 0); 
        //shadows
        State.planet6.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        //add planet to pivot shared
        State.binaryPivot.add(State.planet6);

        console.log("Sistema binario caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello binario:", error);
    });


}

//comet loading
export function addComet(){

        const loader = new GLTFLoader(State.loadingManager);
        // main group, placed centered in the sun, regarding the orbit
        State.cometOrbitGroup = new THREE.Group();
        State.cometOrbitGroup.position.copy(State.sunPosition); 
    
        // inclination of the orbit
        State.cometOrbitGroup.rotation.x = 0.7; // Inclinazione trasversale
        State.cometOrbitGroup.rotation.z = 0.3; // Inclinazione longitudinale
        State.scene.add(State.cometOrbitGroup);
    
        // local group of comet model and tail
        State.cometGroup = new THREE.Group();
        State.cometGroup.userData = { theta: 0 }; //initial angle of the orbit, theta
        State.cometOrbitGroup.add(State.cometGroup);
    
        // model of the comet, loading
        loader.load('./models/Comet.glb', (gltf) => {
            const model = gltf.scene;
        
            model.scale.set(1.5, 1.5, 1.5); 
    
            // add shadows
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            //adding to the group
            model.rotation.y = Math.PI;
            State.cometGroup.add(model);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        // tail made of particle
        const CometparticleCount = 1500; // number of particle
        const tailLength = 45;      // how long is the tail standard
        
        const tailGeo = new THREE.BufferGeometry();
        const tailPositions = new Float32Array(CometparticleCount * 3);
        const tailColors = new Float32Array(CometparticleCount * 3);
    
        // tail color
        const colorHead = new THREE.Color(0xe6ffff); 
        const colorTail = new THREE.Color(0x0022cc);
    
        for (let i = 0; i < CometparticleCount; i++) {
            // grows dimention when further from comet, creating the cone shape
            const z = Math.random() * tailLength;
            const spread = (z / tailLength) * 5; 
            
            //physically places particles randomply in the tail shape, more dense in the center
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 2) * spread;
    
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
    
            const i3 = i * 3;
            tailPositions[i3] = x;
            tailPositions[i3 + 1] = y;
            tailPositions[i3 + 2] = z;
    
            // make color gradient for the tail
            const mixedColor = colorHead.clone();
            mixedColor.lerp(colorTail, z / tailLength);
            
            tailColors[i3] = mixedColor.r;
            tailColors[i3 + 1] = mixedColor.g;
            tailColors[i3 + 2] = mixedColor.b;
        }
        
        //add everything to the tail
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
        tailGeo.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
        tailGeo.rotateX(Math.PI );
    
        const tailMat = new THREE.PointsMaterial({
            size: 0.5,                  
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending, 
            depthWrite: false,          
            fog: false
        });
    
        State.cometTail = new THREE.Points(tailGeo, tailMat);
        
        // make tail intersect a bit with comet model
        State.cometTail.position.z = 1.0; 
        
        //add tail to group
        State.cometGroup.add(State.cometTail);
}