// PlayScene.ts - Main play scene for Elementz with clean, maintainable code

import Phaser from "phaser";
import { Colors } from "../constants/colors";
import { hexToNumber } from "../utils/colorUtils";
import { GridConfig, FontStyles } from "../constants/config";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    // Register scene key 'PlayScene'
    super("PlayScene");
  }

  create() {
    // Retrieve grid settings
    const gridSize = GridConfig.size;
    const cols = GridConfig.cols;
    const rows = GridConfig.rows;

    // Create graphics object for drawing the grid lines
    const graphics = this.add.graphics({
      lineStyle: { width: 1, color: 0x333355 } // Thin, dark blue grid lines
    });

    // Draw vertical grid lines
    for (let x = 0; x <= cols; x++) {
      graphics.lineBetween(
        x * gridSize, 0,                  // Start point (top)
        x * gridSize, rows * gridSize     // End point (bottom)
      );
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= rows; y++) {
      graphics.lineBetween(
        0, y * gridSize,                  // Start point (left)
        cols * gridSize, y * gridSize     // End point (right)
      );
    }

    // Convert proton color string to number for Phaser
    const protonColorNum = hexToNumber(Colors.proton);

    // Add a proton node: pinkish-red circle centered in the 4th column, 5th row
    const proton = this.add.circle(
      3 * gridSize + gridSize / 2,        // X position (column * gridSize + half tile)
      4 * gridSize + gridSize / 2,        // Y position (row * gridSize + half tile)
      24,                                 // Radius in pixels
      protonColorNum                      // Fill color
    );

    // Label the proton node with "P", centered over the circle
    this.add.text(
      proton.x - 12,                      // Adjust X to center text horizontally
      proton.y - 16,                      // Adjust Y to center text vertically
      "P",                               // Text content
      FontStyles.protonLabel             // Font style for proton label
    );

    // -------------------
    // Center 3x3 Circle Block
    // -------------------

    // Calculate top-left cell of the center 3x3 block
    const centerCol = Math.floor(cols / 2) - 1;
    const centerRow = Math.floor(rows / 2) - 1;

    // Calculate pixel position of the top-left corner of the center block
    const centerBlockX = centerCol * gridSize;
    const centerBlockY = centerRow * gridSize;

    // Calculate the pixel coordinates for the center of the 3x3 block
    const centerX = centerBlockX + (3 * gridSize) / 2;
    const centerY = centerBlockY + (3 * gridSize) / 2;

    // Calculate radius for the big center circle to fill the 3x3 block
    const centerRadius = (3 * gridSize) / 2;

    // Convert center circle colors to numeric format
    const centerCircleColorNum = hexToNumber(Colors.centerCircleFill);
    const centerCircleStrokeColorNum = hexToNumber(Colors.centerCircleStroke);

    // Draw the large yellow center circle
    const centerCircle = this.add.circle(centerX, centerY, centerRadius, centerCircleColorNum);

    // Add an orange stroke/border for visibility
    centerCircle.setStrokeStyle(4, centerCircleStrokeColorNum);

    // Add "CENTER" label text over the circle, centered nicely
    this.add.text(
      centerX - 24,                      // X position adjustment to center text
      centerY - 18,                      // Y position adjustment to center text
      "CENTER",                         // Label text
      FontStyles.label                  // Font style for general labels
    );
  }
}
