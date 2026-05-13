import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot-scene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#020617');

    this.add.rectangle(640, 400, 1280, 800, 0x020617);

    for (let y = 0; y < 800; y += 5) {
      this.add.rectangle(640, y, 1280, 1, 0x0f172a, 0.2);
    }

    this.add.text(330, 50, 'ROGUE NODE // INCIDENT BRIEF', {
      fontSize: '36px',
      color: '#00ff99',
      fontStyle: 'bold',
    });

    this.add.text(470, 90, 'CLASSIFICATION: INTERNAL', {
      fontSize: '22px',
      color: '#f97316',
    });

    const panel = this.add.rectangle(640, 350, 820, 470, 0x0f172a, 0.95);
    panel.setStrokeStyle(3, 0x00ff99);

    const briefingText = `A rogue data center node is suspected
of exfiltrating sensitive information.

MISSION OBJECTIVES

• Verify access control
• Investigate infrastructure
• Review evidence
• Analyze SOC alerts
• Contain Rogue Node

WARNING

Unauthorized exposure increases threat levels
and may compromise the mission.`;

    this.add.text(310, 145, briefingText, {
      fontSize: '23px',
      color: '#ffffff',
      lineSpacing: 8,
    });

    this.add.text(420, 635, '[ SYSTEM STATUS: READY FOR DEPLOYMENT ]', {
      fontSize: '18px',
      color: '#64748b',
    });

    const deployText = this.add.text(420, 690, 'PRESS SPACE TO DEPLOY', {
      fontSize: '34px',
      color: '#facc15',
    });

    this.tweens.add({
      targets: deployText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const cursor = this.add.text(920, 690, '_', {
      fontSize: '34px',
      color: '#00ff99',
    });

    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    spaceKey?.once('down', () => {
      this.cameras.main.fadeOut(900, 0, 0, 0);

      this.time.delayedCall(1100, () => {
        this.scene.start('main-scene');
      });
    });
  }
}