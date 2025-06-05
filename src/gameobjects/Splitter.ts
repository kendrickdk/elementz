import Phaser from "phaser";

/**
 * Draw a Shapez-style splitter at (x, y).
 */
export function drawSplitter(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  options?: { color?: number; highlight?: boolean }
) {
  const c = options?.color || 0xcccccc;
  if (options?.highlight) {
    graphics.lineStyle(8, 0xffffff, 1);
    graphics.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 12);
  }
  graphics.lineStyle(3, 0x555555, 1);
  graphics.fillStyle(c, 1);
  graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);
  graphics.lineBetween(x, y - size / 2, x, y - size * 0.85);
  graphics.lineBetween(x - size / 3, y + size / 2, x - size / 3, y + size * 0.85);
  graphics.lineBetween(x + size / 3, y + size / 2, x + size / 3, y + size * 0.85);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(x, y, size * 0.18);
}
