import Phaser from 'phaser';

export default class Level2Scene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  keys!: any;

  interactText!: Phaser.GameObjects.Text;
  statusText!: Phaser.GameObjects.Text;
  objectiveText!: Phaser.GameObjects.Text;
  trustText!: Phaser.GameObjects.Text;
  suspicionText!: Phaser.GameObjects.Text;

  trustBar!: Phaser.GameObjects.Rectangle;
  suspicionBar!: Phaser.GameObjects.Rectangle;

  worker!: Phaser.GameObjects.Sprite;
  restrictedDoor!: Phaser.GameObjects.Rectangle;
  dialogueOverlay?: Phaser.GameObjects.Container;

  workerConvinced = false;
  levelComplete = false;
  dialogueOpen = false;

  trustScore = 0;
  suspicionScore = 0;

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

    // Background
    this.add.rectangle(640, 400, 1280, 800, 0x0f172a);

    // HUD
    this.add.rectangle(640, 80, 1280, 160, 0x020617);

    this.add.text(320, 25, 'LEVEL 2: SOCIAL ENGINEERING INCIDENT', {
      fontSize: '32px',
      color: '#ffffff',
    });

    this.statusText = this.add.text(
      310,
      72,
      'Recovered evidence suggests insider assistance.',
      {
        fontSize: '20px',
        color: '#facc15',
      }
    );

    this.objectiveText = this.add.text(
      20,
      30,
      '□ Gain employee trust\n□ Access restricted area',
      {
        fontSize: '20px',
        color: '#ffffff',
        lineSpacing: 8,
      }
    );

    this.trustText = this.add.text(960, 25, 'TRUST: 0%', {
      fontSize: '22px',
      color: '#00ff99',
    });

    this.suspicionText = this.add.text(960, 70, 'SUSPICION: 0%', {
      fontSize: '22px',
      color: '#f97316',
    });

    this.add.rectangle(1110, 55, 180, 12, 0x334155);
    this.trustBar = this.add.rectangle(1020, 55, 0, 12, 0x00ff99).setOrigin(0, 0.5);

    this.add.rectangle(1110, 100, 180, 12, 0x334155);
    this.suspicionBar = this.add.rectangle(1020, 100, 0, 12, 0xf97316).setOrigin(0, 0.5);

    // Room
    this.add.rectangle(640, 465, 1040, 500, 0x111827);
    this.add.rectangle(640, 215, 1040, 20, 0x334155);
    this.add.rectangle(640, 715, 1040, 20, 0x334155);
    this.add.rectangle(120, 465, 20, 500, 0x334155);
    this.add.rectangle(1160, 465, 20, 500, 0x334155);

    // Floor grid
    for (let x = 160; x <= 1120; x += 80) {
      this.add.line(x, 465, 0, -230, 0, 230, 0x1f2937, 0.35);
    }

    for (let y = 260; y <= 680; y += 80) {
      this.add.line(640, y, -500, 0, 500, 0, 0x1f2937, 0.35);
    }

    this.add.text(430, 245, 'OPERATIONS CHECKPOINT', {
      fontSize: '24px',
      color: '#64748b',
    });

    // Desk
    this.add.rectangle(640, 420, 360, 50, 0x334155);
    this.add.text(560, 455, 'Security Desk', {
      fontSize: '16px',
      color: '#94a3b8',
    });

    // Worker
    this.worker = this.add.sprite(640, 335, 'player');
    this.worker.setScale(2.4);
    this.worker.setTint(0xfacc15);

    this.add.text(600, 285, 'Employee', {
      color: '#ffffff',
      fontSize: '18px',
    });

    // Restricted door
    this.restrictedDoor = this.add.rectangle(1040, 420, 70, 140, 0x7f1d1d);
    this.restrictedDoor.setStrokeStyle(3, 0xff3333);

    this.add.text(990, 510, 'Restricted', {
      color: '#ffcccc',
      fontSize: '18px',
    });

    // Laptop / work order clue
    const workOrder = this.add.rectangle(400, 540, 90, 50, 0x0f172a);
    workOrder.setStrokeStyle(3, 0x38bdf8);

    this.add.text(360, 580, 'Work Order', {
      color: '#ffffff',
      fontSize: '16px',
    });

    this.physics.add.existing(workOrder, true);

    // Player
    this.player = this.physics.add.sprite(180, 620, 'player');
    this.player.setScale(1.8);
    this.player.setCollideWorldBounds(true);

    this.keys = this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
    });

    this.interactText = this.add.text(420, 745, '', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 12,
        y: 8,
      },
    });

    this.physics.add.existing(this.worker, true);
    this.physics.add.existing(this.restrictedDoor, true);

    this.physics.add.overlap(this.player, workOrder, () => {
      this.interactText.setText('Press E to inspect work order');

      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
        this.statusText.setText(
          'Work order found: HVAC maintenance approved by Ops Supervisor.'
        );
        this.adjustTrust(15);
      }
    });

    this.physics.add.overlap(this.player, this.worker, () => {
      this.interactText.setText(
        this.workerConvinced
          ? 'Employee trusts you'
          : 'Press E to speak with employee'
      );

      if (
        Phaser.Input.Keyboard.JustDown(this.keys.e) &&
        !this.workerConvinced &&
        !this.dialogueOpen
      ) {
        this.openDialogue();
      }
    });

    this.physics.add.overlap(this.player, this.restrictedDoor, () => {
      if (this.workerConvinced) {
        this.interactText.setText('Press E to enter restricted area');

        if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
          this.completeLevel();
        }
      } else {
        this.interactText.setText('Access denied: employee approval required');
      }
    });
  }

  openDialogue() {
    this.dialogueOpen = true;
    this.player.setVelocity(0);

    const bg = this.add.rectangle(640, 430, 820, 430, 0x020617, 0.97);
    bg.setStrokeStyle(3, 0x00ff99);

    const title = this.add.text(290, 245, 'EMPLOYEE CHECKPOINT DIALOGUE', {
      fontSize: '26px',
      color: '#00ff99',
    });

    const promptText = this.add.text(
      290,
      300,
      `"I don't recognize you. Why are you here?"`,
      {
        fontSize: '22px',
        color: '#ffffff',
        wordWrap: { width: 720 },
      }
    );

    const optionA = this.add.text(
      310,
      375,
      '[ A ] Emergency HVAC maintenance. Check the work order.',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#111827',
        padding: { x: 12, y: 8 },
      }
    );

    const optionB = this.add.text(
      310,
      435,
      '[ B ] Just open the door. I do not have time for this.',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#111827',
        padding: { x: 12, y: 8 },
      }
    );

    const optionC = this.add.text(
      310,
      495,
      '[ C ] Your supervisor approved this access request.',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#111827',
        padding: { x: 12, y: 8 },
      }
    );

    const close = this.add.text(730, 610, 'ESC / X = close', {
      fontSize: '18px',
      color: '#94a3b8',
    });

    this.dialogueOverlay = this.add.container(0, 0, [
      bg,
      title,
      promptText,
      optionA,
      optionB,
      optionC,
      close,
    ]);

    this.dialogueOverlay.setDepth(100);

    optionA.setInteractive({ useHandCursor: true });
    optionB.setInteractive({ useHandCursor: true });
    optionC.setInteractive({ useHandCursor: true });

    optionA.on('pointerdown', () => {
      this.adjustTrust(35);
      this.statusText.setText('Plausible explanation provided.');
      this.closeDialogue();
      this.checkTrustOutcome();
    });

    optionB.on('pointerdown', () => {
      this.adjustSuspicion(30);
      this.statusText.setText('Suspicious response. Employee is uncomfortable.');
      this.closeDialogue();
    });

    optionC.on('pointerdown', () => {
      this.adjustTrust(50);
      this.statusText.setText('Social proof increased trust.');
      this.closeDialogue();
      this.checkTrustOutcome();
    });

    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const xKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    escKey?.once('down', () => this.closeDialogue());
    xKey?.once('down', () => this.closeDialogue());
  }

  closeDialogue() {
    if (!this.dialogueOpen) return;

    this.dialogueOpen = false;
    this.dialogueOverlay?.destroy();
  }

  adjustTrust(amount: number) {
    if (this.workerConvinced || this.levelComplete) return;

    this.trustScore = Phaser.Math.Clamp(this.trustScore + amount, 0, 100);
    this.trustText.setText(`TRUST: ${this.trustScore}%`);
    this.trustBar.width = 180 * (this.trustScore / 100);

    if (this.trustScore >= 60) {
      this.checkTrustOutcome();
    }
  }

  adjustSuspicion(amount: number) {
    if (this.workerConvinced || this.levelComplete) return;

    this.suspicionScore = Phaser.Math.Clamp(this.suspicionScore + amount, 0, 100);
    this.suspicionText.setText(`SUSPICION: ${this.suspicionScore}%`);
    this.suspicionBar.width = 180 * (this.suspicionScore / 100);

    if (this.suspicionScore >= 100) {
      this.failLevel();
    }
  }

  checkTrustOutcome() {
    if (this.trustScore < 60 || this.workerConvinced) return;

    this.workerConvinced = true;

    this.statusText.setText('ACCESS GRANTED: Employee trusts your explanation.');
    this.objectiveText.setText('✓ Gain employee trust\n□ Access restricted area');

    this.restrictedDoor.fillColor = 0x14532d;
    this.restrictedDoor.setStrokeStyle(3, 0x22c55e);

    this.cameras.main.shake(150, 0.003);
  }

  completeLevel() {
    if (this.levelComplete) return;

    this.levelComplete = true;

    this.objectiveText.setText('✓ Gain employee trust\n✓ Access restricted area');
    this.statusText.setText('LEVEL COMPLETE: Restricted area accessed.');

    this.cameras.main.fadeOut(1400, 0, 0, 0);

    this.time.delayedCall(1600, () => {
      alert(
        'Level 2 Complete!\n\nYou used social engineering awareness, supporting evidence, and trust-building to gain access.'
      );
    });
  }

  failLevel() {
    this.levelComplete = true;
    this.player.setVelocity(0);

    this.statusText.setText('MISSION FAILED: Employee alerted security.');

    this.add.text(380, 390, 'MISSION FAILED', {
      fontSize: '54px',
      color: '#ff3333',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    });

    this.add.text(325, 470, 'Suspicion reached 100%. Security was alerted.', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    });
  }

  update() {
    if (this.levelComplete || this.dialogueOpen) {
      this.player.setVelocity(0);
      return;
    }

    const speed = 240;

    this.player.setVelocity(0);

    if (this.keys.w.isDown) this.player.setVelocityY(-speed);
    if (this.keys.s.isDown) this.player.setVelocityY(speed);
    if (this.keys.a.isDown) this.player.setVelocityX(-speed);
    if (this.keys.d.isDown) this.player.setVelocityX(speed);

    this.interactText.setText('');
  }
}