import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import { Colors } from "./constants/colors";

/**
 * Phaser game configuration object
 */
const config: Phaser.Types.Core.GameConfig = {
  // Renderer type: automatically choose WebGL or Canvas
  type: Phaser.AUTO,

  // Initial width and height of the game canvas, set to browser window size
  width: window.innerWidth,
  height: window.innerHeight,

  // Background color of the game canvas, from centralized colors config
  backgroundColor: Colors.background,

  // Scenes to load in the game; currently only PlayScene
  scene: [PlayScene],

  // Physics engine configuration (Arcade physics with debug disabled)
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },

  // Scale manager config to handle resizing and centering
  scale: {
    mode: Phaser.Scale.RESIZE,          // Automatically resize canvas on window size changes
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the canvas horizontally and vertically
  }
};

// Create the Phaser game instance with the above config
const game = new Phaser.Game(config);

// Optional: Listen for window resize events to handle additional resizing logic
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

