import Phaser from "phaser";

/**
 * Describes an item in the menu bar (tool/object selector).
 */
export interface MenuItem {
  key: string;    // Unique ID for the tool, e.g. "splitter"
  label: string;  // Display label, e.g. "Splitter"
  // You can add 'icon' or other fields later if you want!
}

/**
 * MenuBar is a UI component that displays selectable tools/items at the
 * bottom of the screen, like the hotbar in Shapez.
 * It is screen-space only (unaffected by camera scroll/zoom) and auto-resizes.
 */
export class MenuBar extends Phaser.GameObjects.Container {
  private menuItems: MenuItem[];
  private activeIndex: number = 0;
  private buttonRects: Phaser.GameObjects.Rectangle[] = []; // For highlighting/buttons
  private barHeight: number = 64;
  private onSelect: (key: string) => void;
  private backgroundRect?: Phaser.GameObjects.Rectangle;

  /**
   * Create a new MenuBar.
   * @param scene - The Phaser scene to attach to.
   * @param menuItems - Array of tool/item info.
   * @param onSelect - Callback to trigger when an item is selected.
   */
  constructor(scene: Phaser.Scene, menuItems: MenuItem[], onSelect: (key: string) => void) {
    super(scene);                      // Initialize as a Phaser Container
    scene.add.existing(this);          // Add MenuBar to scene's display list

    this.menuItems = menuItems;
    this.onSelect = onSelect;
    this.setDepth(10000);              // Ensures UI is on top

    this.createBar();                  // Build the UI
    scene.scale.on("resize", this.onResize, this); // Auto-resize support
  }

  /**
   * Creates (or re-creates) the menu bar and its buttons.
   */
  private createBar() {
    // Remove all existing children/buttons if recreating
    this.removeAll(true);
    this.buttonRects = [];

    // Calculate layout for the menu bar and buttons
    const width = this.scene.scale.width;
    const barY = this.scene.scale.height - this.barHeight;
    const buttonPadding = 12;
    const buttonWidth = Math.floor((width - (this.menuItems.length + 1) * buttonPadding) / this.menuItems.length);

    // Draw menu bar background (full width, screen-fixed)
    this.backgroundRect = this.scene.add.rectangle(
      0, barY, width, this.barHeight,
      0x111122, 0.98
    ).setOrigin(0, 0);
    this.add(this.backgroundRect);

    // Create each button as a rectangle (with text) added directly to the MenuBar container
    for (let i = 0; i < this.menuItems.length; i++) {
      const item = this.menuItems[i];
      const x = buttonPadding + i * (buttonWidth + buttonPadding);

      // Button background rectangle (highlighted if selected)
      const btnBg = this.scene.add.rectangle(
        x, barY + 8, buttonWidth, this.barHeight - 16,
        i === this.activeIndex ? 0x222244 : 0x444466,
        0.95
      ).setOrigin(0, 0)
       .setStrokeStyle(2, i === this.activeIndex ? 0xffd166 : 0x8888aa);

      // Centered text label on top of the button
      const label = this.scene.add.text(
        x + buttonWidth / 2, barY + 8 + (this.barHeight - 16) / 2,
        item.label,
        { fontSize: "18px", color: "#fff" }
      ).setOrigin(0.5);

      // Make the button rectangle interactive for mouse clicks
      btnBg.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, buttonWidth, this.barHeight - 16),
        Phaser.Geom.Rectangle.Contains
      );
      btnBg.on("pointerdown", () => {
        this.setActive(i);
      });

      // Keep a reference to the button rect for highlighting
      this.buttonRects.push(btnBg);

      // Add button rect and label directly to this MenuBar container
      this.add(btnBg);
      this.add(label);
    }
  }

  /**
   * Sets the selected tool index and updates all button highlights.
   * @param index - index of the tool to select
   */
  public setActive(index: number) {
    if (index < 0 || index >= this.menuItems.length) return;
    this.activeIndex = index;

    // Update button colors for highlighting (selected button stands out)
    this.buttonRects.forEach((btn, i) => {
      btn.setFillStyle(i === this.activeIndex ? 0x222244 : 0x444466, 0.95);
      btn.setStrokeStyle(2, i === this.activeIndex ? 0xffd166 : 0x8888aa);
    });

    // Call the selection callback with the tool key (notifies UIScene/PlayScene)
    if (this.onSelect) {
      this.onSelect(this.menuItems[index].key);
    }
  }

  /**
   * Returns the currently selected tool key.
   */
  public getActiveKey(): string {
    return this.menuItems[this.activeIndex].key;
  }

  /**
   * Returns the height of the menu bar (for UI/layout logic).
   */
  public getBarHeight(): number {
    return this.barHeight;
  }

  /**
   * Responds to Phaser's resize event, recreates the bar to fit the new window size.
   */
  private onResize() {
    this.createBar();
  }

  /**
   * Destroys the menu bar and removes event listeners.
   */
  destroy(fromScene?: boolean) {
    this.scene.scale.off("resize", this.onResize, this);
    super.destroy(fromScene);
  }
}

