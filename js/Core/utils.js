import * as THREE from 'three';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from './state.js';

// --- LOGICA DI ILLUMINAZIONE FISICA ---
export function getIntensityOnObject(lightSource, targetObj) {
    const lightPos = new THREE.Vector3();
    lightSource.getWorldPosition(lightPos);
    const targetPos = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);

    const dist = lightPos.distanceTo(targetPos);
    if (dist > 20) return 0; // Ottimizzazione: se troppo lontano, scarta subito

    let intensity = lightSource.intensity / (dist * dist);

    if (lightSource.isSpotLight) {
        const lampDir = new THREE.Vector3(0, 0, -1).applyQuaternion(State.player.quaternion);
        const dirToTarget = new THREE.Vector3().subVectors(targetPos, lightPos).normalize();
        const dot = lampDir.dot(dirToTarget);
        
        if (dot < Math.cos(lightSource.angle)) return 0;
        
        const penumbraMod = Math.pow(
            (dot - Math.cos(lightSource.angle)) / (1 - Math.cos(lightSource.angle)), 
            lightSource.penumbra * 10
        );
        intensity *= penumbraMod;
    }

    const rayDir = new THREE.Vector3().subVectors(targetPos, lightPos).normalize();
    const raycaster = new THREE.Raycaster(lightPos, rayDir, 0, dist + 0.5);
    
    // --- IL TRUCCO CHE RISOLVE IL LAG ---
    // Creiamo un array contenente SOLO gli oggetti solidi (muri, pavimenti e il cristallo stesso)
    // Il raycaster ora controllerà 20 oggetti invece di 30.000!
    const ostacoliSolidi = [...State.walls, ...State.platforms, targetObj];
    
    // Usiamo il nuovo array "ostacoliSolidi" invece del vecchio "scene.children"
    const intersects = raycaster.intersectObjects(ostacoliSolidi, true);

    if (intersects.length > 0 && intersects[0].object !== targetObj && intersects[0].object.parent !== targetObj) {
        return 0; // La luce è bloccata da un muro o una piattaforma
    }

    return intensity; // La luce colpisce l'oggetto!
}