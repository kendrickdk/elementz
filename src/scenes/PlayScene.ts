import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { drawSplitter } from "../gameobjects/Splitter"; // <-- Make sure you have this file

// Utility for keycodes, handles special keys
function getKeyCode(key: string) {
  return Phaser.Input.Keyboard.KeyCodes[key.toUpperCase()] || Phaser.Input.Keyboard.KeyCodes[key];
}

export default class PlayScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;    // For grid lines
  private centerSquare!: Phaser.GameObjects.Graphics;    // For hub and objects

  // NEW: Track all placed splitters
  private splitters: { x: number, y: number, size: number, color?: number, selected?: boolean }[] = [];

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private gridSize = GridConfig.cellSize;
  private centerHubCells = GridConfig.centerHubCells;
  private centerHubRadius = GridConfig.centerHubRadius;
  private cameraSpeed = CameraConfig.moveSpeed;

  create() {
    this.cameras.main.centerOn(0, 0);
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Set up key bindings, including accelerate (A) and recenter (HOME)
    this.keys = this.input.keyboard.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;
    this.cursors = this.input.keyboard.createCursorKeys();

    this.drawVisibleGrid();
    this.drawCenterSquare();

    // Mouse wheel zoom support using config values
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
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
    });

    // --- NEW: Add splitters on mouse click ---
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cam = this.cameras.main;
      // Convert screen (pointer) coordinates to world coordinates
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      // Snap to grid
      const snappedX = Math.round(worldPoint.x / this.gridSize) * this.gridSize;
      const snappedY = Math.round(worldPoint.y / this.gridSize) * this.gridSize;

      // Deselect all existing splitters
      for (const s of this.splitters) s.selected = false;
      // Add new splitter (highlight it)
      this.splitters.push({
        x: snappedX,
        y: snappedY,
        size: this.gridSize * 1.25,
        color: 0xffd166,
        selected: true,
      });

      this.drawCenterSquare(); // Redraw hub and all splitters
    });
  }

  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Accelerate logic
    const accelMultiplier = (this.keys.accelerate && this.keys.accelerate.isDown) ? 4 : 1;
    const moveSpeed = this.cameraSpeed * accelMultiplier;

    // Movement controls (E/D/S/F or arrow keys)
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

    // HOME key: recenter camera on hub (0, 0)
    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    if (moved) {
      this.drawVisibleGrid();
    }
    // Always redraw hub and splitters every frame (for animation, selection)
    this.drawCenterSquare();
  }

  /**
   * Draws the visible grid, "overdrawing" by one viewport in all directions
   * to ensure coverage at any zoom/pan.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25 // Grid alpha
    );

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const viewLeft = cam.scrollX;
    const viewRight = cam.scrollX + cam.width / zoom;
    const viewTop = cam.scrollY;
    const viewBottom = cam.scrollY + cam.height / zoom;

    // Calculate how many grid cells fit on screen, then buffer by that much
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
   * Draws the central hub at (0, 0) and all placed splitters.
   * Highlights the most recently placed splitter with a white border.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();

    // Draw the animated hub
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);

    // Draw all splitters (if 'selected', pass highlight option)
    for (const s of this.splitters) {
      drawSplitter(
        this.centerSquare,
        s.x,
        s.y,
        s.size,
        s.selected ? { color: s.color, highlight: true } : { color: s.color }
      );
    }
  }
}
