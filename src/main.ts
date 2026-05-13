import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

new Phaser.Game({
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },

  parent: 'app',

  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },

  scene: [MainScene],
});