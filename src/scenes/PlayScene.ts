import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { Splitter } from "../entities/Splitter";
import { getKeyCode } from "../utils/getKeyCode";

/**
 * PlayScene handles the main gameplay area: grid rendering, camera movement,
 * hub drawing, and managing Splitter entities.
 */
export default class PlayScene extends Phaser.Scene {
  // Graphics objects for grid and game elements
  private gridGraphics!: Phaser.GameObjects.Graphics;    // Used for drawing grid lines
  private centerSquare!: Phaser.GameObjects.Graphics;    // Used for hub and splitters

  // List of all splitter entities in the scene
  private splitters: Splitter[] = [];

  // Key bindings for movement, acceleration, and re-centering
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  // Built-in Phaser arrow key controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Grid and camera config (cell size, speed)
  private gridSize = GridConfig.cellSize;
  private cameraSpeed = CameraConfig.moveSpeed;

  /**
   * Phaser scene initialization.
   * Sets up camera, input, grid, and mouse controls.
   */
  create() {
    // Center the camera on the hub at the start
    this.cameras.main.centerOn(0, 0);

    // Create graphics layers for grid and hub/splitters
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Set up custom movement keys (from InputKeys) and Phaser's built-in cursor keys
    this.keys = this.input.keyboard!.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Initial grid and hub draw
    this.drawVisibleGrid();
    this.drawCenterSquare();

    // Mouse wheel for camera zoom in/out
    this.input.on(
  "wheel",
  (
    _pointer: Phaser.Input.Pointer,
    _gameObjects: any[],
    _deltaX: number,
    deltaY: number,
    _deltaZ: number
  ) => {
    let camera = this.cameras.main;
    let newZoom = camera.zoom;
    if (deltaY > 0) {
      newZoom = Phaser.Math.Clamp(
        camera.zoom - ZoomConfig.zoomStep,
        ZoomConfig.minZoom,
        ZoomConfig.maxZoom
      );
    } else if (deltaY < 0) {
      newZoom = Phaser.Math.Clamp(
        camera.zoom + ZoomConfig.zoomStep,
        ZoomConfig.minZoom,
        ZoomConfig.maxZoom
      );
    }
    camera.setZoom(newZoom);
    this.drawVisibleGrid();
  }
);


    // Mouse click to place a Splitter (grid-snapped)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cam = this.cameras.main;
      // Convert mouse click to world (game) coordinates
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      // Snap to the nearest grid cell
      const snappedX = Math.round(worldPoint.x / this.gridSize) * this.gridSize;
      const snappedY = Math.round(worldPoint.y / this.gridSize) * this.gridSize;

      // Deselect all splitters
      for (const s of this.splitters) s.deselect();

      // Create new splitter, select it, and add to array
      const splitter = new Splitter(snappedX, snappedY, this.gridSize * 1.25);
      splitter.select();
      this.splitters.push(splitter);

      // Redraw hub and splitters
      this.drawCenterSquare();
    });
  }

  /**
   * Phaser main loop. Handles camera movement, re-centering, and redraws as needed.
   */
  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Use acceleration if 'accelerate' key is held down
    const accelMultiplier = (this.keys.accelerate && this.keys.accelerate.isDown) ? 4 : 1;
    const moveSpeed = this.cameraSpeed * accelMultiplier;

    // Camera movement (custom keys or arrow keys)
    if (this.keys.up.isDown || this.cursors.up.isDown) {
      cam.scrollY -= moveSpeed;
      moved = true;
    }
    if (this.keys.down.isDown || this.cursors.down.isDown) {
      cam.scrollY += moveSpeed;
      moved = true;
    }
    if (this.keys.left.isDown || this.cursors.left.isDown) {
      cam.scrollX -= moveSpeed;
      moved = true;
    }
    if (this.keys.right.isDown || this.cursors.right.isDown) {
      cam.scrollX += moveSpeed;
      moved = true;
    }

    // Recenter camera if 'recenter' key is pressed (e.g., HOME)
    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    // Only redraw the grid if the camera moved (saves performance)
    if (moved) {
      this.drawVisibleGrid();
    }

    // Always redraw hub and splitters for highlighting and animation
    this.drawCenterSquare();
  }

  /**
   * Draws the visible portion of the grid, expanding beyond view for seamless scrolling/zoom.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25 // Subtle transparency for grid
    );

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const viewLeft = cam.scrollX;
    const viewRight = cam.scrollX + cam.width / zoom;
    const viewTop = cam.scrollY;
    const viewBottom = cam.scrollY + cam.height / zoom;
    // Add some extra rows/columns beyond view for smoother scrolling
    const bufferCellsX = Math.ceil(cam.width / (zoom * this.gridSize));
    const bufferCellsY = Math.ceil(cam.height / (zoom * this.gridSize));
    const left = Math.floor(viewLeft / this.gridSize) - bufferCellsX;
    const right = Math.ceil(viewRight / this.gridSize) + bufferCellsX;
    const top = Math.floor(viewTop / this.gridSize) - bufferCellsY;
    const bottom = Math.ceil(viewBottom / this.gridSize) + bufferCellsY;

    // Draw vertical grid lines
    for (let x = left; x <= right; x++) {
      const px = x * this.gridSize;
      this.gridGraphics.moveTo(px, top * this.gridSize);
      this.gridGraphics.lineTo(px, bottom * this.gridSize);
    }
    // Draw horizontal grid lines
    for (let y = top; y <= bottom; y++) {
      const py = y * this.gridSize;
      this.gridGraphics.moveTo(left * this.gridSize, py);
      this.gridGraphics.lineTo(right * this.gridSize, py);
    }
    this.gridGraphics.strokePath();
  }

  /**
   * Draws the central hub and all Splitter entities.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();
    // Draw the animated central hub (use your custom function)
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);

    // Draw each splitter in the scene
    for (const s of this.splitters) {
      s.draw(this.centerSquare);
    }
  }
}
