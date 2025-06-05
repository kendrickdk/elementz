// Splitter entity definition with drawing and selection logic

export class Splitter {
  x: number;          // X position (center of splitter)
  y: number;          // Y position (center of splitter)
  size: number;       // Diameter of the splitter
  color: number;      // Fill color (Phaser-style hex)
  selected: boolean;  // If true, splitter is highlighted

  /**
   * Create a new splitter.
   * @param x - X position (center)
   * @param y - Y position (center)
   * @param size - Diameter
   * @param color - (Optional) Fill color, default is yellowish
   */
  constructor(x: number, y: number, size: number, color = 0xffd166) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.selected = false;
  }

  /**
   * Mark this splitter as selected (for highlighting).
   */
  select() {
    this.selected = true;
  }

  /**
   * Mark this splitter as not selected (normal state).
   */
  deselect() {
    this.selected = false;
  }

  /**
   * Draw the splitter on the provided graphics context.
   * @param graphics - Phaser.Graphics object to draw onto
   */
  draw(graphics: Phaser.GameObjects.Graphics) {
    graphics.save(); // Save the current drawing state
    // If selected, use highlight color for the outline, else default
    graphics.lineStyle(2, this.selected ? 0x118ab2 : 0x222222, 1);
    // Set fill color
    graphics.fillStyle(this.color, 1);
    // Draw outlined circle for splitter body
    graphics.strokeCircle(this.x, this.y, this.size / 2);
    graphics.fillCircle(this.x, this.y, this.size / 2);
    graphics.restore(); // Restore the previous drawing state
  }
}

