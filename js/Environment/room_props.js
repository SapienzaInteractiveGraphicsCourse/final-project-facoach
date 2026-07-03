import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// global variables
import {State} from '../Core/state.js';

//add buttons and interactive light to the scene
export function loadButtons() {
    const loader = new GLTFLoader(State.loadingManager);
        //button model loading
        loader.load('./models/scifi_button.glb', (gltf) => {
            State.buttonSwitch = gltf.scene;
        
            // model configuration
            State.buttonSwitch.scale.set(1, 1, 1); 
    
            // shadows
            State.buttonSwitch.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            //get the button model to animate it later
            State.movingButton = State.buttonSwitch.getObjectByName('button');
    
            if (State.movingButton) {
                // Salviamo la posizione locale iniziale (sarà il nostro punto di partenza e ritorno)
                State.buttonInitialPos = State.movingButton.position.clone();
            }
    
            State.buttonSwitch.rotation.y = Math.PI/2;
            State.buttonSwitch.position.set(-19, 0.25, 14);

            // hitbox
            const hitboxGeo = new THREE.BoxGeometry(1, 2, 1);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
            // place hitbox o button model
            hitbox.position.set(State.buttonSwitch.position.x, State.buttonSwitch.position.y, State.buttonSwitch.position.z);
            State.walls.push(hitbox); // collision for hitbox
            State.scene.add(hitbox);

            State.scene.add(State.buttonSwitch);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        //button 2, exxactly like the first one
        loader.load('./models/scifi_button.glb', (gltf) => {
            State.buttonSwitch2 = gltf.scene;
        
            // model config
            State.buttonSwitch2.scale.set(1, 1, 1); 
    
            // shadows
            State.buttonSwitch2.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            State.movingButton2 = State.buttonSwitch2.getObjectByName('button');
    
            if (State.movingButton2) {
                State.buttonInitialPos2 = State.movingButton2.position.clone();
            }
    
            State.buttonSwitch2.rotation.y = Math.PI;
            State.buttonSwitch2.position.set(8, 0, -22);
            State.scene.add(State.buttonSwitch2);

            // hitbox
            const hitboxGeo = new THREE.BoxGeometry(1, 2, 1);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);

            hitbox.position.set(State.buttonSwitch2.position.x, State.buttonSwitch2.position.ye, State.buttonSwitch2.position.z);
            State.walls.push(hitbox);
            State.scene.add(hitbox);

            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        //light to be lit up by the button 1
        State.interactLight = new THREE.PointLight(0xffaa00, 0, 15, 2);
        State.interactLight.position.set(-18, 5.5, -10);
        State.interactLight.castShadow = true;
        State.interactLight.shadow.bias = -0.005; //to avoid bugs with lighting
        State.interactLight.shadow.mapSize.width = 1024;
        State.interactLight.shadow.mapSize.height = 1024;
        State.scene.add(State.interactLight);
        
        //load alarm light model, activated by the button
        loader.load('./models/scifi_prop_-_alert_lamp.glb', (gltf) => {
            State.luce = gltf.scene;
        
            // model config
            State.luce.scale.set(2, 2, 2); 
    
            //shasows
            State.luce.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            State.luce.rotation.y = Math.PI /2;
            State.luce.position.set(-19.5, 5.5, -10);
            State.scene.add(State.luce);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    }

//insert light sensors
export function loadLightSensors() {
    const loader = new GLTFLoader(State.loadingManager);
        loader.load('./models/Untitled.glb', (gltf) => {
            State.s1 = gltf.scene;
        
            //model coonfig
            State.s1.scale.set(0.01,0.01,0.01);  
    
            // shadows
            State.s1.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            //take the crystal model in particular, not its base
            const crystal = State.s1.getObjectByName("Crystal");
            State.crystal1 = crystal;
    
            // texture and material
            const crystalTex = State.textureLoader.load('./textures/crystal.png');
    
            crystal.material = new THREE.MeshStandardMaterial({
                map: crystalTex,            
                emissiveMap: crystalTex,
                color: 0xffffff,           // base coolor
                emissive: 0x00ffff,        // emittion color
                emissiveIntensity: 0.7,    // how much it emit
                metalness: 0.5,            // reflective
                roughness: 0.2,            
                opacity: 0.9
            });
    
            if (crystal) {
                // add detailss to crystal surface
                const edges = new THREE.EdgesGeometry(crystal.geometry);
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: 0x004444, 
                    linewidth: 2     
                });
                const wireframe = new THREE.LineSegments(edges, lineMat);
            
                // add borders to crystal
                crystal.add(wireframe);
    
    
            }
    
            State.s1.rotation.y = -Math.PI/2; 
            State.s1.position.set(18, 1, -10);
            State.s1.userData = { activated: false };
            State.sensors.push(State.s1);

            //add to the scene
            State.scene.add(State.s1);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
    
        //ssecond crystal, exactly like the first one
        loader.load('./models/Untitled.glb', (gltf) => {
            State.s2 = gltf.scene;
        
            // model config
            State.s2.scale.set(0.01,0.01,0.01); 
    
            // shadows
            State.s2.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            const crystal = State.s2.getObjectByName("Crystal");
            State.crystal2 = crystal;
    
            // texture
            const crystalTex = State.textureLoader.load('./textures/crystal.png');
    
            crystal.material = new THREE.MeshStandardMaterial({
                map: crystalTex,            
                emissiveMap: crystalTex,
                color: 0xffffff,           
                emissive: 0x00ffff,        
                emissiveIntensity: 0.7,    
                metalness: 0.5,            
                roughness: 0.2,      
                opacity: 0.9
            });
            
            if (crystal) {
                // add detailss at borders
                const edges = new THREE.EdgesGeometry(crystal.geometry);
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: 0x004444, 
                    linewidth: 2     
                });
                const wireframe = new THREE.LineSegments(edges, lineMat);
            
                // add borders to crystal
                crystal.add(wireframe);
    
            }
    
            State.s2.rotation.y = Math.PI /2; 
            State.s2.position.set(-18, 1, -10);
            State.s2.userData = { activated: false };
            State.sensors.push(State.s2);

            //add crystal to scene
            State.scene.add(State.s2);
            console.log("Modello caricato correttamente");
        }, undefined, (error) => {
            console.error("Errore nel caricamento del modello:", error);
        });
}

//add reactor to the scene
export function loadReactor() {

    const loader = new GLTFLoader(State.loadingManager);
    //reattore model
    loader.load('./models/Reactor.glb', (gltf) => {
        State.ReactorGroup = new THREE.Group();
        State.ReactorGroup.position.set(-47, 5.5, -115);
        State.ReactorModel = gltf.scene;
        
        // model config
        State.ReactorModel.scale.set(0.1, 0.1, 0.1); 
    
        // shadows
        State.ReactorModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
    
        //add model to the scene
        State.ReactorModel.rotation.y = Math.PI;
        State.ReactorGroup.add(State.ReactorModel);
        State.scene.add(State.ReactorGroup);
        console.log("Modello reattore caricato correttamente");
    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello:", error);
    });
}

//add a cable to show the player that the button activate the light
export function createSciFiCable(pointsArray) {
    // at least 2 pointss to make a line
    if (!pointsArray || pointsArray.length < 2) {
        console.warn("createSciFiCable: Servono almeno 2 punti (Vector3) per creare un cavo.");
        return null;
    }

    // create a line with those points
    const cableCurve = new THREE.CatmullRomCurve3(pointsArray);

    // geometry of the cable
    const cableGeometry = new THREE.TubeGeometry(cableCurve, 128, 0.04, 8, false);

    // material
    State.wireMaterial = new THREE.MeshStandardMaterial({
        color: 0x15151c,           // grey base color
        roughness: 0.6,
        metalness: 0.2,
        emissive: 0x000000,        
        emissiveIntensity: 2.0    
    });

    //add cable to sscene
    const cableMesh = new THREE.Mesh(cableGeometry, State.wireMaterial);
    cableMesh.castShadow = true;
    cableMesh.receiveShadow = true;

    State.scene.add(cableMesh);
}

// create a sci fi hologram table at the given coordinates
export function createHologramTable(x, y, z) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(x, y, z);

    // base of the table, with geometry and shadows
    const baseGeo = new THREE.CylinderGeometry(1.5, 2, 1, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5; // Solleviamo la base

    base.receiveShadow = true;
    base.castShadow = true;
    tableGroup.add(base);

    // holoogram solar system
    State.holoSystem = new THREE.Group();
    State.holoSystem.position.y = 2.5; // Fluttua sopra il tavolo

    // material hologram
    const holoMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.6, 
        wireframe: true, 
        blending: THREE.AdditiveBlending 
    });

    //models of the hologram 
    const sunGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sun = new THREE.Mesh(sunGeo, holoMat);
    State.holoSystem.add(sun);

    const planetGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const planet = new THREE.Mesh(planetGeo, holoMat);
    planet.position.set(1.5, 0, 0); // Orbita a distanza
    State.holoSystem.add(planet);

    const planetGeo2 = new THREE.SphereGeometry(0.15, 7, 8);
    const planet2 = new THREE.Mesh(planetGeo2, holoMat);
    planet2.position.set(-1.0, 0.5, 1); // Orbita a distanza
    State.holoSystem.add(planet2);

    //add hologram to the group
    tableGroup.add(State.holoSystem);

    // hitbox
    const hitboxGeo = new THREE.BoxGeometry(3, 2, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // hitbox hon the base of the table
    hitbox.position.set(tableGroup.position.x, tableGroup.position.y, tableGroup.position.z);
    State.walls.push(hitbox); // add collitions to the hitbox
    State.scene.add(hitbox);

    //add model to the scene
    State.scene.add(tableGroup);
}

// add a console wwith moving screen on the given coordinates
export function createWallConsole(x, y, z, rotationY, isMainConsole = false) {
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(x, y, z);
    consoleGroup.rotation.y = rotationY;

    // structure external, geometry and material
    const frameGeo = new THREE.BoxGeometry(2, 3.5, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, // Molto scuro
        metalness: 0.9, 
        roughness: 0.3 
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1.75; 
    consoleGroup.add(frame);

    // screen of the terminal
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024; 
    const ctx = canvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(canvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screenGeo = new THREE.PlaneGeometry(1.8, 3.3); 
    const screen = new THREE.Mesh(screenGeo, screenMat);
    
    // set screen position and add it too the group
    screen.position.set(0, 1.75, 0.21);
    consoleGroup.add(screen);

    // save screen contents to animate them in an array
    State.animatedScreens.push({
        ctx: ctx,
        canvas: canvas,
        texture: screenTexture,
        offsetY: 0 // Usato per l'animazione dello scorrimento
    });

    // have a main console to add the exclamation mark at the beginning of the game
    if (isMainConsole) {
        State.scifiConsole = consoleGroup; 

        const questCanvas = document.createElement('canvas');
        questCanvas.width = 128; questCanvas.height = 128;
        const qCtx = questCanvas.getContext('2d');
        qCtx.font = 'Bold 110px Arial';
        qCtx.fillStyle = '#ffcc00';
        qCtx.textAlign = 'center'; qCtx.textBaseline = 'middle';
        qCtx.shadowColor = '#ff6600'; qCtx.shadowBlur = 15;
        qCtx.fillText('!', 64, 64);
        
        const indicatorTexture = new THREE.CanvasTexture(questCanvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: indicatorTexture, depthTest: false });
        State.consoleIndicator = new THREE.Sprite(spriteMaterial);
        
        State.consoleIndicator.scale.set(1.5, 1.5, 1);
        State.consoleIndicator.position.set(0, 4.2, 0); // ! over the terminal
        State.consoleIndicator.castShadow = false;
        State.consoleIndicator.receiveShadow = false;
        consoleGroup.add(State.consoleIndicator);
    }

    //shadows
    consoleGroup.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }   
    });

    //add everything to the scene
    State.scene.add(consoleGroup);
}

