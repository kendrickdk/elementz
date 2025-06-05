import Phaser from "phaser";
import { MenuBar, MenuItem } from "../ui/MenuBar"; // Adjust path as needed

export default class UIScene extends Phaser.Scene {
  private menuBar!: MenuBar;

  constructor() {
    super("UIScene");
    console.log("UIScene constructor running!");
  }

  create() {
    console.log("UIScene create running!");

    // Define your menu items
    const MENU_ITEMS: MenuItem[] = [
      { key: "qtub", label: "Q-Tub" },
      { key: "tubetools", label: "Tube Tools" },
      { key: "wormhole", label: "Wormhole" },
      { key: "extractor", label: "Extractor" },
      { key: "splitter", label: "Splitter" },
      { key: "combiner", label: "Combiner" },
      { key: "shellmixer", label: "Shell Mixer" },
      { key: "orbit", label: "Orbit" },
      { key: "singularity", label: "Singularity" }
    ];

    // Create the MenuBar (remove the red rectangle above)
    this.menuBar = new MenuBar(this, MENU_ITEMS, (toolKey: string) => {
      this.scene.get("PlayScene").events.emit("toolChanged", toolKey);
    });
  }
}
