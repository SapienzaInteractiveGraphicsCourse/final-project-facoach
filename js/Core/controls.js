import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import {openSciFiDoor, closeSciFiDoor} from '../Animations/door_animations.js';

// global variables
import {State} from './state.js';

// Inputs management
export function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        //sprint
        if (e.key === 'Shift') State.keys.shift = true;
        //movimento WASD
        State.keys[e.key.toLowerCase()] = true;
        
        //jump
        if (e.key === ' ' && !State.isJumping && !State.isConsoleScreenOpen) {
            State.velocityY = State.jumpForce;
            State.isJumping = true;
        }

        //torchlight
        if (e.key.toLowerCase() === 'e') {
            if (State.isConsoleScreenOpen) return; // block torch toggle if console is open
            State.isLampOn = !State.isLampOn;
            State.playerLamp.intensity = State.isLampOn ? 9 : 0;
            State.playerGlow.intensity = State.isLampOn ? 5 : 0;
            console.log("Lampada: " + (State.isLampOn ? "Accesa" : "Spenta"));
        }

        //object inteeractions
        if (e.key.toLowerCase() === 'f') {

            // take reactor if player is close enough
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
                    return; // "return" stop the function to not activate other interactive objects if they are close
                }
            }

            // place reactor on pedestal if player is close enough
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
                    State.scene.add(State.ReactorGroup); // adds the 3d reactor to pedestal
                    
                    console.log("Reattore collocato con successo!");
                    
                    // Close UI prompt to avoid the [F] message staying on screen
                    const promptUI = document.getElementById('interaction-prompt');
                    if (promptUI) promptUI.style.display = 'none';
                    

                    //Victory UI
                    if (State.victoryUI) State.victoryUI.style.display = 'block';

                    // Hide the controls legend when the reactor is placed
                    const legendUI = document.getElementById('controls-legend');
                    if (legendUI) legendUI.style.display = 'none';


                    return; // "return" stops the function to avoid activating other interactive objects if they are close
                }
            }

            // console log interaction if player is close enough
            if (State.scifiConsole && State.player.position.distanceTo(State.scifiConsole.position) < 4) {
                const consoleUI = document.getElementById('console-ui');
                
                if (!State.isConsoleScreenOpen) {
                    consoleUI.style.display = 'block'; // shows log UI
                    State.isConsoleScreenOpen = true;
                    
                    // Remove the exclamation mark from the console when the player interacts with it for the first time
                    if (!State.hasInteractedWithConsole) {
                        State.hasInteractedWithConsole = true;
                        if (State.consoleIndicator) {
                            State.scifiConsole.remove(State.consoleIndicator);
                            State.ReactorGroup.add(State.consoleIndicator);
                        }
                    }
                } else {
                    consoleUI.style.display = 'none'; // Close UI
                    State.isConsoleScreenOpen = false;
                }
                return; // Return so that other interactive objects are not activated if they are close
            }

            // Check if the player is close enough to the buttons
            const distance = State.player.position.distanceTo(State.buttonSwitch.position);
            const distance2 = State.player.position.distanceTo(State.buttonSwitch2.position);

            if (distance < 3) {

                // animation for button press
                if (State.movingButton && State.buttonInitialPos && !State.isButtonAnimating) {
                    State.isButtonAnimating = true; // locks the button during the movement to avoid multiple activations

                    // button model is 45 degrees rotated, so we need to move it down and back
                    new TWEEN.Tween(State.movingButton.position)
                        .to({
                            y: State.buttonInitialPos.y - 0.06, // goes down
                            z: State.buttonInitialPos.z - 0.06  // goes back
                        }, 100) //100 milliseconds for the movement
                        .easing(TWEEN.Easing.Cubic.Out)
                        .yoyo(true) // goes back automatically to the initial position
                        .repeat(1)  // going back does the same animation
                        .onComplete(() => {
                            State.isButtonAnimating = false; // unlocks the button at the end of the movement too activate it again
                        })
                        .start();
                }

                // the interactive light is activated by the button press
                State.isLightOn = !State.isLightOn; // change state of the light
                State.interactLight.intensity = State.isLightOn ? 15 : 0; // on/off the light by changin g its intensity
                if (State.luce){
                    const alarmLamp = State.luce.getObjectByName("lamp")
                    if (alarmLamp){
                        if (State.isLightOn){
                            alarmLamp.material.emissive.setHex(0xff0000); // red
                            alarmLamp.material.emissiveIntensity = 2;
                        } else {
                            alarmLamp.material.emissive.setHex(0x000000); //black
                            alarmLamp.material.emissiveIntensity = 2;
                        }
                    }
                }
                console.log("Luce: " + (State.isLightOn ? "Accesa" : "Spenta"));
            }

            //second button for the door
            if (distance2 < 3) { 

                // aniamtion for button press, like before
                if (State.movingButton2 && State.buttonInitialPos2 && !State.isButtonAnimating2) {
                    State.isButtonAnimating2 = true;
                    new TWEEN.Tween(State.movingButton2.position)
                        .to({
                            y: State.buttonInitialPos2.y - 0.06, 
                            z: State.buttonInitialPos2.z - 0.06  
                        }, 100) 
                        .easing(TWEEN.Easing.Cubic.Out)
                        .yoyo(true) 
                        .repeat(1)  
                        .onComplete(() => {
                            State.isButtonAnimating2 = false; 
                        })
                        .start();
                }

                openSciFiDoor(); // calls the function that opens the door
            }
        }
    });
    //keys release
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') State.keys.shift = false;
        State.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('resize', onWindowResize);

    // locks mouse movement wwhen a log is open
    State.renderer.domElement.addEventListener('click', () => {
        State.renderer.domElement.requestPointerLock();
    });

    // mouse movement
    window.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === State.renderer.domElement) {
            if (State.isConsoleScreenOpen) return;
            
            // rotate player left/right
            State.player.rotation.y -= e.movementX * 0.002;
            
            // moves camera up/down
            State.cameraPitch -= e.movementY * 0.002;
            // limits rotation to avoid camera flipping upside down
            State.cameraPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, State.cameraPitch));
        }
    });
}

function onWindowResize() {
    State.camera.aspect = window.innerWidth / window.innerHeight;
    State.camera.updateProjectionMatrix();
    State.renderer.setSize(window.innerWidth, window.innerHeight);
}