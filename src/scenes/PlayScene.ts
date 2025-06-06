import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { drawSplitter } from "../gameobjects/Splitter";

// Utility for keycodes, handles both upper/lowercase safely
function getKeyCode(key: string) {
  const upperKey = key.toUpperCase() as keyof typeof Phaser.Input.Keyboard.KeyCodes;
  const lowerKey = key as keyof typeof Phaser.Input.Keyboard.KeyCodes;
  return Phaser.Input.Keyboard.KeyCodes[upperKey] || Phaser.Input.Keyboard.KeyCodes[lowerKey];
}

export default class PlayScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;    // Draws grid lines
  private centerSquare!: Phaser.GameObjects.Graphics;    // Draws hub & splitters

  // List of all splitters placed in the world
  private splitters: { x: number, y: number, size: number, color?: number, selected?: boolean }[] = [];

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private gridSize = GridConfig.cellSize;
  private centerHubCells = GridConfig.centerHubCells;
  private centerHubRadius = GridConfig.centerHubRadius;
  private cameraSpeed = CameraConfig.moveSpeed;

  // Active tool from the menu bar (defaults to "qtube")
  private activeTool: string = "qtube";

  constructor() {
    super("PlayScene"); // <-- Register scene with this key!
    console.log("PlayScene constructor!");
  }

  create() {
    console.log("PlayScene create running!");
    // Center camera at the origin
    this.cameras.main.centerOn(0, 0);

    // Set up graphics for grid and hub
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Set up key bindings (E/D/S/F or arrow keys, accelerate, recenter)
    this.keys = this.input.keyboard!.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Draw the initial grid and hub
    this.drawVisibleGrid();
    this.drawCenterSquare();

    // Listen for tool selections from MenuBarScene
    this.events.on("tool-selected", this.handleToolSelected, this);

    // Handle mouse wheel zoom (only deltaY matters)
    this.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: any,
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

    // Handle mouse clicks for placing splitters (only with correct tool selected)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Only allow placing splitters if "qtube" is selected
      if (this.activeTool !== "qtube") return;

      const cam = this.cameras.main;
      // Convert screen (pointer) coordinates to world (game) coordinates
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      // Snap to grid
      const snappedX = Math.round(worldPoint.x / this.gridSize) * this.gridSize;
      const snappedY = Math.round(worldPoint.y / this.gridSize) * this.gridSize;

      // Deselect all existing splitters
      for (const s of this.splitters) s.selected = false;
      // Add new splitter (highlighted)
      this.splitters.push({
        x: snappedX,
        y: snappedY,
        size: this.gridSize * 1.25,
        color: 0xffd166,
        selected: true,
      });

      this.drawCenterSquare(); // Redraw hub and splitters
    });
    this.scene.launch("MenuBarScene");
    this.scene.bringToTop("MenuBarScene");

  }

  /**
   * Handler for tool selection from MenuBarScene.
   * @param key The tool key selected (e.g., "qtube", "combine", etc.)
   */
  handleToolSelected(key: string) {
    this.activeTool = key;
    console.log("Active tool is now:", key);
    // (Optional) visually indicate selected tool in game
  }

  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Accelerate if key held
    const accelMultiplier = (this.keys.accelerate && this.keys.accelerate.isDown) ? 4 : 1;
    const moveSpeed = this.cameraSpeed * accelMultiplier;

    // WASD or arrow key movement
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

    // Recenter camera on hub (HOME key)
    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    if (moved) {
      this.drawVisibleGrid();
    }
    // Always redraw hub and splitters (for highlight/animation)
    this.drawCenterSquare();
  }

  /**
   * Draws the visible grid with a buffer around the viewport.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25 // Grid alpha (opacity)
    );

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const viewLeft = cam.scrollX;
    const viewRight = cam.scrollX + cam.width / zoom;
    const viewTop = cam.scrollY;
    const viewBottom = cam.scrollY + cam.height / zoom;

    // Buffer the grid by a viewport for smooth scrolling
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
   */
  private drawCenterSquare() {
    this.centerSquare.clear();

    // Draw animated hub
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);

    // Draw all splitters (highlight if selected)
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

