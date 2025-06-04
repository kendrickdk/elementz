import Phaser from "phaser";

/**
 * InputConfig centralizes all key bindings for player controls.
 * Each action supports multiple key codes (e.g., W and Up Arrow for up).
 */
export const InputConfig = {
  upKeys: [Phaser.Input.Keyboard.KeyCodes.E, Phaser.Input.Keyboard.KeyCodes.UP],
  downKeys: [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.DOWN],
  leftKeys: [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.LEFT],
  rightKeys: [Phaser.Input.Keyboard.KeyCodes.F, Phaser.Input.Keyboard.KeyCodes.RIGHT],
};
