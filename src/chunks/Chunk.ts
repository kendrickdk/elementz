// Chunk.ts - Represents a single chunk of the grid (32x32 cells)

import Phaser from "phaser";
import { hexToNumber } from "../utils/colorUtils";
import { Colors } from "../constants/colors";
import { GridConfig, ChunkConfig } from "../constants/config";

export default class Chunk {
  scene: Phaser.Scene;
  col: number;  // Chunk column index in the world grid
  row: number;  // Chunk row index in the world grid
  container: Phaser.GameObjects.Container; // Container holding all display objects for this chunk
  graphics: Phaser.GameObjects.Graphics;   // Graphics object used to draw the grid cells
  gridSize: number;                        // Size of each grid cell in pixels

  constructor(scene: Phaser.Scene, col: number, row: number) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.gridSize = GridConfig.size;

    // Position the container according to chunk coordinates
    this.container = this.scene.add.container(
      this.col * this.gridSize * ChunkConfig.cols,
      this.row * this.gridSize * ChunkConfig.rows
    );

    // Create a Graphics object inside the container to draw the grid and center block
    this.graphics = this.scene.add.graphics();
    this.container.add(this.graphics);

    // Draw the grid cells and center block
    this.drawGrid();
  }

  drawGrid() {
    // Determine the corner radius for rounded corners once
    const cornerRadius = Math.min(GridConfig.cornerRadius, this.gridSize / 2);

    // Clear previous drawings before drawing anew
    this.graphics.clear();

    // Draw grid only if enabled in config
    if (GridConfig.showGrid) {
      // Convert the grid line color hex string to a number Phaser can use
      const gridLineColorNum = hexToNumber(Colors.gridLines);

      // Set the line style for grid cell borders (width and color)
      this.graphics.lineStyle(1, gridLineColorNum);

      // Draw each grid cell as rounded rectangles
      for (let y = 0; y < ChunkConfig.rows; y++) {
        for (let x = 0; x < ChunkConfig.cols; x++) {
          const px = x * this.gridSize;
          const py = y * this.gridSize;

          this.graphics.strokeRoundedRect(px, py, this.gridSize, this.gridSize, cornerRadius);
        }
      }
    }

    // Calculate top-left cell of the 4x4 center block
    const centerCol = Math.floor(ChunkConfig.cols / 2) - 2; // half of 4
    const centerRow = Math.floor(ChunkConfig.rows / 2) - 2;

    // Calculate pixel position and size of the center block
    const blockX = centerCol * this.gridSize;
    const blockY = centerRow * this.gridSize;
    const blockWidth = 4 * this.gridSize;
    const blockHeight = 4 * this.gridSize;

    // Convert center block fill color from hex to number
    const fillColorNum = hexToNumber(Colors.centerBlockFillColor);
    // Get fill alpha (opacity) from config
    const fillAlpha = Colors.centerBlockFillAlpha;
    // Convert center block stroke color from hex to number
    const strokeColorNum = hexToNumber(Colors.centerBlockStrokeColor);

    // Draw the filled rounded rectangle for the center block with opacity
    this.graphics.fillStyle(fillColorNum, fillAlpha);
    this.graphics.fillRoundedRect(blockX, blockY, blockWidth, blockHeight, cornerRadius);

    // Draw the stroke around the center block
    this.graphics.lineStyle(4, strokeColorNum);   // Stroke width and color
    this.graphics.strokeRoundedRect(blockX, blockY, blockWidth, blockHeight, cornerRadius);
  }
}



