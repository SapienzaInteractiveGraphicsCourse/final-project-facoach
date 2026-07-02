import * as THREE from 'three';

//global state object to hold all the variables that need to be accessed across different modules
export const State = {

  // Core / Engine
  scene: null,
  camera: null,
  renderer: null,
  textureLoader: null,
  loadingManager: null,
  player: null,
  sunLight: null,            // directional gloobal light

  // --- Physics and movement
  velocityY: 0,
  isJumping: false,

  // --- Collision geometry
  platforms: [],
  walls: [],
  door: null,
  doorOriginalY: null,       // initial height of the door
  doorTween: null,
  isDoorOpen: false,         // door moovement state

  // --- Materials
  starMaterial: null,
  wireMaterial: null,

  // --- Solar system objects and black hole
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

  // --- player components
  leftArm: null,
  rightArm: null,
  leftLeg: null,
  rightLeg: null,

  // --- Interactive elements
  s1: null,
  s2: null,
  crystal1: null,
  crystal2: null,
  buttonSwitch: null,        // button 3d model
  buttonSwitch2: null,       // button 3d model
  interactLight: null,       
  isLightOn: false,
  luce: null,                // interactive light
  playerGlow: null,          // light from the player
  playerLamp: null,          // player torchlight
  isLampOn: false,
  sensors: [],               // Array di sensori

  movingButton: null,
  movingButton2: null,
  buttonInitialPos: null,
  buttonInitialPos2: null,
  isButtonAnimating: false, 
  isButtonAnimating2: false,

  // --- hologram
  holoSystem: null,

  // --- Radar 
  radarBlip: null,           // 3d dot on the radar
  blipTimer: 0,              // manage how often the blip appears

  // --- Console sci-fi
  scifiConsole: null,        // 3d model
  consoleIndicator: null,    // Exclamation point on the console
  isConsoleScreenOpen: false,
  hasInteractedWithConsole: false,

  // --- Reactor and pedestal
  ReactorGroup: null,        // Reactor group (needed as group to add ! after)
  ReactorModel: null,
  isReactorPickedUp: false,
  reactorPedestal: null,     // reactor pedestal group
  isReactorPlaced: false,

  // --- Spaceship parts
  spoke1: null,              // centrifuge supports
  spoke2: null,
  floorDisk: null,           // pavement disk that needs collision

  // --- Camera
  cinematicAngle: 0,
  cameraPitch: 0,            // inclination of the camera (up and down)


  // -------------------------------------------------------------
  //  Constants

  // keyboard inputs
  keys: { w: false, a: false, s: false, d: false, shift: false },

  // Physics constants
  gravity: -0.01,
  jumpForce: 0.26,
  clock: new THREE.Clock(),

  // animated arrays
  activePipes: [],        // tubes with moving textures
  serverLEDs: [],        // Mainframe with blinking LEDs
  animatedScreens: [],    // console screens with animated texts

  // Camera constants
  idealCameraDistance: 5, // base distance from the player
  minCameraDistance: 1,   // maximum approach to the player
  cameraHeightOffset: 2,  // base height from ground
  cameraRaycaster: new THREE.Raycaster(),

  // DOM references
  promptUI: document.getElementById('interaction-prompt'),
  victoryUI: document.getElementById('victory-screen'),
};