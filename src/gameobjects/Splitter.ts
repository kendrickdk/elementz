// src/gameobjects/Splitter.ts

import Phaser from "phaser";

/**
 * Draws a simple Shapez-style splitter at (x, y) on the given graphics object.
 */
export function drawSplitter(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  options?: { color?: number; highlight?: boolean }
) {
  const c = options?.color || 0xcccccc;
  // Main body
  graphics.lineStyle(3, 0x555555, 1);
  graphics.fillStyle(c, 1);
  graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);

  // Input line
  graphics.lineBetween(x, y - size / 2, x, y - size * 0.85);

  // Output lines (split)
  graphics.lineBetween(x - size / 3, y + size / 2, x - size / 3, y + size * 0.85);
  graphics.lineBetween(x + size / 3, y + size / 2, x + size / 3, y + size * 0.85);

  // Center circle (indicator)
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(x, y, size * 0.18);
}
