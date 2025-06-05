import { drawSplitter } from "../gameobjects/Splitter";

/**
 * Splitter entity for state and game logic.
 */
export class Splitter {
  x: number;
  y: number;
  size: number;
  color?: number;
  selected?: boolean;

  constructor(x: number, y: number, size: number, color?: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.selected = false;
  }

  draw(graphics: Phaser.GameObjects.Graphics) {
    drawSplitter(graphics, this.x, this.y, this.size, {
      color: this.color,
      highlight: this.selected,
    });
  }
}
