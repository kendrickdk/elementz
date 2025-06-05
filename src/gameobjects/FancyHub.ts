// src/gameobjects/FancyHub.ts

import Phaser from "phaser";
import { GridConfig } from "../constants/config";

/**
 * Draws a fancy animated hub at (x, y) on the provided graphics object.
 * Call this from your scene's draw method every frame for animation.
 * @param graphics - Phaser Graphics object to draw on
 * @param x - X position (usually 0 for center)
 * @param y - Y position (usually 0 for center)
 * @param time - Current time, for animation (pass scene.time.now)
 */
export function drawFancyHub(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  time: number
) {
  // --- 1. Pulsing Center Circle ---
  // Pulsing animation for glow
  const t = time / 700;
  const pulse = 1 + 0.09 * Math.sin(t);

  // Compute center and glow radii based on config and pulse
  const centerRadius = (GridConfig.cellSize * GridConfig.centerHubCells) / 2 * 0.92 * pulse;
  const glowRadius = centerRadius * 1.24 * (1 + 0.1 * Math.sin(t * 1.8));

  // Draw glow behind the main hub
  graphics.fillStyle(GridConfig.centerHubColor, 0.18 + 0.08 * Math.abs(Math.sin(t * 1.2)));
  graphics.fillCircle(x, y, glowRadius);

  // Draw main hub circle
  graphics.fillStyle(GridConfig.centerHubColor, 1);
  graphics.fillCircle(x, y, centerRadius);

  // Draw colored border for hub
  graphics.lineStyle(GridConfig.centerHubBorder, 0x172bc5, 0.7); // Border color and opacity
  graphics.strokeCircle(x, y, centerRadius);

}


