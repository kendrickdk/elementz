import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import MenuBarScene from "./scenes/MenuBarScene";
import { Colors } from "./constants/colors";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800, // or window.innerWidth
  height: 600, // or window.innerHeight
  backgroundColor: Colors.background,
  scene: [PlayScene, MenuBarScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