//add a radar to given coordinates
export function createWallRadar(x, y, z, rotationY) {
    //create radar group and position
    const radarGroup = new THREE.Group();
    radarGroup.position.set(x, y, z);
    radarGroup.rotation.y = rotationY;

    // radar background geoometry and background
    const plateGeo = new THREE.CylinderGeometry(2, 2, 0.1, 32);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.x = Math.PI / 2; 
    radarGroup.add(plate);

    // radar grid
    const gridGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.02, 32);
    const gridMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.4 
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 0.06; 
    radarGroup.add(grid);

    // blinking light green
    const blipGeo = new THREE.SphereGeometry(0.06, 16, 16); // it's a small sphere
    const blipMat = new THREE.MeshBasicMaterial({ 
        color: 0x33ff33,      
        transparent: true,    
        opacity: 0            
    });
    State.radarBlip = new THREE.Mesh(blipGeo, blipMat);
    State.radarBlip.position.set(0, 0, 0.08); 
    //add to the radar group
    radarGroup.add(State.radarBlip);
    //add radar to sscene
    State.scene.add(radarGroup);
}

//add a vent to the scene at given coordinates
export function createFloorVent(x, z) {
    const ventGroup = new THREE.Group();
    ventGroup.position.set(x, 0.26, z); //possition the group

    // vent frame geometry and material
    const frameGeo = new THREE.BoxGeometry(4, 0.02, 4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    ventGroup.add(frame);

    // small light from the vent
    const ventLight = new THREE.PointLight(0xff5500, 0.8, 4);
    ventLight.position.y = 0.5;
    ventGroup.add(ventLight);

    // add vent bars
    const barGeo = new THREE.BoxGeometry(0.1, 0.03, 3.6);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9 });
    
    for (let i = -5; i <= 5; i++) {
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.x = i * 0.3;
        ventGroup.add(bar);
    }

    //add the vent to the scene
    State.scene.add(ventGroup);
}

