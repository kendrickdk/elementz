import Phaser from "phaser";
import ChunkManager from "../chunks/ChunkManager";
import { InputConfig } from "../constants/inputConfig";
// Import config values (without Colors)
import { MovementConfig, GridConfig, ChunkConfig } from "../constants/config";
// Import Colors separately from colors.ts
import { Colors } from "../constants/colors";
import { hexToNumber } from "../utils/colorUtils";

export default class PlayScene extends Phaser.Scene {
  private chunkManager!: ChunkManager;
  private keys: Phaser.Input.Keyboard.Key[] = [];
  private velocityX: number = 0;
  private velocityY: number = 0;
  private acceleration = MovementConfig.acceleration;
  private maxSpeed = MovementConfig.maxSpeed;
  private drag = MovementConfig.drag;

  private centerBlockStartCol: number = 0;
  private centerBlockStartRow: number = 0;
  private centerBlockCols: number = 4;
  private centerBlockRows: number = 4;

  create() {
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setZoom(1);

    const totalCols = ChunkConfig.cols * 3; 
    const totalRows = ChunkConfig.rows * 3;

    this.centerBlockStartCol = Math.floor(totalCols / 2) - Math.floor(this.centerBlockCols / 2);
    this.centerBlockStartRow = Math.floor(totalRows / 2) - Math.floor(this.centerBlockRows / 2);

    this.chunkManager = new ChunkManager(this, 1);

    this.chunkManager.update(this.cameras.main, {
      startCol: this.centerBlockStartCol,
      startRow: this.centerBlockStartRow,
      cols: this.centerBlockCols,
      rows: this.centerBlockRows,
    });

    this.drawCenterBlock();

    const keyCodes = [
      ...InputConfig.upKeys,
      ...InputConfig.downKeys,
      ...InputConfig.leftKeys,
      ...InputConfig.rightKeys,
    ];
    this.keys = keyCodes.map((code) => this.input.keyboard.addKey(code));
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    const cam = this.cameras.main;

    let inputX = 0;
    let inputY = 0;
    if (this.isAnyKeyDown(InputConfig.leftKeys)) inputX -= 1;
    if (this.isAnyKeyDown(InputConfig.rightKeys)) inputX += 1;
    if (this.isAnyKeyDown(InputConfig.upKeys)) inputY -= 1;
    if (this.isAnyKeyDown(InputConfig.downKeys)) inputY += 1;

    if (inputX !== 0) {
      this.velocityX += inputX * this.acceleration * deltaSeconds;
      this.velocityX = Phaser.Math.Clamp(this.velocityX, -this.maxSpeed, this.maxSpeed);
    } else {
      this.velocityX = this.applyDrag(this.velocityX, this.drag, deltaSeconds);
    }

    if (inputY !== 0) {
      this.velocityY += inputY * this.acceleration * deltaSeconds;
      this.velocityY = Phaser.Math.Clamp(this.velocityY, -this.maxSpeed, this.maxSpeed);
    } else {
      this.velocityY = this.applyDrag(this.velocityY, this.drag, deltaSeconds);
    }

    cam.scrollX += this.velocityX * deltaSeconds;
    cam.scrollY += this.velocityY * deltaSeconds;

    this.chunkManager.update(cam, {
      startCol: this.centerBlockStartCol,
      startRow: this.centerBlockStartRow,
      cols: this.centerBlockCols,
      rows: this.centerBlockRows,
    });
  }

  private drawCenterBlock() {
    const gridSize = GridConfig.size;
    const centerBlockWidth = this.centerBlockCols * gridSize;
    const centerBlockHeight = this.centerBlockRows * gridSize;
    const cornerRadius = Math.min(GridConfig.cornerRadius, gridSize / 2);

    const centerX = (this.centerBlockStartCol + this.centerBlockCols / 2) * gridSize;
    const centerY = (this.centerBlockStartRow + this.centerBlockRows / 2) * gridSize;

    const graphics = this.add.graphics();

    const fillColor = hexToNumber(Colors.centerBlockFillColor);
    const fillAlpha = Colors.centerBlockFillAlpha;
    graphics.fillStyle(fillColor, fillAlpha);
    graphics.fillRoundedRect(
      centerX - centerBlockWidth / 2,
      centerY - centerBlockHeight / 2,
      centerBlockWidth,
      centerBlockHeight,
      cornerRadius
    );

    const strokeColor = hexToNumber(Colors.centerBlockStrokeColor);
    graphics.lineStyle(4, strokeColor);
    graphics.strokeRoundedRect(
      centerX - centerBlockWidth / 2,
      centerY - centerBlockHeight / 2,
      centerBlockWidth,
      centerBlockHeight,
      cornerRadius
    );
  }

  private applyDrag(velocity: number, drag: number, delta: number): number {
    if (velocity > 0) {
      velocity -= drag * delta;
      if (velocity < 0) velocity = 0;
    } else if (velocity < 0) {
      velocity += drag * delta;
      if (velocity > 0) velocity = 0;
    }
    return velocity;
  }

  private isAnyKeyDown(keys: number[]): boolean {
    return keys.some((code) => {
      const key = this.keys.find((k) => k.keyCode === code);
      return key?.isDown ?? false;
    });
  }
}


