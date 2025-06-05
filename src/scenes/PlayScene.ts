import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { Splitter } from "../entities/Splitter";
import { getKeyCode } from "../utils/getKeyCode";

/**
 * PlayScene:
 * - Handles grid, camera movement, tool placement, and communication with UIScene (for tool selection).
 */
export default class PlayScene extends Phaser.Scene {
  // Graphics for grid and hub
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private centerSquare!: Phaser.GameObjects.Graphics;

  // Array to hold all placed Splitters
  private splitters: Splitter[] = [];

  // Keyboard input
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Grid and camera config
  private gridSize = GridConfig.cellSize;
  private cameraSpeed = CameraConfig.moveSpeed;

  // Which tool is selected (from the UIScene menu)
  private currentTool: string = "qtub"; // Default

  /**
   * Phaser scene setup: runs when the scene starts.
   */
  create() {
    // Center camera on the hub at start
    this.cameras.main.centerOn(0, 0);

    // Add graphics layers for grid and hub/splitters
    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Setup keyboard controls (custom keys and arrows)
    this.keys = this.input.keyboard!.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Draw initial grid and hub
    this.drawVisibleGrid();
    this.drawCenterSquare();

    // --- Listen for tool selection from UIScene ---
    // UIScene emits "toolChanged" when a tool is selected in the menu.
    this.scene.get("UIScene").events.on("toolChanged", (toolKey: string) => {
      this.currentTool = toolKey;
      // Optionally log: console.log("Current tool set to:", toolKey);
    });

    // --- Mouse wheel for camera zoom in/out ---
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
      }
    );

    // --- Mouse click: place an entity/tool based on menu selection ---
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cam = this.cameras.main;
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      const snappedX = Math.round(worldPoint.x / this.gridSize) * this.gridSize;
      const snappedY = Math.round(worldPoint.y / this.gridSize) * this.gridSize;

      // For now, only allow Splitter placement for example
      if (this.currentTool === "splitter") {
        // Deselect all other splitters first
        for (const s of this.splitters) s.selected = false;

        // Add new splitter and select it
        const splitter = new Splitter(snappedX, snappedY, this.gridSize * 1.25, 0xffd166);
        splitter.selected = true;
        this.splitters.push(splitter);

        this.drawCenterSquare();
      }

      // TODO: Add placement logic for other tool types!
    });
  }

  /**
   * Phaser update loop: called every frame.
   */
  update() {
    const cam = this.cameras.main;
    let moved = false;

    // Accelerated movement (hold "accelerate" key)
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

    // Recenter camera with the recenter key (e.g., HOME)
    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    // Redraw grid if camera moved
    if (moved) {
      this.drawVisibleGrid();
    }

    // Always redraw hub and splitters
    this.drawCenterSquare();
  }

  /**
   * Draw the visible grid around the camera viewport.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25
    );

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const viewLeft = cam.scrollX;
    const viewRight = cam.scrollX + cam.width / zoom;
    const viewTop = cam.scrollY;
    const viewBottom = cam.scrollY + cam.height / zoom;

    // Expand grid beyond the screen for smooth scrolling
    const bufferCellsX = Math.ceil(cam.width / (zoom * this.gridSize));
    const bufferCellsY = Math.ceil(cam.height / (zoom * this.gridSize));
    const left = Math.floor(viewLeft / this.gridSize) - bufferCellsX;
    const right = Math.ceil(viewRight / this.gridSize) + bufferCellsX;
    const top = Math.floor(viewTop / this.gridSize) - bufferCellsY;
    const bottom = Math.ceil(viewBottom / this.gridSize) + bufferCellsY;

    // Draw vertical lines
    for (let x = left; x <= right; x++) {
      const px = x * this.gridSize;
      this.gridGraphics.moveTo(px, top * this.gridSize);
      this.gridGraphics.lineTo(px, bottom * this.gridSize);
    }
    // Draw horizontal lines
    for (let y = top; y <= bottom; y++) {
      const py = y * this.gridSize;
      this.gridGraphics.moveTo(left * this.gridSize, py);
      this.gridGraphics.lineTo(right * this.gridSize, py);
    }
    this.gridGraphics.strokePath();
  }

  /**
   * Draws the animated hub and all placed splitters.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);
    for (const s of this.splitters) {
      s.draw(this.centerSquare);
    }
  }
}