//add a server rack
export function createMainframe(x, y, z, rotationY) {
    //add the group and position
    const mainframe = new THREE.Group();
    mainframe.position.set(x, y, z);
    mainframe.rotation.y = rotationY;

    // materials
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.8, roughness: 0.4 });
    const lightMetal = new THREE.MeshStandardMaterial({ color: 0x333336, metalness: 0.9, roughness: 0.5 });
    const rackBlack = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });

    // main structure
    const cabinetGeo = new THREE.BoxGeometry(3.2, 6.2, 2.2);
    const cabinet = new THREE.Mesh(cabinetGeo, darkMetal);
    cabinet.position.y = 3.1;
    mainframe.add(cabinet);

    // lateral panels
    const sideGeo = new THREE.BoxGeometry(3.3, 6.0, 1.8);
    const sidePanel = new THREE.Mesh(sideGeo, lightMetal);
    sidePanel.position.y = 3.1;
    mainframe.add(sidePanel);

    // rack
    const rackAreaGeo = new THREE.BoxGeometry(2.6, 5.5, 2.3);
    const rackArea = new THREE.Mesh(rackAreaGeo, rackBlack);
    rackArea.position.y = 3.1;
    mainframe.add(rackArea);

    // server blades and LEDs
    const bladeGeo = new THREE.BoxGeometry(2.4, 0.3, 0.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.6 });

    // create the servers each with LEDs randomly
    for (let i = 0; i < 11; i++) {
        if (i === 3 || i === 7) continue; // some void servers to add variety and realism

        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        let bladeY = 0.8 + (i * 0.45);
        blade.position.set(0, bladeY, 0.95);
        mainframe.add(blade);

        // LED for each server
        for (let j = 0; j < 3; j++) {
            const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
            
            // 70% green, 20% orange, 10% red
            const rand = Math.random();
            let ledColor = 0x00ffaa; //green
            if (rand > 0.7 && rand <= 0.9) ledColor = 0xffaa00; // orange
            if (rand > 0.9) ledColor = 0xff3300; // red
            
            // glow in the dark
            const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
            const led = new THREE.Mesh(ledGeo, ledMat);
            
            // on the left of each server
            led.position.set(0.7 + (j * 0.12), bladeY, 1.21);
            mainframe.add(led);

            // save LEDs for animations
            State.serverLEDs.push({
                material: ledMat,
                baseColor: ledColor,
                // blinking sssppeed is random
                blinkRate: Math.random() * 0.05 + 0.01, 
                timeOffset: Math.random() * 100 
            });
        }
    }

    // ventilation
    const ventGeo = new THREE.PlaneGeometry(2.4, 0.6, 10, 2);
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0, 5.5, 1.16);
    mainframe.add(vent);

    // hitbox
    const hitboxGeo = new THREE.BoxGeometry(2, 2, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // place hitbox on server coordinates
    hitbox.position.set(mainframe.position.x, mainframe.position.y, mainframe.position.z);
    State.walls.push(hitbox); // add collitions to hitbox
    State.scene.add(hitbox);

    //add shadows
    mainframe.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    //add to the scene
    State.scene.add(mainframe);
}

