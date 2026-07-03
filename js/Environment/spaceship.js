import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from '../Core/state.js';

export function createSpaceshipExterior() {
    const shipGroup = new THREE.Group();

    // materials, like nasa white and metal
    const nasaWhiteMat = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const darkTrussMat = new THREE.MeshStandardMaterial({
        color: 0x222225, 
        roughness: 0.7,
        metalness: 0.6
    });
    const solarMat = new THREE.MeshStandardMaterial({
        color: 0x0a1530, 
        roughness: 0.2,
        metalness: 0.9
    });
    const goldFoilMat = new THREE.MeshStandardMaterial({
        color: 0xcca622, 
        roughness: 0.5,
        metalness: 0.8
    });
    const engineGlowMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff // Plasma
    });

    // COMMAND MODULE
    const saucerGeo = new THREE.CylinderGeometry(34, 34, 2, 64);
    
    //disk on top and bottom of the main rroom
    const roofDisk = new THREE.Mesh(saucerGeo, nasaWhiteMat);
    roofDisk.position.set(0, 9.2, 0); // Appoggiato sopra il soffitto
    shipGroup.add(roofDisk);

    State.floorDisk = new THREE.Mesh(saucerGeo, nasaWhiteMat);
    State.floorDisk.position.set(0, -1, 0); // Appoggiato sotto il pavimento
    shipGroup.add(State.floorDisk);

    // grey ringss on the disks
    const bumperGeo = new THREE.TorusGeometry(34, 0.8, 16, 64);
    bumperGeo.rotateX(Math.PI / 2);
    const bumperTop = new THREE.Mesh(bumperGeo, darkTrussMat);
    bumperTop.position.set(0, 9.2, 0);
    shipGroup.add(bumperTop);
    
    const bumperBottom = bumperTop.clone();
    bumperBottom.position.set(0, -1.2, 0);
    shipGroup.add(bumperBottom);


    // TAIL OF THE SHIP
    const aftGroup = new THREE.Group(); // Group for posterior of ship
    // Ship spine
    const spineGeo = new THREE.CylinderGeometry(8, 8, 150, 32);
    spineGeo.rotateZ(Math.PI / 2);
    const spine = new THREE.Mesh(spineGeo, nasaWhiteMat);
    spine.position.set(-82.5, 4, 0); // goes from -20 to -160
    aftGroup.add(spine);


    // centrifuge
    const ringGeo = new THREE.TorusGeometry(35, 6, 32, 64);
    ringGeo.rotateY(Math.PI / 2);
    const gravityRing = new THREE.Mesh(ringGeo, nasaWhiteMat);
    gravityRing.position.set(-70, 4, 0);
    aftGroup.add(gravityRing);

    // supports (rotating) for the centrifuge
    const spokeGeo = new THREE.CylinderGeometry(1.5, 1.5, 70, 16);
    State.spoke1 = new THREE.Mesh(spokeGeo, darkTrussMat);
    State.spoke1.position.set(-70, 4, 0);
    aftGroup.add(State.spoke1);
    
    State.spoke2 = new THREE.Mesh(spokeGeo, darkTrussMat);
    State.spoke2.position.set(-70, 4, 0);
    State.spoke2.rotation.x = Math.PI / 2;
    aftGroup.add(State.spoke2);


    // sollar panes
    const panelGeo = new THREE.BoxGeometry(20, 0.5, 80);
    
    const leftPanel = new THREE.Mesh(panelGeo, solarMat);
    leftPanel.position.set(-110, 4, 45);
    aftGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeo, solarMat);
    rightPanel.position.set(-110, 4, -45);
    aftGroup.add(rightPanel);

    const panelTrussGeo = new THREE.CylinderGeometry(2, 2, 90, 16);
    panelTrussGeo.rotateX(Math.PI / 2);
    const panelTruss = new THREE.Mesh(panelTrussGeo, goldFoilMat);
    panelTruss.position.set(-110, 4, 0);
    aftGroup.add(panelTruss);


    // engine
    const reactorGeo = new THREE.SphereGeometry(14, 32, 32);
    const reactor = new THREE.Mesh(reactorGeo, nasaWhiteMat);
    reactor.position.set(-160, 4, 0);
    aftGroup.add(reactor);

    // engine outing
    const bellGeo = new THREE.CylinderGeometry(3, 8, 12, 32);
    bellGeo.rotateZ(Math.PI / 2);

    const thrusterPositions = [
        { y: 8, z: 0 },   // up
        { y: 0, z: -8 },  // down right
        { y: 0, z: 8 }    // down left
    ];

    //places thrusters in the positions
    thrusterPositions.forEach(pos => {
        const bell = new THREE.Mesh(bellGeo, darkTrussMat);
        bell.position.set(-170, pos.y, pos.z);
        aftGroup.add(bell);

        // plasma geometry
        const glowGeo = new THREE.SphereGeometry(4.5, 16, 16);
        const glow = new THREE.Mesh(glowGeo, engineGlowMat);
        glow.position.set(-172, pos.y, pos.z);
        glow.scale.set(2, 1, 1);
        aftGroup.add(glow);
    });

    // engine lights
    const engineLight = new THREE.PointLight(0x00aaff, 5, 200);
    engineLight.position.set(-180, 4, 0);
    engineLight.castShadow = true;
    aftGroup.add(engineLight);

    // scale and add too scene the group
    aftGroup.scale.set(0.7, 0.7, 0.7);
    aftGroup.position.set(-15, 0, 0); 
    shipGroup.add(aftGroup);

    // HEAD OF THE SSHIP
    const bowGroup = new THREE.Group();
    
    // neck of the head
    const neckGeo = new THREE.BoxGeometry(18, 6, 10);
    const neck = new THREE.Mesh(neckGeo, nasaWhiteMat);
    neck.position.set(36, 10, 0); 
    // we incline it to have the head higher than the rest of the ship
    neck.rotation.z = Math.PI / 6; 
    bowGroup.add(neck);

    // main disk for the head
    const saucerRadius = 26;
    const saucerFrontGeo = new THREE.CylinderGeometry(saucerRadius, saucerRadius - 3, 4.5, 64);
    const mainSaucer = new THREE.Mesh(saucerFrontGeo, nasaWhiteMat);
    mainSaucer.position.set(62, 17, 0);
    bowGroup.add(mainSaucer);

    // ring to connect
    const saucerBumperGeo = new THREE.TorusGeometry(saucerRadius, 0.8, 16, 64);
    saucerBumperGeo.rotateX(Math.PI / 2);
    const saucerBumper = new THREE.Mesh(saucerBumperGeo, darkTrussMat);
    saucerBumper.position.set(62, 17, 0);
    bowGroup.add(saucerBumper);

    // Command Bridge
    const bridgeBaseGeo = new THREE.CylinderGeometry(8, 12, 2, 64);
    const bridgeBase = new THREE.Mesh(bridgeBaseGeo, nasaWhiteMat);
    bridgeBase.position.set(62, 19.5, 0); 
    bowGroup.add(bridgeBase);

    // Dome for the Head module
    const bridgeDomeGeo = new THREE.SphereGeometry(6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bridgeDome = new THREE.Mesh(bridgeDomeGeo, nasaWhiteMat);
    bridgeDome.position.set(62, 20.5, 0);
    bridgeDome.scale.set(1, 0.8, 1);
    bowGroup.add(bridgeDome);

    // cockit glass window
    const visorMat = new THREE.MeshStandardMaterial({ 
        color: 0x050508, 
        roughness: 0.1, 
        metalness: 0.9 
    });
    const visorGeo = new THREE.CylinderGeometry(6.1, 6.1, 2, 32, 1, false, -Math.PI / 4, Math.PI / 2);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(62, 21.5, 0);
    visor.rotation.y = -Math.PI / 2;
    bowGroup.add(visor);

    // lowwwer dome
    const lowerDomeGeo = new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lowerDome = new THREE.Mesh(lowerDomeGeo, darkTrussMat);
    lowerDome.position.set(62, 14.75, 0); // Sotto il nuovo disco a Y=17
    lowerDome.rotation.x = Math.PI; 
    lowerDome.scale.set(1, 0.5, 1);
    bowGroup.add(lowerDome);

    // secondary engines on the back of the head of the ship
    const impulseGeo = new THREE.BoxGeometry(3, 2, 8);
    
    const leftImpulse = new THREE.Mesh(impulseGeo, darkTrussMat);
    leftImpulse.position.set(40, 17.5, 8);
    bowGroup.add(leftImpulse);
    
    const leftImpulseGlow = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 7.6), engineGlowMat);
    leftImpulseGlow.position.set(40, 17.5, 8);
    bowGroup.add(leftImpulseGlow);

    const rightImpulse = new THREE.Mesh(impulseGeo, darkTrussMat);
    rightImpulse.position.set(40, 17.5, -8);
    bowGroup.add(rightImpulse);

    const rightImpulseGlow = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 7.6), engineGlowMat);
    rightImpulseGlow.position.set(40, 17.5, -8);
    bowGroup.add(rightImpulseGlow);

    //scale the Head group and add to the scene
    bowGroup.scale.set(1.6, 1.6, 1.6);
    bowGroup.position.set(-22, -6, 0);
    shipGroup.add(bowGroup);


    // outer layer of main room to hide the texture of the walls in the room ith the exterior white
    const claddingPanels = [
        { w: 0.6,   h: 9.5,  d: 42,  x: -21.0,  y: 4.1,   z: 0     },
        { w: 0.6,   h: 9.5,  d: 42,  x: 21.0,   y: 4.1,   z: 0     },
        { w: 18.25,  h: 9.5,  d: 0.6, x: -12.15, y: 4.1,   z: -21.0 },
        { w: 18.25,  h: 9.5,  d: 0.6, x: 12.15,  y: 4.1,   z: -21.0 },
        { w: 6.1,     h: 4.84, d: 0.6, x: 0,      y: 6.425, z: -21.0 },
    ];

    claddingPanels.forEach(p => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.d), nasaWhiteMat);
        panel.position.set(p.x, p.y, p.z);
        shipGroup.add(panel); // shadows impostate dal traverse qui sotto
    });


    // add shadow to everything
    shipGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    //add ship to scene
    State.scene.add(shipGroup);
}