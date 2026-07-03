import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';

//add all background stars
export function createStars() {
    //make geometry and material
    const starGeometry = new THREE.BufferGeometry();
    State.starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1, // Grandezza delle stelle
        transparent: true,
        opacity:1
    });

    //add randomly in the sky
    const starVertices = [];
    for (let i = 0; i < 3200; i++) {
        // choose for every star a random position
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        //don't choose places too close to the main room
        if (x > -50 && x < 50 && y > -200 && y < 50 && z > -50 && z < 50) {
        } else{
            starVertices.push(x, y, z);
        }
    }

    //add them to the scene
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    
    const stars = new THREE.Points(starGeometry, State.starMaterial);
    State.scene.add(stars);
    
    return stars; 
}

//add a galaxy in give coordinates
export function createGalaxy( x, y, z, coreColorInput = '#ffe6aa', armColorInput = '#ff00aa') {
    const particleCount = 15000; // number of stars in the galaxy (particles)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // parameters
    const arms = 3;             // number of spiral arms
    const galaxyRadius = 80;    // radius
    const coreColor = new THREE.Color(coreColorInput); // color of center
    const armColor = new THREE.Color(armColorInput);  // color of arms

    for (let i = 0; i < particleCount; i++) {
        // choose a possition for every particle, with random radius (no bigger than max radius) placed in one of the arm
        //more particless will happen in the center
        const radius = Math.random() * galaxyRadius * Math.pow(Math.random(), 2);
        const armAngle = ((i % arms) / arms) * Math.PI * 2;
        const spinAngle = radius * 0.1; // how much it enhance spiral

        // randomness to add volume to spirals
        const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.1);
        const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.05);
        const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * (radius * 0.1);

        //phisical position of every point saved in the array
        const i3 = i * 3;
        positions[i3]     = Math.cos(armAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY; // Altezza della galassia
        positions[i3 + 2] = Math.sin(armAngle + spinAngle) * radius + randomZ;

        // color gradient
        const mixedColor = coreColor.clone();
        mixedColor.lerp(armColor, radius / galaxyRadius);

        //add color of the point in the array
        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material of single points
    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true, // Dice a Three.js di usare i colori calcolati sopra
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending, // Illumina fondendo le particelle al centro
        depthWrite: false, // Impedisce alle particelle di coprirsi a vicenda con quadrati neri
        fog: false // Non viene cancellata dalla nebbia di gioco
    });

    State.galaxy = new THREE.Points(geometry, material);
    
    // set galaxxy far from main room, customizable
    State.galaxy.position.set(x, y, z);
    
    // add rotation to not make it flat
    State.galaxy.rotation.x = 0.6;
    State.galaxy.rotation.z = 0.2;
    //add to scene
    State.galaxies.push(State.galaxy);
}

//add a black hole in given coordinates
export function createBlackHole(x, y, z){
    // black hole group creation and placing
    State.blackHoleGroup = new THREE.Group();
    State.blackHoleGroup.position.set(x, y, z); 

    // event horizon (the black sphere)
    const bhGeo = new THREE.SphereGeometry(40, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeo, bhMat);
    State.blackHoleGroup.add(blackHole);

    // accretion disk made of particles
    const particleCount = 10000; // number of particles in the disk
    const diskGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const innerRadius = 42; //minimum radius of the particles
    const outerRadius = 130; // max radius of the particles

    // colors gradient of the disk
    const hotColor = new THREE.Color(0xffffff); // center color
    const coldColor = new THREE.Color(0xaa1100); // outer color

    for (let i = 0; i < particleCount; i++) {
        //distribute particles randomly in a radiuss and angle from the center
        const r = innerRadius + Math.pow(Math.random(), 3) * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;

        // Y variation to add variety
        const yThickness = (Math.random() - 0.5) * (800 / r); 

        //saving positions of particles in an array
        const i3 = i * 3;
        positions[i3] = Math.cos(theta) * r;
        positions[i3 + 1] = yThickness; 
        positions[i3 + 2] = Math.sin(theta) * r;

        // add the color gradient
        const mixedColor = hotColor.clone();
        mixedColor.lerp(coldColor, (r - innerRadius) / (outerRadius - innerRadius));

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    //physically place the calculated informations
    diskGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const diskMat = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, 
        depthWrite: false, 
        fog: false
    });

    State.accretionDisk = new THREE.Points(diskGeo, diskMat);
    
    // slightly incline the black hole
    State.blackHoleGroup.rotation.z = 0.2; 
    State.blackHoleGroup.add(State.accretionDisk);
    //add it to the scene
    State.scene.add(State.blackHoleGroup);
}