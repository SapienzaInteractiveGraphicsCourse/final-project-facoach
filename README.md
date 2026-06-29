# 🌌 Lumen Drift

Final project for the **Interactive Graphics** course, Sapienza University of Rome (A.Y. 2025/2026).  
Professor: **Marco Schaerf**

---

## 🎮 Play the Game

▶ **[Click here to play Lumen Drift](https://sapienzainteractivegraphicscourse.github.io/final-project-facoach/)**

⏳ *The game may take a few moments to load. Space systems, high-fidelity textures, and 3D assets are being initialized. Thank you for your patience!*

---

## 📝 Game Description

**Lumen Drift** is an interactive 3D sci-fi exploration game built completely in WebGL. The player wakes up inside a spaceship powered by a central reactor core, that lost its power source because of a massive black hole. 

The core gameplay revolves around the **manipulation of light**. The player must use their flashlight to solve puzzles and unlock hidden pathways and progress through the environment, to retrieve the spaceship power source and escape.

---

## 📁 Project Structure

The codebase is modularly organized following a clean architecture to separate concerns, making it highly scalable and optimized for rendering:

```text
├── index.html          # Entry point and HTML overlay structures
├── style.css           # Aestethic for HTML
└──js
    ├── main.js             # Engine and renderer initialization, and main animation loop
    ├── Core/                # Modules dedicated to core mechanics
    │   ├── state.js            # Global database sharing state across all modules
    │   ├── controls.js         # Input listeners (keyboard, mouse, flashlight toggles)
    │   └── utils.js            # Shared  raycasting utilities
    │
    ├── Environment/        # Modules dedicated to procedural generation & world-building
    │   ├── room_props.js          # Mainframe, reactor core, consoles, cryopods, and interactive meshes
    │   ├── spaceship.js           # Structural walls, corridor pathways, and spaceship hull exterior
    │   ├── space_props.js         # Procedural starfield, stellar dust, and black hole systems
    │   ├── solar_system.js        # Fully animated orbital solar system
    │   └── walls_platforms.js     # Collision walls and dynamic interactive platforms
    │
    └── Animations/         # Modules handling visual behavior
        ├── celestial_bodies_animations.js # Solar orbits, comet paths, and black hole gravitational accretion
        ├── door_animations.js             # Eased animations for the sci-fi door
        ├── player_animations.js           # Smooth camera, motion management
        ├── props_animations.js            # Blinking server LEDs, rotating radar dishes, and aesthetic props
        ├── interactive_animations.js      # Light intensity triggers, sensor logic, and puzzle state checks
        ├── physics_animations.js          # collision detection and gravity calculations
        └── UI_animations.js               # HUD updates, game menus and victory overlays
```

## 🕹️ Gameplay & Mechanics

* **The first room Puzzle:** The central door remains locked until both light sensors are simultaneously activated by a light source.
* **Tricky Platforms:** Parkour section with structural platforms that are solid and visible only either when kept in the dark oor when illuminated wwwith a flasshlight. Shining your lamp on them will make them dissolve or make them appear, risking to fall into the void.
* **Cosmos:** A fully simulated solar system,  a roaming comet, and a custom particle-based black hole.

---

## 🚦 Controls

| Key / Input | Action |
| :--- | :--- |
| **W A S D** | Move Player (Forward / Left / Backward / Right) |
| **Shift** | Sprint |
| **Space** | Jump |
| **Mouse** | Look around (Third-Person View) |
| **E** | Toggle Portable Lamp (Flashlight) On/Off |
| **F** | Interact with world consoles and terminal elements |

---

## 📚 Libraries Used

* **[Three.js](https://threejs.org/)** — Core WebGL 3D rendering engine, materials, lights, and scene management.

---

## 👥 Author

* **Fabio Falconi** — *Sapienza University of Rome*

---
