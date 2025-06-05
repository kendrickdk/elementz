// src/entities/FancyHub.ts

import Phaser from "phaser";
import { GridConfig } from "../constants/config";

/**
 * Draws a fancy pulsing hub at (x, y) on the supplied Graphics object.
 * Call this from your scene or anywhere you want a fancy hub!
 */
export function drawFancyHub(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  time: number
) {
  // --- 1. Pulsing Center Circle ---
  const t = time / 700;
  const pulse = 1 + 0.09 * Math.sin(t);

  const centerRadius = (GridConfig.cellSize * GridConfig.centerHubCells) / 2 * 0.92 * pulse;
  const glowRadius = centerRadius * 1.24 * (1 + 0.1 * Math.sin(t * 1.8));

  // Draw glow
  graphics.fillStyle(GridConfig.centerHubColor, 0.18 + 0.08 * Math.abs(Math.sin(t * 1.2)));
  graphics.fillCircle(x, y, glowRadius);

  // Draw main hub
  graphics.fillStyle(GridConfig.centerHubColor, 1);
  graphics.fillCircle(x, y, centerRadius);

  // Draw white border
  graphics.lineStyle(GridConfig.centerHubBorder, 0xabb1e3, 0.7);
  graphics.strokeCircle(x, y, centerRadius);

  // --- 2. Surrounding Ring of Circles ---
 /*  const ringRadius = centerRadius + GridConfig.cellSize * 0.6;
  const smallCircleRadius = GridConfig.cellSize * 0.6;

  for (let i = 0; i < 8; i++) {
    const angle = Phaser.Math.DegToRad(i * 45);
    const cx = x + Math.cos(angle) * ringRadius;
    const cy = y + Math.sin(angle) * ringRadius;
    graphics.fillStyle(GridConfig.centerHubColor, 0.72 + 0.25 * Math.abs(Math.sin(t + i)));
    graphics.fillCircle(cx, cy, smallCircleRadius);
    graphics.lineStyle(2, "#ffffff", 0.6);
    graphics.strokeCircle(cx, cy, smallCircleRadius);
  }

*/
}