//add a cryopod at given coordinates
export function createCryoPod(x, y, z, rotationY) {

    //add group and position
    const podGroup = new THREE.Group();
    podGroup.position.set(x, y, z);
    podGroup.rotation.y = rotationY;

    // base geometry and material
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    podGroup.add(base);

    // inclined pod geoometry and material
    const tiltedGroup = new THREE.Group();
    tiltedGroup.position.y = 0.4;  
    tiltedGroup.rotation.x = -0.25; // 15 degrees incline
    podGroup.add(tiltedGroup);

    // internal metal body
    const bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 4.2, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2.1;
    tiltedGroup.add(body);

    // glass on the front, geometry and material
    const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 3.8, 16, 1, false, -Math.PI/2, Math.PI);
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x00ffaa, 
        transparent: true, 
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.5,
        depthWrite: false 
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 2.1;
    tiltedGroup.add(glass);

    // internal light
    const interiorLight = new THREE.PointLight(0x00ffaa, 1, 5);
    interiorLight.position.set(0, 2.1, 0.5);
    tiltedGroup.add(interiorLight);

    //shadow
    podGroup.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    State.scene.add(podGroup);

    // hitbox
    const hitboxGeo = new THREE.BoxGeometry(3, 5, 3);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // place hitbox on the pod position
    hitbox.position.set(x, y + 2.5, z);
    State.scene.add(hitbox);

    // add collitions to hitbox
    State.walls.push(hitbox);
}


