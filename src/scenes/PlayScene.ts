import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig, ZoomConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub";
import { drawSplitter } from "../gameobjects/Splitter";

function getKeyCode(key: string) {
  const upperKey = key.toUpperCase() as keyof typeof Phaser.Input.Keyboard.KeyCodes;
  const lowerKey = key as keyof typeof Phaser.Input.Keyboard.KeyCodes;
  return Phaser.Input.Keyboard.KeyCodes[upperKey] || Phaser.Input.Keyboard.KeyCodes[lowerKey];
}

// Type to store individual splitter data and its own Graphics object
type SplitterData = {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  size: number;
  rotation: number; // in degrees
  color?: number;
  selected?: boolean;
};

export default class PlayScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;   // Grid lines graphics
  private centerSquare!: Phaser.GameObjects.Graphics;   // Hub graphics

  private splitters: SplitterData[] = [];               // All placed splitters

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private rotateClockwiseKey!: Phaser.Input.Keyboard.Key;
  private rotateCounterClockwiseKey!: Phaser.Input.Keyboard.Key;

  private gridSize = GridConfig.cellSize;                // Size of grid cell
  private cameraSpeed = CameraConfig.moveSpeed;          // Camera movement speed

  private activeTool: string = "qtube";                   // Currently selected tool

  private previewGraphics!: Phaser.GameObjects.Graphics; // Graphics for preview splitter
  private occupiedCells = new Set<string>();              // Track occupied grid cells

  private currentRotation: number = 0;                     // Current rotation (degrees)

  private placeSound!: Phaser.Sound.BaseSound;             // Sound to play on placement

  constructor() {
    super("PlayScene");
  }

  // Load assets, including your placement sound
  preload() {
    //this.load.audio('placeSound', '/assets/sounds/clang_and_wobble.ogg');
    this.load.audio('placeSound', 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

  }

  create() {
    this.cameras.main.centerOn(0, 0);

    this.gridGraphics = this.add.graphics();
    this.centerSquare = this.add.graphics();

    // Create Graphics object for preview splitter, semi-transparent
    this.previewGraphics = this.add.graphics();
    this.previewGraphics.alpha = 0.5;

    this.keys = this.input.keyboard!.addKeys({
      up: getKeyCode(InputKeys.up),
      down: getKeyCode(InputKeys.down),
      left: getKeyCode(InputKeys.left),
      right: getKeyCode(InputKeys.right),
      accelerate: getKeyCode(InputKeys.accelerate),
      recenter: getKeyCode(InputKeys.recenter),
    }) as any;

    this.cursors = this.input.keyboard!.createCursorKeys();

    // Load placement sound into scene
    this.placeSound = this.sound.add('placeSound');

    // Setup rotation keys from centralized input config
    this.rotateClockwiseKey = this.input.keyboard.addKey(InputKeys.rotateClockwise);
    this.rotateCounterClockwiseKey = this.input.keyboard.addKey(InputKeys.rotateCounterClockwise);

    // Rotate clockwise on key press
    this.rotateClockwiseKey.on('down', () => {
      if (this.activeTool === "divide") {
        this.currentRotation = (this.currentRotation + 90) % 360;
        this.updatePreviewRotation();
      }
    });

    // Rotate counter-clockwise on key press
    this.rotateCounterClockwiseKey.on('down', () => {
      if (this.activeTool === "divide") {
        this.currentRotation = (this.currentRotation + 270) % 360; // -90 mod 360
        this.updatePreviewRotation();
      }
    });

    this.drawVisibleGrid();
    this.drawCenterSquare();

    this.events.on("tool-selected", this.handleToolSelected, this);

    // Handle mouse wheel zoom in/out
    this.input.on("wheel", (_pointer, _gameObjects, _deltaX, deltaY) => {
      let camera = this.cameras.main;
      let newZoom = camera.zoom;
      if (deltaY > 0) {
        newZoom = Phaser.Math.Clamp(camera.zoom - ZoomConfig.zoomStep, ZoomConfig.minZoom, ZoomConfig.maxZoom);
      } else if (deltaY < 0) {
        newZoom = Phaser.Math.Clamp(camera.zoom + ZoomConfig.zoomStep, ZoomConfig.minZoom, ZoomConfig.maxZoom);
      }
      camera.setZoom(newZoom);
      this.drawVisibleGrid();
    });

    // Update preview splitter on mouse move when in divide mode
    this.input.on("pointermove", (pointer) => {
      if (this.activeTool === "divide") {
        this.updatePreviewPosition(pointer);
      } else {
        this.previewGraphics.clear();
      }
    });

    // Place splitter on mouse click when in divide mode
    this.input.on("pointerdown", (pointer) => {
      if (this.activeTool === "divide") {
        this.placeSplitter(pointer);
      }
    });

    this.scene.launch("MenuBarScene");
    this.scene.bringToTop("MenuBarScene");
  }

  // Update preview position and color based on mouse position & occupied cells
  private updatePreviewPosition(pointer: Phaser.Input.Pointer) {
    const cam = this.cameras.main;
    const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    const snappedX = Math.floor(worldPoint.x / this.gridSize) * this.gridSize;
    const snappedY = Math.floor(worldPoint.y / this.gridSize) * this.gridSize;
    const key = `${snappedX}_${snappedY}`;

    this.previewGraphics.clear();
    this.previewGraphics.x = snappedX + this.gridSize / 2;
    this.previewGraphics.y = snappedY + this.gridSize / 2;
    this.previewGraphics.rotation = Phaser.Math.DegToRad(this.currentRotation);

    if (this.occupiedCells.has(key)) {
      drawSplitter(this.previewGraphics, this.gridSize, { color: 0xff0000 });
    } else {
      drawSplitter(this.previewGraphics, this.gridSize, { color: 0x00ff00 });
    }
  }

  // Update only the rotation of the preview graphics
  private updatePreviewRotation() {
    this.previewGraphics.rotation = Phaser.Math.DegToRad(this.currentRotation);
  }

  // Place a splitter at pointer location if cell free, play sound, add splitter Graphics
  private placeSplitter(pointer: Phaser.Input.Pointer) {
    const cam = this.cameras.main;
    const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    const snappedX = Math.floor(worldPoint.x / this.gridSize) * this.gridSize;
    const snappedY = Math.floor(worldPoint.y / this.gridSize) * this.gridSize;
    const key = `${snappedX}_${snappedY}`;

    if (!this.occupiedCells.has(key)) {
      this.occupiedCells.add(key);

      // Play placement sound
      this.placeSound.play();

      // Deselect all splitters
      for (const s of this.splitters) {
        s.selected = false;
      }

      // Create new graphics object for this splitter
      const graphics = this.add.graphics();
      graphics.x = snappedX + this.gridSize / 2;
      graphics.y = snappedY + this.gridSize / 2;
      graphics.rotation = Phaser.Math.DegToRad(this.currentRotation);
      graphics.clear();

      drawSplitter(graphics, this.gridSize, { color: 0xffd166 });

      this.splitters.push({
        graphics,
        x: graphics.x,
        y: graphics.y,
        size: this.gridSize,
        rotation: this.currentRotation,
        color: 0xffd166,
        selected: true,
      });

      // Clear preview after placing
      this.previewGraphics.clear();
    } else {
      console.log("Cell already occupied!");
    }
  }

  // Handle tool selection changes
  handleToolSelected(key: string) {
    this.activeTool = key;
    console.log("Active tool is now:", key);
    this.previewGraphics.clear();
  }

  update() {
    const cam = this.cameras.main;
    let moved = false;

    const accelMultiplier = (this.keys.accelerate && this.keys.accelerate.isDown) ? 4 : 1;
    const moveSpeed = this.cameraSpeed * accelMultiplier;

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

    if (Phaser.Input.Keyboard.JustDown(this.keys.recenter)) {
      cam.centerOn(0, 0);
      moved = true;
    }

    if (moved) {
      this.drawVisibleGrid();
    }

    this.drawCenterSquare();
  }

  // Draw the grid lines with a buffer around the viewport
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    this.gridGraphics.lineStyle(GridConfig.gridLineThickness, GridConfig.gridLineColor, 0.25);

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

  // Draw central hub (splitters drawn individually, so no need to draw here)
  private drawCenterSquare() {
    this.centerSquare.clear();
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);
  }
}

