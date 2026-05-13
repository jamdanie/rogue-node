import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot-scene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#020617');

    // Background
    this.add.rectangle(640, 400, 1280, 800, 0x020617);

    // Scan lines
    for (let y = 0; y < 800; y += 6) {
      this.add.rectangle(640, y, 1280, 1, 0x0f172a, 0.25);
    }

    // Title
    this.add.text(350, 80, 'ROGUE NODE // INCIDENT BRIEF', {
      fontSize: '40px',
      color: '#00ff99',
      fontStyle: 'bold',
    });

    // Classification
    this.add.text(450, 150, 'CLASSIFICATION: INTERNAL', {
      fontSize: '26px',
      color: '#f97316',
    });

    // Mission briefing panel
    const panel = this.add.rectangle(
      640,
      390,
      820,
      370,
      0x0f172a,
      0.95
    );

    panel.setStrokeStyle(3, 0x00ff99);

    const briefingText = `
A rogue data center node is suspected
of exfiltrating sensitive information.

MISSION OBJECTIVES

• Verify access control
• Investigate infrastructure
• Review evidence
• Analyze SOC alerts
• Contain Rogue Node

WARNING:
Unauthorized exposure increases
threat levels and may compromise
the mission.
`;

    this.add.text(330, 230, briefingText, {
      fontSize: '26px',
      color: '#ffffff',
      lineSpacing: 10,
    });

    // Bottom instructions
    const deployText = this.add.text(
      420,
      690,
      'PRESS SPACE TO DEPLOY',
      {
        fontSize: '34px',
        color: '#facc15',
      }
    );

    // Pulse effect
    this.tweens.add({
      targets: deployText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Keyboard
    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    spaceKey?.once('down', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      this.time.delayedCall(1200, () => {
        this.scene.start('main-scene');
      });
    });
  }
}