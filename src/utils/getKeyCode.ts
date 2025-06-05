import Phaser from "phaser";

/**
 * Utility for keycodes (letters and special keys).
 */
export function getKeyCode(key: string): number | undefined {
  // Cast KeyCodes to an object that accepts string indexes
  const keyCodes = Phaser.Input.Keyboard.KeyCodes as { [key: string]: number };
  return keyCodes[key.toUpperCase()] || keyCodes[key];
}
