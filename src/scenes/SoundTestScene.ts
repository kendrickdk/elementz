import Phaser from "phaser";

export default class SoundTestScene extends Phaser.Scene {
  private placeSound!: Phaser.Sound.BaseSound;

  preload() {
    this.load.audio('placeSound', 'assets/sounds/click_pop.wav');
  }

  create() {
    this.placeSound = this.sound.add('placeSound');
    this.placeSound.play();
  }
}
