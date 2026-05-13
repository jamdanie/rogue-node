import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import Level2Scene from './scenes/Level2Scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  backgroundColor: '#020617',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [MainScene, Level2Scene],
};

new Phaser.Game(config);