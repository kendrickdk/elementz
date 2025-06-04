// main.ts - Entry point for the Phaser game
console.log(">>> main.ts is running!");

import Phaser from "phaser";           // Import Phaser engine
import PlayScene from "./scenes/PlayScene"; // Import our custom game scene
import { Colors } from "./constants/colors";

// Game configuration object
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,                   // Auto-detect WebGL or Canvas
  width: 1024,                         // Game width in pixels
  height: 768,                         // Game height in pixels
  backgroundColor: Colors.background,  // Use centralized color constant
  scene: [PlayScene],                  // List of scenes to load
  physics: {
    default: "arcade",                 // Use Arcade Physics (simple physics)
    arcade: { debug: false }           // Turn off physics debug graphics
  }
};

// Start the game using the config above
new Phaser.Game(config);
