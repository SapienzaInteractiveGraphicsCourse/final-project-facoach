// =============================================================
//  state.js  —  Sorgente unica della verità (single source of truth)
// =============================================================
//
//  REGOLA D'ORO (mappata 1:1 sul tuo main.js attuale):
//
//   • Ciò che nel main.js era `const`  ->  resta un export NUDO qui sotto.
//     In main.js NON cambi nulla: continui a scrivere `keys.w`, `gravity`,
//     `activePipes.push(...)`. Funziona perché sono riferimenti/costanti
//     che non riassegni mai, e il "live binding" dei moduli ES li tiene
//     sempre aggiornati in tempo reale.
//
//   • Ciò che nel main.js era `let`  ->  finisce dentro l'oggetto `State`.
//     Questi sono gli unici che richiedono il prefisso. Due casi:
//       - PRIMITIVI che riassegni (velocityY, i flag, i contatori):
//         scrivi sempre `State.velocityY = 0`, `State.isLampOn = true`, ...
//       - RIFERIMENTI a oggetti (scene, player, le mesh, gli array):
//         li CREI una sola volta con `State.scene = new THREE.Scene()`,
//         e in ogni funzione che li USA aggiungi in cima una riga di
//         destructuring -> `const { scene, player, platforms } = State;`
//         così il corpo della funzione resta INVARIATO.
//
// =============================================================

import * as THREE from 'three';

// -------------------------------------------------------------
//  STATE  —  tutto ciò che era `let` nel main.js (lo stato mutabile)
// -------------------------------------------------------------
export const State = {

  // --- Core / Engine ---------------------------------------
  scene: null,
  camera: null,
  renderer: null,
  textureLoader: null,
  loadingManager: null,
  player: null,
  sunLight: null,            // Luce direzionale (il "Sole")

  // --- Fisica e movimento ----------------------------------
  velocityY: 0,
  isJumping: false,

  // --- Geometria del livello (collisioni) ------------------
  platforms: [],
  walls: [],
  door: null,
  doorOriginalY: null,       // Altezza esatta della porta chiusa
  doorTween: null,
  isDoorOpen: false,         // La porta è in transizione o aperta?

  // --- Materiali condivisi ---------------------------------
  starMaterial: null,
  wireMaterial: null,

  // --- Sistema celeste -------------------------------------
  planet: null,
  planet2: null,
  planet3: null,
  planet4: null,
  planet5: null,
  planet6: null,
  sunMesh: null,
  sunPivot1: null,
  sunPivot2: null,
  sunPivot3: null,
  sunPivot4: null,
  sunPivot5: null,
  binaryPivot: null,
  sunPosition: null,
  sunPointLight: null,
  solarFlares: null,
  moonPivot: null,
  moon: null,
  blackHoleGroup: null,
  accretionDisk: null,
  galaxy: null,
  galaxies: [],
  cometOrbitGroup: null,
  cometGroup: null,
  cometTail: null,

  // --- Avatar del giocatore (parti animate) ----------------
  leftArm: null,
  rightArm: null,
  leftLeg: null,
  rightLeg: null,

  // --- Interazione: cristalli, pulsanti, luci, sensori -----
  s1: null,
  s2: null,
  crystal1: null,
  crystal2: null,
  buttonSwitch: null,        // Oggetto 3D
  buttonSwitch2: null,       // Oggetto 3D
  interactLight: null,       // La luce che attiviamo
  isLightOn: false,
  luce: null,                // Luce interattiva
  playerGlow: null,          // Luce soffusa intorno al player
  playerLamp: null,          // La torcia del giocatore
  isLampOn: false,
  sensors: [],               // Array di sensori

  movingButton: null,
  movingButton2: null,
  buttonInitialPos: null,
  buttonInitialPos2: null,
  isButtonAnimating: false,  // Anti-spam tasto F durante il movimento
  isButtonAnimating2: false,

  // --- Tavolo ologrammi ------------------------------------
  holoSystem: null,

  // --- Radar -----------------------------------------------
  radarBlip: null,           // Oggetto 3D del puntino
  blipTimer: 0,              // Gestisce il tempo del lampeggio

  // --- Console sci-fi --------------------------------------
  scifiConsole: null,        // Modello 3D della console
  consoleIndicator: null,    // Flag visivo (!)
  isConsoleScreenOpen: false,
  hasInteractedWithConsole: false,

  // --- Reattore e centrifuga -------------------------------
  ReactorGroup: null,        // Gruppo del modello del reattore
  ReactorModel: null,
  isReactorPickedUp: false,
  reactorPedestal: null,     // Gruppo dell'intero piedistallo
  isReactorPlaced: false,
  spoke1: null,              // Supporti dell'anello centrifuga
  spoke2: null,
  floorDisk: null,           // Disco del pavimento che si solleva

  // --- Camera ----------------------------------------------
  cinematicAngle: 0,
  cameraPitch: 0,            // Inclinazione su/giù



  // -------------------------------------------------------------
  //  CONFIG e CONTENITORI  —  tutto ciò che era `const` nel main.js
  //  Export NUDI: in main.js li usi senza prefisso, esattamente come ora.
  // -------------------------------------------------------------

  // Input da tastiera (mutato per riferimento: keys.w = true)
  keys: { w: false, a: false, s: false, d: false, shift: false },

  // Costanti fisiche
  gravity: -0.01,
  jumpForce: 0.26,
  clock: new THREE.Clock(),

  // Array animati (riempiti con .push(), iterati nel loop)
  activePipes: [],        // Texture dei tubi da scorrere
  serverLEDs: [],        // LED del mainframe da far lampeggiare
  animatedScreens: [],    // Schermi da aggiornare ogni frame

  // Costanti della camera
  idealCameraDistance: 5, // Distanza base (Z=5)
  minCameraDistance: 1,   // Avvicinamento massimo al player
  cameraHeightOffset: 2,  // Altezza base (Y=2)
  cameraRaycaster: new THREE.Raycaster(),

  // Riferimenti al DOM (gli script type="module" sono "deferred":
  // il DOM è già pronto quando questo file viene eseguito)
  promptUI: document.getElementById('interaction-prompt'),
  victoryUI: document.getElementById('victory-screen'),
};