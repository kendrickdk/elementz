import Phaser from "phaser";
import { InputKeys } from "../constants/inputConfig";
import { GridConfig, CameraConfig } from "../constants/config";
import { drawFancyHub } from "../gameobjects/FancyHub"; // Updated import path
import { ZoomConfig } from "../constants/config"; // Import your zoom settings


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

  // Graphics object for the central hub (fancy hub)
  private centerSquare!: Phaser.GameObjects.Graphics;

  // Holds references to movement keys (custom + arrows)
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Cache settings for easier reference (values come from config)
  private gridSize = GridConfig.cellSize;
  private centerHubCells = GridConfig.centerHubCells;
  private centerHubRadius = GridConfig.centerHubRadius;
  private cameraSpeed = CameraConfig.moveSpeed;

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
    
    // Add mouse wheel zoom support using settings from config
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      let camera = this.cameras.main;

      // Default to current zoom
      let newZoom = camera.zoom;

      // Mouse wheel up = zoom in, down = zoom out
      if (deltaY > 0) {
        // Scrolled down: zoom OUT, clamp to min
        newZoom = Phaser.Math.Clamp(
          camera.zoom - ZoomConfig.zoomStep,
          ZoomConfig.minZoom,
          ZoomConfig.maxZoom
        );
      } else if (deltaY < 0) {
        // Scrolled up: zoom IN, clamp to max
        newZoom = Phaser.Math.Clamp(
          camera.zoom + ZoomConfig.zoomStep,
          ZoomConfig.minZoom,
          ZoomConfig.maxZoom
        );
      }
      camera.setZoom(newZoom); // Apply the new zoom value
    });


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

    // Always redraw the fancy hub every frame for animation!
    this.drawCenterSquare();
  }

  /**
   * Draws the visible grid based on current camera position.
   * The grid covers the entire visible area, even under the hub or buildings.
   */
  private drawVisibleGrid() {
    this.gridGraphics.clear();
    if (!GridConfig.showGrid) return;

    // Draw the grid with a subtle alpha (opacity) for that classic Shapez look.
    this.gridGraphics.lineStyle(
      GridConfig.gridLineThickness,
      GridConfig.gridLineColor,
      0.25 // Subtle! Tweak to taste; 0.25 = faint, 1 = solid.
    );

    const cam = this.cameras.main;
    const left = Math.floor(cam.scrollX / this.gridSize) - 1;
    const right = Math.ceil((cam.scrollX + cam.width) / this.gridSize) + 1;
    const top = Math.floor(cam.scrollY / this.gridSize) - 1;
    const bottom = Math.ceil((cam.scrollY + cam.height) / this.gridSize) + 1;

    // Draw vertical grid lines across the visible area.
    for (let x = left; x <= right; x++) {
      const px = x * this.gridSize;
      this.gridGraphics.moveTo(px, top * this.gridSize);
      this.gridGraphics.lineTo(px, bottom * this.gridSize);
    }

    // Draw horizontal grid lines across the visible area.
    for (let y = top; y <= bottom; y++) {
      const py = y * this.gridSize;
      this.gridGraphics.moveTo(left * this.gridSize, py);
      this.gridGraphics.lineTo(right * this.gridSize, py);
    }

    this.gridGraphics.strokePath();
  }

  /**
   * Draws the central hub using the reusable drawFancyHub function.
   * The hub is always centered at (0, 0).
   * This approach keeps PlayScene clean and allows you to easily update the hub visuals.
   */
  private drawCenterSquare() {
    this.centerSquare.clear();
    // Pass the Phaser Graphics, center position, and current time for animation
    drawFancyHub(this.centerSquare, 0, 0, this.time.now);
  }
}

