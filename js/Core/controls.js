import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import {openSciFiDoor, closeSciFiDoor} from '../Animations/door_animations.js';

// --- CONFIGURAZIONE GLOBALE ---
import {State} from './state.js';

// --- 5. INPUT (Interazione utente) ---
export function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        //corsa
        if (e.key === 'Shift') State.keys.shift = true;
        //movimento WASD
        State.keys[e.key.toLowerCase()] = true;
        
        //salto
        if (e.key === ' ' && !State.isJumping && !State.isConsoleScreenOpen) {
            State.velocityY = State.jumpForce;
            State.isJumping = true;
        }

        //lampada
        if (e.key.toLowerCase() === 'e') {
            if (State.isConsoleScreenOpen) return; // Blocca l'interazione con la torcia se la console è aperta
            State.isLampOn = !State.isLampOn;
            State.playerLamp.intensity = State.isLampOn ? 9 : 0;
            State.playerGlow.intensity = State.isLampOn ? 5 : 0;
            console.log("Lampada: " + (State.isLampOn ? "Accesa" : "Spenta"));
        }

        //interazione con oggetti
        if (e.key.toLowerCase() === 'f') {

            // --- NUOVO: RACCOLTA REATTORE ---
            if (State.ReactorModel && !State.isReactorPickedUp) {
                const distanceToReactor = State.player.position.distanceTo(State.ReactorGroup.position);
                
                if (distanceToReactor < 2) {
                    State.isReactorPickedUp = true;
                    State.isReactorPlaced = false; 
                    State.scene.remove(State.ReactorGroup); // Rimuove il modello 3D dal mondo
                    
                    console.log("Reattore raccolto con successo!");
                    
                    // Chiudi la UI per evitare che il messaggio [F] resti bloccato a schermo
                    const promptUI = document.getElementById('interaction-prompt');
                    if (promptUI) promptUI.style.display = 'none';
                    
                    //aggiorna indicatore console
                    if (State.consoleIndicator) {
                        State.ReactorGroup.remove(State.consoleIndicator);
                        State.reactorPedestal.add(State.consoleIndicator);
                    }
                    return; // "return" ferma la funzione. Così non premi per sbaglio anche il bottone se fosse vicino
                }
            }

            // --- Colloca REATTORE ---
            if (State.reactorPedestal && State.isReactorPickedUp) {
                const distanceToPedestal = State.player.position.distanceTo(State.reactorPedestal.position);
                
                if (distanceToPedestal < 3) {
                    State.isReactorPickedUp = false;
                    State.isReactorPlaced = true;
                    //rimuovi indicatore console
                    if (State.consoleIndicator) {
                        State.reactorPedestal.remove(State.consoleIndicator);
                    }
                    State.ReactorGroup.position.set(State.reactorPedestal.position.x, State.reactorPedestal.position.y + 2.5, State.reactorPedestal.position.z);
                    State.scene.add(State.ReactorGroup); // aggiunge il modello 3D al piedistallo
                    
                    console.log("Reattore collocato con successo!");
                    
                    // Chiudi la UI per evitare che il messaggio [F] resti bloccato a schermo
                    const promptUI = document.getElementById('interaction-prompt');
                    if (promptUI) promptUI.style.display = 'none';
                    

                    //propmpt di vittoria, va qui e non in animate perchè deve apparire una sola volta
                    if (State.victoryUI) State.victoryUI.style.display = 'block';

                    // Nascondi la legenda dei comandi (non servono più)
                    const legendUI = document.getElementById('controls-legend');
                    if (legendUI) legendUI.style.display = 'none';


                    return; // "return" ferma la funzione. Così non premi per sbaglio anche il bottone se fosse vicino
                }
            }

            // ---INTERAZIONE CON LA CONSOLE ---
            if (State.scifiConsole && State.player.position.distanceTo(State.scifiConsole.position) < 4) {
                const consoleUI = document.getElementById('console-ui');
                
                if (!State.isConsoleScreenOpen) {
                    consoleUI.style.display = 'block'; // Mostra la UI Sci-Fi
                    State.isConsoleScreenOpen = true;
                    
                    // Rimuove l'esclamativo se è la prima volta
                    if (!State.hasInteractedWithConsole) {
                        State.hasInteractedWithConsole = true;
                        if (State.consoleIndicator) {
                            State.scifiConsole.remove(State.consoleIndicator);
                            State.ReactorGroup.add(State.consoleIndicator);
                        }
                    }
                } else {
                    consoleUI.style.display = 'none'; // Chiude la UI
                    State.isConsoleScreenOpen = false;
                }
                return; // Esce dalla funzione così non attiva per sbaglio il bottone se fossero vicini
            }

            // Controlliamo la distanza tra player e bottone
            const distance = State.player.position.distanceTo(State.buttonSwitch.position);
            const distance2 = State.player.position.distanceTo(State.buttonSwitch2.position);

            if (distance < 3) { // Se il giocatore è a meno di 3 unità dal bottone

                // --- ANIMAZIONE PREMUTA BOTTONE ---
                if (State.movingButton && State.buttonInitialPos && !State.isButtonAnimating) {
                    State.isButtonAnimating = true;

                    // Di norma nei modelli 3D inclinati a 45°, muovere Y e Z verso il valore negativo
                    // spinge l'oggetto verso l'interno del suo "body".
                    // NOTA: Se noti che si muove al contrario o di lato, prova a cambiare i segni - con + 
                    // o a modificare solo l'asse 'z' o solo l'asse 'y'.
                    new TWEEN.Tween(State.movingButton.position)
                        .to({
                            y: State.buttonInitialPos.y - 0.06, // va leggermente in basso (locale)
                            z: State.buttonInitialPos.z - 0.06  // va leggermente all'indietro (locale)
                        }, 100) // Durata della discesa (100 millisecondi)
                        .easing(TWEEN.Easing.Cubic.Out)
                        .yoyo(true) // Torna indietro alla posizione iniziale automaticamente
                        .repeat(1)  // Ripete il movimento al contrario (andata + ritorno)
                        .onComplete(() => {
                            State.isButtonAnimating = false; // Sblocca l'interruttore alla fine del movimento
                        })
                        .start();
                }

                // --- LOGICA DELLA LUCE 
                State.isLightOn = !State.isLightOn; // Inverte lo stato
                State.interactLight.intensity = State.isLightOn ? 15 : 0; // Accende/Spegne
                if (State.luce){
                    const alarmLamp = State.luce.getObjectByName("lamp")
                    if (alarmLamp){
                        if (State.isLightOn){
                            alarmLamp.material.emissive.setHex(0xff0000); // Rosso
                            alarmLamp.material.emissiveIntensity = 2;
                        } else {
                            alarmLamp.material.emissive.setHex(0x000000); // Nero
                            alarmLamp.material.emissiveIntensity = 2;
                        }
                    }
                }
                console.log("Luce: " + (State.isLightOn ? "Accesa" : "Spenta"));
            }

            if (distance2 < 3) { // Se il giocatore è a meno di 3 unità dal bottone

                // --- ANIMAZIONE PREMUTA BOTTONE ---
                if (State.movingButton2 && State.buttonInitialPos2 && !State.isButtonAnimating2) {
                    State.isButtonAnimating2 = true;
                    new TWEEN.Tween(State.movingButton2.position)
                        .to({
                            y: State.buttonInitialPos2.y - 0.06, // va leggermente in basso (locale)
                            z: State.buttonInitialPos2.z - 0.06  // va leggermente all'indietro (locale)
                        }, 100) // Durata della discesa (100 millisecondi)
                        .easing(TWEEN.Easing.Cubic.Out)
                        .yoyo(true) // Torna indietro alla posizione iniziale automaticamente
                        .repeat(1)  // Ripete il movimento al contrario (andata + ritorno)
                        .onComplete(() => {
                            State.isButtonAnimating2 = false; // Sblocca l'interruttore alla fine del movimento
                        })
                        .start();
                }

                openSciFiDoor(); // Chiama la funzione per aprire la porta
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') State.keys.shift = false;
        State.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('resize', onWindowResize);

    // Blocca il mouse quando si clicca sulla finestra di gioco
    State.renderer.domElement.addEventListener('click', () => {
        State.renderer.domElement.requestPointerLock();
    });

    // Ascolta il movimento del mouse
    window.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === State.renderer.domElement) {
            if (State.isConsoleScreenOpen) return;
            
            // Ruota il player sull'asse Y (sinistra/destra)
            State.player.rotation.y -= e.movementX * 0.002;
            
            // Aggiorna l'inclinazione su/giù (pitch)
            State.cameraPitch -= e.movementY * 0.002;
            // Limita la rotazione per evitare di guardare sotto i piedi o ribaltarsi
            State.cameraPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, State.cameraPitch));
        }
    });
}

function onWindowResize() {
    State.camera.aspect = window.innerWidth / window.innerHeight;
    State.camera.updateProjectionMatrix();
    State.renderer.setSize(window.innerWidth, window.innerHeight);
}