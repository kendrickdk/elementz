// src/constants/inputConfig.ts

/**
 * Centralized key mapping for movement and controls.
 * Change these values to customize your controls for the whole game.
 * 
 * - 'up', 'down', 'left', 'right' correspond to camera/grid movement.
 * - Use single characters: e.g., 'E', 'D', 'S', 'F', 'W', 'A', etc.
 * - This makes it easy to remap keys without digging into scene/game code.
 */

export const InputKeys = {
  up: 'E',     // Move up (camera or player)
  down: 'D',   // Move down
  left: 'S',   // Move left
  right: 'F',  // Move right
  accelerate: "A",  // Accelerate
  recenter: 'HOME', // Re-enter the game 
};

