import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

//import auxiliary functions from other modules
import {loadButtons, loadLightSensors, loadReactor, createSciFiCable, addReactorPedestal, createHologramTable, createWallConsole, createWallRadar, createFloorVent, createCryoPod, createMainframe, createEnergyPipe, createSciFiCeiling} from './room_props.js';
import {createSpaceshipExterior} from './spaceship.js';
import {createStars, createGalaxy, createBlackHole} from './space_props.js';
import {createPlayer} from './player.js';
import {addSun, addPlanets, addComet} from './solar_system.js';
import {addWall, addPlatform} from './walls_platforms.js';

// global variables
import { State } from '../Core/state.js';

// places everything in the scene,  the room, the props, the player and the solar system
export function createWorld() {
    //create stars
    const starField = createStars();

    const loader = new GLTFLoader(State.loadingManager);

    // load textures for walls, floor, door and platforms
    const floorTex = State.textureLoader.load('./textures/floor.png');
    const wallTex = State.textureLoader.load('./textures/wall_texture.jpg');
    const doorTex = State.textureLoader.load('./textures/door.png');
    const platformTex = State.textureLoader.load('./textures/debris.png');
    const metalTex = State.textureLoader.load('./textures/Metal046B_1K-JPG_Color.jpg');
    metalTex.wrapS = THREE.RepeatWrapping;
    metalTex.wrapT = THREE.RepeatWrapping;
    platformTex.wrapS = THREE.RepeatWrapping;
    platformTex.wrapT = THREE.RepeatWrapping;
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    doorTex.wrapS = THREE.RepeatWrapping;
    doorTex.wrapT = THREE.RepeatWrapping;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 4);
    doorTex.name="door";

    // main room platform (floor)
    addPlatform(0, 0, 0, 41, 41, floorTex);

    // main room walls
    const h = 8; // height of the room
    const t = 1;
    addWall(-20.5, h/2, 0, t, h, 40, 0xffffff, wallTex);      // Left
    addWall(20.5, h/2, 0, t, h, 40, 0xffffff, wallTex);       //right
    
    addWall(-11.5, h/2, -20.5, 17, h, t, 0xffffff, wallTex);  // front left
    addWall(11.5, h/2, -20.5, 17, h, t, 0xffffff, wallTex);   // front right
    addWall(0, 6, -20.5, 6, 4, t, 0xffffff, wallTex);         // over the door

    // GLASS WINDOW
    //small decorations for the surrounding of the window
    addWall(0, 0.75, 20.5, 41, 1.5, t, 0x2d323a, wallTex);
    addWall(0, 7.25, 20.5, 41, 1.5, t, 0x2d323a, wallTex);
    addWall(-10, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex); //column left
    addWall(0, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex);  // central column
    addWall(10, 4.0, 20.5, 1.5, 5, 1.4, 0x3a414b, wallTex); // column right
    addWall(-20.25, 4.0, 20.5, 1, 5, 1.4, 0x2d323a, wallTex);
    addWall(20.25, 4.0, 20.5, 1, 5, 1.4, 0x2d323a, wallTex);

    //glass itself
    const glassGeo = new THREE.BoxGeometry(40, 5, 0.2); 
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x0c1a30,       // Blu profondo fantascientifico
        transparent: true, 
        opacity: 0.4, 
        roughness: 0.05, 
        metalness: 0.9,
        clearcoat: 1.0,        // reflection
        clearcoatRoughness: 0.1,
        fog: false, 
        depthWrite: false   
    });
    const giantWindow = new THREE.Mesh(glassGeo, glassMat);
    giantWindow.position.set(0, 4.0, 20.4);
    giantWindow.castShadow = true;
    giantWindow.receiveShadow = true;
    State.walls.push(giantWindow); // add the glass to walls array to add collisions
    State.scene.add(giantWindow);


    // wall decorations / ribs to add variety
    const ribPositionsZ = [-10, 0, 10]; 

    ribPositionsZ.forEach(zPos => {
        //pillars
        addWall(-19.8, h/2, zPos, 0.4, h, 1.5, 0x252a32, metalTex);
        addWall(19.8, h/2, zPos, 0.4, h, 1.5, 0x252a32, metalTex);
        addWall(0, 7.8, zPos, 40, 0.4, 1.5, 0x252a32, metalTex);
    });

    // Door
    State.door = addWall(0, h/10, -20.5, 6, h, 0.4, 0x442200, doorTex);

    // Room props
    createHologramTable(0, 0, 0);

    createWallConsole(-19.6, 0.5, 7, Math.PI / 2); // on left wall
    createWallConsole(19.6, 0.5, 7, -Math.PI / 2, true); // on right wall

    createEnergyPipe(-19, -19); // left pipe
    createEnergyPipe(19, -19);  // right pipe

    createCryoPod(-18, 0, -2, Math.PI / 2);
    createCryoPod(-18, 0, 1, Math.PI / 2);

    createMainframe(18.5, 0, -4, -Math.PI / 2);

    createFloorVent(-10, 10);
    createFloorVent(10, 10);

    createWallRadar(8, 4, -19.9, 0);

    addReactorPedestal(0, 0.5, 15);

    // add ceiling and spaceship geometry
    createSciFiCeiling();
    createSpaceshipExterior();

    //add cable from button to interactive light
    const mainCablePoints = [
        new THREE.Vector3(-19, 1, 14),     
        new THREE.Vector3(-19.5, 1, 12.5),     
        new THREE.Vector3(-19.5, 3, 10),    
        new THREE.Vector3(-19.5, 5, 9.0), 
        new THREE.Vector3(-19.5, 6, 3.0),    
        new THREE.Vector3(-19.5, 5.5, -10.0),     
    ];
    createSciFiCable(mainCablePoints);

    //light sensors
    loadLightSensors();

    //buttons and interactive lamp
    loadButtons();

    // add player and torch
    createPlayer();

    // Platforming section

    addPlatform(5, 0.5, -42, 3, 3, platformTex, true, 'normal', 'wreckage-A', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'x';

    addPlatform(8, 0.7, -52, 3, 3, null, false, 'shadow', 'wreckage-C', true); 
    addPlatform(0, 0.8, -60, 4, 4, platformTex, false, 'normal', 'wreckage-B', true);

    addPlatform(-8, 1.0, -70, 3, 3, platformTex, true, 'normal', 'wreckage-C', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'z';

    addPlatform(-8, 1.2, -85, 5, 5, platformTex, false, 'normal', 'wreckage-A', true);

    addPlatform(-16, 1.5, -75, 3, 3, null, false, 'shadow', 'wreckage-B', true);
    addPlatform(-14, 1.4, -98, 3, 3, platformTex, false, 'light-only', 'wreckage-C', true);

    addPlatform(-24, 1.8, -78, 4, 4, platformTex, false, 'normal', 'wreckage-A', true);
    addPlatform(-22, 2.0, -100, 6, 6, platformTex, false, 'normal', 'wreckage-C', true); 

    addPlatform(-30, 0.8, -85, 3, 3, platformTex, true, 'normal', 'wreckage-B', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'z';

    addPlatform(-38, 1.0, -85, 4, 4, platformTex, false, 'normal', 'wreckage-A', true);
    
    addPlatform(-46, 1.2, -93, 4, 4, platformTex, false, 'light-only', 'wreckage-B', true);

    addPlatform(-46, 3.5, -106, 6, 6, platformTex, true, 'normal', 'wreckage-C', true);
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'y';

    addPlatform(-47, 5, -115, 6, 6, platformTex, false, 'normal', 'wreckage-A', false); // final platform, with no wobble and bigger


    //random platform for decoration
    addPlatform(-60, 8, -80, 3, 3, platformTex, true, 'normal', 'wreckage-A', true); // Moving
    State.platforms[State.platforms.length - 1].userData.moveAxis = 'x';
    addPlatform(30, 2, -50, 4, 4, platformTex, false, 'normal', 'wreckage-B', true);
    addPlatform(-50, 6, -30, 5, 5, platformTex, false, 'normal', 'wreckage-C', true);

    // places reactor to be picked up
    loadReactor();

    // Solar SYSTEM
    //sun
    addSun();
    //PLANETS
    addPlanets();

    //Comet
    addComet();

    //black hole and galaxies
    createBlackHole(0, -200, 0);

    createGalaxy(-800, 400, -400);
    createGalaxy(200, 600, 1000, '#ffe6aa', '#15ff00');
    createGalaxy(1000, -300, -300, '#c4ecc4', '#ff0000');
    State.galaxies.forEach(gal => {
        State.scene.add(gal);
    });
}

