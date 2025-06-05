import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { Splitter } from "../entities/Splitter";

/**
 * Utility for keycodes (letters and special keys).
 */
function getKeyCode(key: string) {
  return Phaser.Input.Keyboard.KeyCodes[key.toUpperCase()] || Phaser.Input.Keyboard.KeyCodes[key];
}

export default class PlayScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;    // For grid lines
  private centerSquare!: Phaser.GameObjects.Graphics;    // For hub and splitters

  // Array of Splitter entity objects
  private splitters: Splitter[] = [];

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private gridSize = GridConfig.cellSize;
  private cameraSpeed = CameraConfig.moveSpeed;

  /**
   * Sets up the camera, input, and persistent graphics.
   */
  create() {
    // Center the camera at the hub on start
    this.cameras.main.centerOn(0, 0);
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Register key bindings (up/down/left/right/accelerate/recenter)
    this.keys = this.input.keyboard.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;
    this.cursors = this.input.keyboard.createCursorKeys();

    // Initial draw of grid and center hub/objects
    this.drawVisibleGrid();
    this.drawCenterSquare();

    // Mouse wheel zoom support
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      let camera = this.cameras.main;
      let newZoom = camera.zoom;
      if (deltaY > 0) {
        // Zoom out
        newZoom = Phaser.Math.Clamp(
          camera.zoom - ZoomConfig.zoomStep,
          ZoomConfig.minZoom,
          ZoomConfig.maxZoom
        );
      } else if (deltaY < 0) {
        // Zoom in
        newZoom = Phaser.Math.Clamp(
          camera.zoom + ZoomConfig.zoomStep,
          ZoomConfig.minZoom,
          ZoomConfig.maxZoom
        );
      }
      camera.setZoom(newZoom);
      this.drawVisibleGrid();
    });

    // Mouse click: place a Splitter (snapped to grid)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cam = this.cameras.main;
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      const snappedX = Math.round(worldPoint.x / this.gridSize) * this.gridSize;
      const snappedY = Math.round(worldPoint.y / this.gridSize) * this.gridSize;

      // Deselect all others
      for (const s of this.splitters) s.selected = false;
      // Add new splitter (highlight it)
      const splitter = new Splitter(snappedX, snappedY, this.gridSize * 1.25, 0xffd166);
      splitter.selected = true;
      this.splitters.push(splitter);

      this.drawCenterSquare();
    });
  }

  /**
   * Runs every frame; handles movement, recentering, and redraw.
   */
  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Accelerate with "A"
    const accelMultiplier = (this.keys.accelerate && this.keys.accelerate.isDown) ? 4 : 1;
    const moveSpeed = this.cameraSpeed * accelMultiplier;

    // Camera movement (ESDF or arrows)
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

    // HOME key: recenter camera
    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    // Redraw grid if the camera moved
    if (moved) {
      this.drawVisibleGrid();
    }

    // Always redraw hub and splitters (for animation/highlight)
    this.drawCenterSquare();
  }

  /**
   * Draws the visible grid, covering extra margin at any zoom/pan.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25 // subtle grid
    );

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const viewLeft = cam.scrollX;
    const viewRight = cam.scrollX + cam.width / zoom;
    const viewTop = cam.scrollY;
    const viewBottom = cam.scrollY + cam.height / zoom;
    const bufferCellsX = Math.ceil(cam.width / (zoom * this.gridSize));
    const bufferCellsY = Math.ceil(cam.height / (zoom * this.gridSize));
    const left = Math.floor(viewLeft / this.gridSize) - bufferCellsX;
    const right = Math.ceil(viewRight / this.gridSize) + bufferCellsX;
    const top = Math.floor(viewTop / this.gridSize) - bufferCellsY;
    const bottom = Math.ceil(viewBottom / this.gridSize) + bufferCellsY;

    for (let x = left; x <= right; x++) {
      const px = x * this.gridSize;
      this.gridGraphics.moveTo(px, top * this.gridSize);
      this.gridGraphics.lineTo(px, bottom * this.gridSize);
    }
    for (let y = top; y <= bottom; y++) {
      const py = y * this.gridSize;
      this.gridGraphics.moveTo(left * this.gridSize, py);
      this.gridGraphics.lineTo(right * this.gridSize, py);
    }
    this.gridGraphics.strokePath();
  }

  /**
   * Draws the central animated hub and all splitters.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);
    // Draw each splitter object (uses .draw())
    for (const s of this.splitters) {
      s.draw(this.centerSquare);
    }
  }
}