//create a pipe at given coordinates
export function createEnergyPipe(x, z) {
    const pipeGroup = new THREE.Group();
    pipeGroup.position.set(x, 0, z);

    // external tube geometry and material
    const outerGeo = new THREE.CylinderGeometry(0.6, 0.6, 8, 16);
    const outerMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        metalness: 0.9, 
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
    });
    const outerPipe = new THREE.Mesh(outerGeo, outerMat);
    outerPipe.position.y = 4;
    pipeGroup.add(outerPipe);

    // texture of the internal plasma
    const energyTex = State.textureLoader.load('./textures/plasma.jpg'); 
    
    // set texture repetition
    energyTex.wrapS = THREE.RepeatWrapping;
    energyTex.wrapT = THREE.RepeatWrapping;
    energyTex.repeat.set(1, 3); // repeat texture 3 times

    //add texture to internal pipe
    const innerGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
    const innerMat = new THREE.MeshStandardMaterial({ 
        map: energyTex,            
        emissiveMap: energyTex,      
        color: 0xffffff,           
        emissive: 0x00ffff,        
        emissiveIntensity: 2,    
        opacity: 0.9
    });
    const innerPipe = new THREE.Mesh(innerGeo, innerMat);
    innerPipe.position.y = 4;
    pipeGroup.add(innerPipe);

    //set texture active for animation
    State.activePipes.push(energyTex);

    //Hitbox
    const hitboxGeo = new THREE.BoxGeometry(1, 5, 1);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // place hitbox on the pipe position
    hitbox.position.set(pipeGroup.position.x, pipeGroup.position.y , pipeGroup.position.z);
    State.walls.push(hitbox); // Add collitions to hitbox
    State.scene.add(hitbox);

    //add pipe to scene
    State.scene.add(pipeGroup);
}


