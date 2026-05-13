import Phaser from 'phaser';

export default class Level2Scene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  keys!: any;

  interactText!: Phaser.GameObjects.Text;
  statusText!: Phaser.GameObjects.Text;
  objectiveText!: Phaser.GameObjects.Text;
  trustText!: Phaser.GameObjects.Text;

  worker!: Phaser.GameObjects.Sprite;

  workerConvinced = false;
  trustScore = 0;

  constructor() {
    super('level2-scene');
  }

  preload() {
    this.load.image(
      'player',
      'https://labs.phaser.io/assets/sprites/phaser-dude.png'
    );
  }

  create() {
    this.cameras.main.fadeIn(1200, 0, 0, 0);

    this.cameras.main.setBackgroundColor('#020617');

    this.add.rectangle(640, 360, 1280, 720, 0x0f172a);

    this.add.text(380, 40, 'LEVEL 2: SOCIAL ENGINEERING INCIDENT', {
      fontSize: '32px',
      color: '#ffffff',
    });

    this.statusText = this.add.text(
      300,
      85,
      'Recovered evidence suggests insider assistance.',
      {
        fontSize: '20px',
        color: '#facc15',
      }
    );

    this.objectiveText = this.add.text(
      20,
      35,
      '□ Gain employee trust\n□ Access restricted area',
      {
        fontSize: '20px',
        color: '#ffffff',
        lineSpacing: 8,
      }
    );

    this.trustText = this.add.text(1000, 40, 'Trust: 0%', {
      fontSize: '24px',
      color: '#00ff99',
    });

    this.add.text(425, 180, 'OPERATIONS CHECKPOINT', {
      fontSize: '24px',
      color: '#64748b',
    });

    this.add.rectangle(640, 430, 1000, 420, 0x111827);

    // Desk
    this.add.rectangle(640, 370, 320, 40, 0x334155);

    // Worker
    this.worker = this.add.sprite(640, 290, 'player');
    this.worker.setScale(2.4);
    this.worker.setTint(0xfacc15);

    this.add.text(605, 240, 'Employee', {
      color: '#ffffff',
      fontSize: '18px',
    });

    // Door
    this.add.rectangle(1040, 370, 60, 120, 0x7f1d1d);

    this.add.text(1000, 450, 'Restricted', {
      color: '#ffcccc',
    });

    this.player = this.physics.add.sprite(160, 560, 'player');
    this.player.setScale(1.8);
    this.player.setCollideWorldBounds(true);

    this.keys = this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
    });

    this.interactText = this.add.text(420, 670, '', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 12,
        y: 8,
      },
    });

    this.physics.add.overlap(
      this.player,
      this.worker,
      () => {
        this.interactText.setText(
          this.workerConvinced
            ? 'Employee trusts you'
            : 'Press E to talk'
        );

        if (
          Phaser.Input.Keyboard.JustDown(this.keys.e) &&
          !this.workerConvinced
        ) {
          this.startDialogue();
        }
      }
    );
  }

  startDialogue() {
    const answer = prompt(
`EMPLOYEE:
"I don't recognize you. Why are you here?"

A) "Emergency HVAC maintenance."

B) "Just let me through."

C) "Your supervisor approved access."`
    );

    if (!answer) return;

    switch (answer.toLowerCase()) {
      case 'a':
        this.trustScore += 35;
        this.statusText.setText(
          'Status: Plausible explanation provided.'
        );
        break;

      case 'c':
        this.trustScore += 65;
        this.statusText.setText(
          'Status: Social proof increased trust.'
        );
        break;

      case 'b':
        this.trustScore -= 20;
        this.statusText.setText(
          'Status: Suspicious response lowered trust.'
        );
        break;
    }

    this.trustScore = Phaser.Math.Clamp(
      this.trustScore,
      0,
      100
    );

    this.trustText.setText(
      `Trust: ${this.trustScore}%`
    );

    if (this.trustScore >= 60) {
      this.workerConvinced = true;

      this.statusText.setText(
        'ACCESS GRANTED: Employee trusts you.'
      );

      this.objectiveText.setText(
`✓ Gain employee trust
✓ Access restricted area`
      );

      this.time.delayedCall(1500, () => {
        alert(
          'Level Complete!\n\nYou successfully used social engineering techniques to gain access.'
        );
      });
    }
  }

  update() {
    const speed = 240;

    this.player.setVelocity(0);

    if (this.keys.w.isDown) {
      this.player.setVelocityY(-speed);
    }

    if (this.keys.s.isDown) {
      this.player.setVelocityY(speed);
    }

    if (this.keys.a.isDown) {
      this.player.setVelocityX(-speed);
    }

    if (this.keys.d.isDown) {
      this.player.setVelocityX(speed);
    }

    this.interactText.setText('');
  }
}