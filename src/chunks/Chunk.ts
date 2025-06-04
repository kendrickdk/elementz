import Phaser from "phaser";
import { hexToNumber } from "../utils/colorUtils";
import { Colors } from "../constants/colors";
import { GridConfig, ChunkConfig } from "../constants/config";

interface CenterBlockInfo {
  startCol: number;
  startRow: number;
  cols: number;
  rows: number;
}

/**
 * Chunk draws grid cells for a chunk and skips cells inside the global center block.
 */
export default class Chunk {
  scene: Phaser.Scene;
  col: number;
  row: number;
  container: Phaser.GameObjects.Container;
  graphics: Phaser.GameObjects.Graphics;
  gridSize: number;
  centerBlockInfo?: CenterBlockInfo;

  constructor(scene: Phaser.Scene, col: number, row: number, centerBlockInfo?: CenterBlockInfo) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.gridSize = GridConfig.size;
    this.centerBlockInfo = centerBlockInfo;

    this.container = this.scene.add.container(
      this.col * this.gridSize * ChunkConfig.cols,
      this.row * this.gridSize * ChunkConfig.rows
    );

    console.log(`Chunk created at col: ${col}, row: ${row}, container position: x=${this.container.x}, y=${this.container.y}`);

    this.graphics = this.scene.add.graphics();
    this.container.add(this.graphics);

    this.drawGrid();
  }

  drawGrid() {
    const cornerRadius = Math.min(GridConfig.cornerRadius, this.gridSize / 2);
    this.graphics.clear();

    if (GridConfig.showGrid) {
      const gridLineColorNum = hexToNumber(Colors.gridLines);
      this.graphics.lineStyle(1, gridLineColorNum);

      // Destructure center block info or set default to skip nothing
      const {
        startCol = Number.MIN_SAFE_INTEGER,
        startRow = Number.MIN_SAFE_INTEGER,
        cols: centerCols = 0,
        rows: centerRows = 0,
      } = this.centerBlockInfo ?? {};

      for (let y = 0; y < ChunkConfig.rows; y++) {
        for (let x = 0; x < ChunkConfig.cols; x++) {
          const globalX = this.col * ChunkConfig.cols + x;
          const globalY = this.row * ChunkConfig.rows + y;

          // Skip grid cells inside the global center block
          if (
            globalX >= startCol &&
            globalX < startCol + centerCols &&
            globalY >= startRow &&
            globalY < startRow + centerRows
          ) {
            continue; // skip drawing this cell
          }

          const px = x * this.gridSize;
          const py = y * this.gridSize;

          this.graphics.strokeRoundedRect(px, py, this.gridSize, this.gridSize, cornerRadius);
        }
      }
    }
  }
}