//add the ceiling
export function createSciFiCeiling() {
    const ceilingGroup = new THREE.Group();
    
    //room is 40x40x8
    const roomHeight = 8; 
    ceilingGroup.position.y = roomHeight;

    // base panel for ceiling, geometry and material, and set to cast shadows
    const baseGeo = new THREE.BoxGeometry(40, 0.5, 40);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, 
        roughness: 0.9, 
        metalness: 0.3
    });
    const ceilingBase = new THREE.Mesh(baseGeo, baseMat);
    ceilingBase.position.y = 0.25; 
    ceilingBase.castShadow = true;
    ceilingBase.receiveShadow = true;
    ceilingGroup.add(ceilingBase);

    // rods to make the ceiling not flat
    const beamGeo = new THREE.BoxGeometry(40, 0.6, 1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8 });
    
    // add a rod every 4 meters
    for (let i = -18; i <= 18; i += 4) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, -0.09, i);
        ceilingGroup.add(beam);
        
        // add a led every 3 rods
        if (i % 8 === 0 ) {
            // neon
            const ledGeo = new THREE.BoxGeometry(38, 0.05, 0.3);
            const ledMat = new THREE.MeshBasicMaterial({ color: 0x00aaff }); // cyan
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(0, -0.4, i);
            ceilingGroup.add(led);
            
            const ceilLight = new THREE.PointLight(0x00aaff, 0.6, 20);
            ceilLight.position.set(0, -1, i);
            ceilingGroup.add(ceilLight);
        }
    }

    // Central element core, geometry and material
    const coreGeo = new THREE.CylinderGeometry(3, 3, 0.8, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 1 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = -0.2;
    ceilingGroup.add(core);

    const coreRingGeo = new THREE.CylinderGeometry(2, 2, 0.9, 32);
    const coreRingMat = new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.position.y = -0.25;
    ceilingGroup.add(coreRing);

    // central core light to ahve a dim light in the room and not have it black
    //the light is at the central core, and doesn't cast shadows to increase performance. It's ambient light
    const coreLight = new THREE.PointLight(0xff5500, 4, 25, 2);
    coreLight.position.set(0, -0.4, 0);
    coreLight.castShadow = false; 
    ceilingGroup.add(coreLight); // add light to ceiling

    //shadows and add ceiling to scene
    State.scene.add(ceilingGroup);

    ceilingGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

}

// create a pedestal for the reactor to end the game, in given coordinates
export function addReactorPedestal(x, y, z) {
    //create and position the group
    State.reactorPedestal = new THREE.Group();
    State.reactorPedestal.position.set(x, y, z);

    // materials
    const stoneMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a24, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const nomaiCopperMat = new THREE.MeshStandardMaterial({ 
        color: 0x995533, 
        roughness: 0.4, 
        metalness: 0.8 
    }); 
    const warpGlowMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        emissive: 0x5500ff, // Viola Nomai
        emissiveIntensity: 2.0 
    });

    // GEOMETRY
    // the base, Geometry, material and shadow
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.4, 66); 
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    State.reactorPedestal.add(base);

    // central pillar
    const stemGeo = new THREE.CylinderGeometry(0.6, 0.9, 1.2, 64);
    const stem = new THREE.Mesh(stemGeo, nomaiCopperMat);
    stem.position.y = 1.0;
    stem.castShadow = true;
    stem.receiveShadow = true;
    State.reactorPedestal.add(stem);

    // glowing floating ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 12);
    const ring = new THREE.Mesh(ringGeo, warpGlowMat);
    ring.position.y = 1.0;
    ring.rotation.x = Math.PI / 2;
    // save in user data so that we can animate its rotation
    State.reactorPedestal.userData.warpRing = ring; 
    State.reactorPedestal.add(ring);

    // top base where the reactor is placed
    const topGeo = new THREE.CylinderGeometry(1.0, 0.5, 0.4, 64);
    const top = new THREE.Mesh(topGeo, stoneMat);
    top.position.y = 1.8;
    top.castShadow = true;
    top.receiveShadow = true;
    State.reactorPedestal.add(top);

    // hitbox
    const hitboxGeo = new THREE.BoxGeometry(2, 5, 2);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); 
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // hitbox is placed at pedestal coordinates
    hitbox.position.set(State.reactorPedestal.position.x, State.reactorPedestal.position.y + 2.5, State.reactorPedestal.position.z);
    State.walls.push(hitbox); //add hitbox collitions
    State.scene.add(hitbox);

    //add reactor to the scene
    State.scene.add(State.reactorPedestal);
}
