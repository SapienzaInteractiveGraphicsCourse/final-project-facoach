import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// global variables
import {State} from '../Core/state.js';


export function addWall(x, y, z, w, h, d, color = 0x777777, texture = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    let mat;

    if (texture) {
        // clone texxture to not load it again and have better pperformance, applying to different objects
        const localTex = texture.clone();
        if (texture.image) {
            localTex.needsUpdate = true;
        }

        if (texture.name === "door") {
            localTex.repeat.set(1, 1.1); // on the door, apply the texture once, it's a specific case
        } else {
            // parameters for how many times textures appear
            const textureWidth = 10; 
            const roomHeight = 8;    
            const wallLength = Math.max(w, d);

            // calculate repetitions
            const repeatX = wallLength / textureWidth;
            const repeatY = h / roomHeight;
            
            localTex.repeat.set(repeatX, repeatY);

            // calculate vertical alignement
            const bottomY = y - (h / 2);
            localTex.offset.y = bottomY / roomHeight;
        }
        mat = new THREE.MeshStandardMaterial({ 
            map: localTex, 
            color: 0xffffff 
        });
    } else {
        // if no texture is specified, monocroomatic color
        mat = new THREE.MeshStandardMaterial({ color: color });
    }
    
    //set wall position and add it to collition array and scene
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;

    State.scene.add(wall);
    State.walls.push(wall);
    return wall;
}


//add a platform
export function addPlatform(x, y, z, w, d, texture, isMoving = false, type = 'normal', shape = 'square', wobble = false) {
    let geo;

    // drawing different shapes of latforms, they should resemble debris from the ship
    if (shape === 'wreckage-A') {
        // shae 1
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/2);
        s.lineTo(w/2 * 0.8, -d/2 * 0.9); 
        s.lineTo(w/2, -d/2 * 0.2);    
        s.lineTo(w/2 * 0.7, 0);
        s.lineTo(w/2, d/2 * 0.8);
        s.lineTo(w/2 * 0.3, d/2);
        s.lineTo(-w/2 * 0.7, d/2 * 0.9);
        s.lineTo(-w/2 * 0.9, 0);
        s.lineTo(-w/2, -d/2);

        // add depth and center the model
        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2);
        geo.translate(0, 0.25, 0);

        // apply projection for textures on  a custom shape
        const pos = geo.attributes.position;
        const uvs = [];

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        // set dimentions to make collisions possible
        geo.parameters = { width: w, height: 0.5, depth: d };

    } else if (shape === 'wreckage-B') {
        // shape 2
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/2);
        s.lineTo(w/2, -d/2);
        s.lineTo(w/2, d/2);
        s.lineTo(-w/2 * 0.2, d/2); 
        s.lineTo(-w/2 * 0.5, d/2 * 0.5); // Area distrutta verso l'interno
        s.lineTo(-w/2 * 0.1, 0); 
        s.lineTo(-w/2, -d/2 * 0.5);
        s.lineTo(-w/2, -d/2);

        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2);
        geo.translate(0, 0.25, 0);

        const pos = geo.attributes.position;
        const uvs = [];


        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        
        geo.parameters = { width: w, height: 0.5, depth: d };

    } else if (shape === 'wreckage-C') {
        // shappe 3
        const s = new THREE.Shape();
        s.moveTo(-w/2, -d/4);
        s.lineTo(-w/4, -d/4);
        s.lineTo(-w/5, -d/2);
        s.lineTo(w/4, -d/2);
        s.lineTo(w/3, -d/4);
        s.lineTo(w/2, -d/5);
        s.lineTo(w/2, d/4);
        s.lineTo(w/3, d/3);
        s.lineTo(w/3.5, d/3);
        s.lineTo(-w/4, d/2);
        s.lineTo(-w/5, d/4);
        s.lineTo(-w/2, d/4);

        geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
        geo.rotateX(Math.PI / 2);
        geo.translate(0, 0.25, 0);

        const pos = geo.attributes.position;
        const uvs = [];

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            uvs.push(x / w, z / d); 
        }

        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        geo.parameters = { width: w, height: 0.5, depth: d };
    } else {
        // default square
        geo = new THREE.BoxGeometry(w, 0.5, d);
    }

    // materials based on the tye (if reacts to light or not)
    let mat;
    if (type === 'shadow') {
        mat = new THREE.MeshStandardMaterial({ 
            map: texture,
            metalness: 0.6,
            roughness: 0.4,
            opacity: 0
        });
    } else if (type === 'light-only') {
        mat = new THREE.MeshStandardMaterial({ 
            map: texture, 
            transparent: true, 
            opacity: 0 
        });
    } else {
        mat = new THREE.MeshStandardMaterial({ 
            map: texture,
            metalness: 0.6,
            roughness: 0.4 
        });
    }

    //place the pplatform
    const plat = new THREE.Mesh(geo, mat);
    plat.position.set(x, y, z);
    plat.castShadow = true;
    plat.receiveShadow = true;

    // cables from the debris
    if (type === 'normal' || type === 'shadow') {
        const brokenCablesCount = Math.floor(Math.random() * 3) + 1; // 1 o 3 cavi
        
        for (let i = 0; i < brokenCablesCount; i++) {
            // choose a random point from where cable begins
            const randomAngle = Math.random() * Math.PI * 2;
            // place cable on edges mainly
            const localStartX = Math.cos(randomAngle) * (w / 2) * 0.85;
            const localStartZ = Math.sin(randomAngle) * (d / 2) * 0.85;

            // points for cable, ppopssibly short cables
            const cablePoints = [
                new THREE.Vector3(localStartX, -0.25, localStartZ), 
                new THREE.Vector3(localStartX + (Math.random() - 0.5) * 0.2, -0.6, localStartZ + (Math.random() - 0.5) * 0.2), 
                new THREE.Vector3(localStartX + (Math.random() - 0.5) * 0.5, -0.9, localStartZ + (Math.random() - 0.5) * 0.5)  
            ];

            //parameters for cable dimentions and colors
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeo = new THREE.TubeGeometry(cableCurve, 16, 0.015, 6, false);
            
            const brokenCableMat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.8,
                emissive: type === 'shadow' ? 0xc30010 : 0xc30010, 
                emissiveIntensity: 1.2
            });

            const cableMesh = new THREE.Mesh(cableGeo, brokenCableMat);
            plat.add(cableMesh);
        }
    }

    // state data for the platform
    plat.userData = {
        id: Math.random() * 100,
        isMoving: isMoving, 
        startZ: z, 
        startX: x,
        time: 0, 
        type: type, 
        active: (type === 'normal' || type === 'shadow'),
        wobble: wobble 
    };
    
    //if the platform appears wwith light, should be invisible at first
    if (type === 'light-only') plat.visible = false;

    //add platform to scene and collision array
    State.scene.add(plat);
    State.platforms.push(plat);
}