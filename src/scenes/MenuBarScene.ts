import Phaser from "phaser";
import { menuItems } from "../constants/menuItems"; // Your menu items array

export default class MenuBarScene extends Phaser.Scene {
  private bar!: Phaser.GameObjects.Rectangle;
  private buttonRects: Phaser.GameObjects.Rectangle[] = [];
  private helperBox?: Phaser.GameObjects.Rectangle;
  private helperText?: Phaser.GameObjects.Text;
  private selectedIndex: number = 0;

  // You can tweak these!
  private readonly barWidth = 700;
  private readonly barHeight = 72;
  private readonly bottomMargin = 100;

  constructor() {
    super("MenuBarScene");
  }

  create() {
    // Compute bar position
    const barX = this.scale.width / 2;
    const barY = this.scale.height - this.bottomMargin - this.barHeight / 2;

    // Draw the main menu bar
    this.bar = this.add.rectangle(
      barX, barY,
      this.barWidth, this.barHeight,
      0x222241, 0.85
    )
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffd166);

    // --- Draw menu buttons ---
    const numButtons = menuItems.length;
    const buttonWidth = 88;
    const buttonHeight = 48;
    const spacing = this.barWidth / numButtons;

    for (let i = 0; i < numButtons; i++) {
      // Button center X, evenly spaced
      const x = barX - this.barWidth / 2 + spacing / 2 + i * spacing;
      // Highlight selected button
      const color = (i === this.selectedIndex) ? 0xffd166 : 0x444466;

      // Button background (rectangle)
      const btn = this.add.rectangle(
        x, barY, buttonWidth, buttonHeight, color, 0.95
      )
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xfff6c1)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.setSelectedIndex(i);
        });

      this.buttonRects.push(btn);

      // Button label, centered
      this.add.text(
        x, barY,
        menuItems[i].label,
        {
          fontSize: "16px",
          color: "#fff",
          fontFamily: "sans-serif",
          fontStyle: "bold"
        }
      ).setOrigin(0.5);
    }

    // --- Helper window in the upper right ---
    // Rectangle and text are both anchored at top right (origin 1,0)
    const helperBoxWidth = 400;
    const helperBoxHeight = 90;
    const helperBoxMarginRight = 10;
    const helperBoxMarginTop = 20;

    this.helperBox = this.add.rectangle(
      this.scale.width - helperBoxMarginRight, helperBoxMarginTop,
      helperBoxWidth, helperBoxHeight,
      0x222241, 0.96
    ).setOrigin(1, 0)
     .setStrokeStyle(2, 0xffd166);

    this.helperText = this.add.text(
      this.scale.width - helperBoxMarginRight - 10, // 10px padding inside
      helperBoxMarginTop + 12,                      // 12px padding top
      menuItems[this.selectedIndex].description,
      {
        fontSize: "16px",
        color: "#fff",
        wordWrap: { width: helperBoxWidth - 24 } // padding
      }
    ).setOrigin(1, 0); // top right corner
  }

  /**
   * Sets which menu button is selected and updates UI highlights + helper text.
   */
  private setSelectedIndex(i: number) {
    this.selectedIndex = i;
    // Highlight selected button
    this.buttonRects.forEach((btn, idx) =>
      btn.setFillStyle(idx === i ? 0xffd166 : 0x444466, 0.95)
    );
    // Update helper text
    if (this.helperText) {
      this.helperText.setText(menuItems[i].description);
    }
  }

  update() {
    // Keep bar and buttons positioned correctly on resize
    const barX = this.scale.width / 2;
    const barY = this.scale.height - this.bottomMargin - this.barHeight / 2;
    this.bar.setPosition(barX, barY).width = this.barWidth;

    const numButtons = this.buttonRects.length;
    const spacing = this.barWidth / numButtons;
    for (let i = 0; i < numButtons; i++) {
      const x = barX - this.barWidth / 2 + spacing / 2 + i * spacing;
      this.buttonRects[i].setPosition(x, barY);
    }

    // Move helper window and text (always in top right)
    const helperBoxWidth = 400;
    const helperBoxHeight = 90;
    const helperBoxMarginRight = 10;
    const helperBoxMarginTop = 20;

    if (this.helperBox && this.helperText) {
      this.helperBox.setPosition(
        this.scale.width - helperBoxMarginRight,
        helperBoxMarginTop
      );
      this.helperText.setPosition(
        this.scale.width - helperBoxMarginRight - 10, // 10px padding
        helperBoxMarginTop + 12
      );
    }
  }
}
