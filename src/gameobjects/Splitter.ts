import Phaser from "phaser";

/**
 * Draws a splitter centered at (0, 0) on the given graphics object.
 * Does NOT handle positioning or rotation — caller handles that.
 */
export function drawSplitter(
  graphics: Phaser.GameObjects.Graphics,
  size: number,
  options?: { color?: number; highlight?: boolean }
) {
  const c = options?.color || 0xcccccc;

  graphics.lineStyle(3, 0x555555, 1);
  graphics.fillStyle(c, 1);
  graphics.fillRoundedRect(-size / 2, -size / 2, size, size, 12);

  graphics.lineBetween(0, -size / 2, 0, -size * 0.85);
  graphics.lineBetween(-size / 3, size / 2, -size / 3, size * 0.85);
  graphics.lineBetween(size / 3, size / 2, size / 3, size * 0.85);

  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, size * 0.18);
}
