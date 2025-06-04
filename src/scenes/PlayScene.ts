import Phaser from "phaser";
import Chunk from "../chunks/Chunk";

export default class PlayScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;   // Arrow keys input
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key }; // WASD keys input
  private cameraSpeed: number = 300;  // Camera movement speed in pixels per second

  constructor() {
    super("PlayScene");
  }

  create() {
    // Create the origin chunk at chunk coordinates (0, 0)
    new Chunk(this, 0, 0);

    // Initialize cursor keys (arrow keys) for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Initialize WASD keys for input
    this.wasdKeys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(time: number, delta: number) {
    // delta is the time elapsed since last frame in milliseconds
    // Convert it to seconds for frame-rate independent movement
    const deltaSeconds = delta / 1000;

    // Get the main camera object
    let cam = this.cameras.main;

    // Calculate movement amount based on speed and frame time
    let speed = this.cameraSpeed * deltaSeconds;

    // Move camera left if left arrow key is pressed
    if (this.cursors.left?.isDown) {
      cam.scrollX -= speed;
    }
    // Move camera right if right arrow key is pressed
    if (this.cursors.right?.isDown) {
      cam.scrollX += speed;
    }
    // Move camera up if up arrow key is pressed
    if (this.cursors.up?.isDown) {
      cam.scrollY -= speed;
    }
    // Move camera down if down arrow key is pressed
    if (this.cursors.down?.isDown) {
      cam.scrollY += speed;
    }

    // Also support WASD keys for movement:

    if (this.wasdKeys.A.isDown) {
      cam.scrollX -= speed;
    }
    if (this.wasdKeys.D.isDown) {
      cam.scrollX += speed;
    }
    if (this.wasdKeys.W.isDown) {
      cam.scrollY -= speed;
    }
    if (this.wasdKeys.S.isDown) {
      cam.scrollY += speed;
    }
  }
}

