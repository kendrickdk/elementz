import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig } from "../constants/config";

/**
 * Utility function to get the Phaser key code from a single character.
 * Keeps input mapping flexible by only dealing with letters in config.
 */
function getKeyCode(key: string) {
  return Phaser.Input.Keyboard.KeyCodes[key.toUpperCase()];
}

export default class PlayScene extends Phaser.Scene {
  // Graphics object for grid lines
  private gridGraphics!: Phaser.GameObjects.Graphics;

  // Graphics object for the central hub (center square)
  private centerSquare!: Phaser.GameObjects.Graphics;

  // Holds references to movement keys (custom + arrows)
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Cache settings for easier reference (values come from config)
  private gridSize = GridConfig.cellSize;
  private centerHubCells = GridConfig.centerHubCells;
  private centerHubRadius = GridConfig.centerHubRadius;
  private cameraSpeed = CameraConfig.moveSpeed;

  // Dynamic getters for hub boundaries, always centered at (0,0)
  private get centerLeft() { return -this.centerHubCells / 2; }
  private get centerRight() { return this.centerHubCells / 2; }
  private get centerTop() { return -this.centerHubCells / 2; }
  private get centerBottom() { return this.centerHubCells / 2; }

  /**
   * Called when the scene is created.
   * Sets up camera, grid, input, and draws the initial grid and hub.
   */
  create() {
    // Center the camera at (0,0) for symmetric infinite scrolling
    this.cameras.main.centerOn(0, 0);

    // Create persistent graphics objects (don't recreate in update)
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Create movement key listeners from input config and add arrow key fallback
    this.keys = this.input.keyboard.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
    }) as any;
    this.cursors = this.input.keyboard.createCursorKeys();

    // Draw the grid and the center hub on startup
    this.drawVisibleGrid();
    this.drawCenterSquare();
  }

  /**
   * Called every frame.
   * Handles camera movement and grid redraws.
   */
  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Move camera based on key presses (custom or arrow keys)
    if (this.keys.up.isDown || this.cursors.up.isDown) {
      cam.scrollY -= this.cameraSpeed; // Scroll camera up
      moved = true;
    }
    if (this.keys.down.isDown || this.cursors.down.isDown) {
      cam.scrollY += this.cameraSpeed; // Scroll camera down
      moved = true;
    }
    if (this.keys.left.isDown || this.cursors.left.isDown) {
      cam.scrollX -= this.cameraSpeed; // Scroll camera left
      moved = true;
    }
    if (this.keys.right.isDown || this.cursors.right.isDown) {
      cam.scrollX += this.cameraSpeed; // Scroll camera right
      moved = true;
    }

    // Only redraw grid if camera moved (for best performance)
    if (moved) {
      this.drawVisibleGrid();
    }
  }

  /**
   * Draws the visible grid based on current camera position.
   * Grid lines are skipped inside the central hub area for visual clarity.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();

    // If grid is disabled in config, don't draw anything
    if (!GridConfig.showGrid) return;

    // Set grid line style based on config
    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.5 // Alpha (opacity)
    );

    const cam = this.cameras.main;

    // Calculate which grid lines are visible on the screen (plus a margin)
    const left = Math.floor(cam.scrollX / this.gridSize) - 1;
    const right = Math.ceil((cam.scrollX + cam.width) / this.gridSize) + 1;
    const top = Math.floor(cam.scrollY / this.gridSize) - 1;
    const bottom = Math.ceil((cam.scrollY + cam.height) / this.gridSize) + 1;

    // Draw vertical lines, skipping those inside the hub region
    for (let x = left; x <= right; x++) {
      if (x >= this.centerLeft && x < this.centerRight) continue; // Skip hub area
      const px = x * this.gridSize;
      this.gridGraphics.moveTo(px, top * this.gridSize);
      this.gridGraphics.lineTo(px, bottom * this.gridSize);
    }

    // Draw horizontal lines, skipping those inside the hub region
    for (let y = top; y <= bottom; y++) {
      if (y >= this.centerTop && y < this.centerBottom) continue; // Skip hub area
      const py = y * this.gridSize;
      this.gridGraphics.moveTo(left * this.gridSize, py);
      this.gridGraphics.lineTo(right * this.gridSize, py);
    }

    this.gridGraphics.strokePath();
  }

  /**
   * Draws the central hub as a rounded rectangle, always centered at (0,0).
   * Appearance (size, color, border, fill) is fully controlled via config/colors.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();

    // Compute the top-left corner so the rectangle is centered
    const half = this.centerHubCells / 2;
    const originX = -half * this.gridSize;
    const originY = -half * this.gridSize;
    const width = this.centerHubCells * this.gridSize;
    const height = this.centerHubCells * this.gridSize;

    // Draw the border (thickness, color from config)
    this.centerSquare.lineStyle(
      GridConfig.centerHubBorder,
      GridConfig.centerHubColor,
      1 // Border is fully opaque
    );
    this.centerSquare.strokeRoundedRect(
      originX,
      originY,
      width,
      height,
      this.centerHubRadius
    );

    // Draw the transparent fill (color/opacity from config)
    this.centerSquare.fillStyle(
      GridConfig.centerHubColor,
      GridConfig.centerHubFillAlpha
    );
    this.centerSquare.fillRoundedRect(
      originX,
      originY,
      width,
      height,
      this.centerHubRadius
    );
  }
}
