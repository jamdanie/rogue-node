import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  keys!: any;

  interactText!: Phaser.GameObjects.Text;
  scoreText!: Phaser.GameObjects.Text;
  objectiveText!: Phaser.GameObjects.Text;
  statusText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;

  score = 0;
  timeRemaining = 300;

  badgeComplete = false;
  employeeComplete = false;
  patchComplete = false;
  terminalComplete = false;
  cameraComplete = false;
  rogueTerminalComplete = false;

  doorUnlocked = false;
  missionComplete = false;
  missionFailed = false;

  walls!: Phaser.Physics.Arcade.StaticGroup;
  securityDoor!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('main-scene');
  }

  preload() {
    this.load.image(
      'player',
      'https://labs.phaser.io/assets/sprites/phaser-dude.png'
    );
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d1117');

    // ===== HUD =====
    this.add.rectangle(640, 95, 1280, 190, 0x0b1220);

    this.add.text(20, 20, 'Rogue Node: Data Center Containment', {
      fontSize: '30px',
      color: '#ffffff',
    });

    this.scoreText = this.add.text(1010, 25, 'Security Score: 0', {
      fontSize: '22px',
      color: '#00ff99',
    });

    this.timerText = this.add.text(1010, 60, 'DATA LEAK: 05:00', {
      fontSize: '22px',
      color: '#ff5555',
    });

    this.statusText = this.add.text(
      480,
      85,
      'Status: Investigate access-control risks',
      {
        fontSize: '20px',
        color: '#facc15',
      }
    );

    this.objectiveText = this.add.text(20, 65, '', {
      fontSize: '20px',
      color: '#ffffff',
      lineSpacing: 8,
    });

    this.updateObjectives();

    // Timer event
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // ===== GAME FLOOR =====
    this.add.rectangle(640, 500, 1160, 480, 0x1e2936);

    this.add.text(130, 260, 'ACCESS CONTROL ROOM', {
      fontSize: '20px',
      color: '#94a3b8',
    });

    this.add.text(875, 260, 'OPERATIONS ROOM', {
      fontSize: '20px',
      color: '#94a3b8',
    });

    this.walls = this.physics.add.staticGroup();

    const createWall = (
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const wall = this.add.rectangle(x, y, width, height, 0x444444);
      this.physics.add.existing(wall, true);
      this.walls.add(wall as any);
    };

    createWall(640, 250, 1160, 20);
    createWall(640, 730, 1160, 20);
    createWall(60, 500, 20, 480);
    createWall(1220, 500, 20, 480);

    createWall(780, 370, 25, 180);
    createWall(780, 650, 25, 180);

    this.securityDoor = this.add.rectangle(780, 510, 55, 130, 0xaa0000);
    this.physics.add.existing(this.securityDoor, true);
    this.walls.add(this.securityDoor as any);

    for (let y = 340; y <= 560; y += 90) {
      const rack = this.add.rectangle(340, y, 70, 80, 0x101010);
      rack.setStrokeStyle(2, 0x00ff66);

      this.physics.add.existing(rack, true);
      this.walls.add(rack as any);
    }

    // ===== OBJECTS =====
    const badge = this.add.rectangle(170, 340, 70, 70, 0x0066ff);
    const worker = this.add.rectangle(500, 380, 55, 90, 0xffff00);
    const patch = this.add.rectangle(930, 340, 70, 70, 0xffaa00);
    const terminal = this.add.rectangle(930, 560, 70, 70, 0x00aa66);
    const cameraPanel = this.add.rectangle(1030, 560, 70, 70, 0xaa00ff);

    const rogueTerminal = this.add.rectangle(1090, 340, 110, 110, 0xff0033);
    rogueTerminal.setStrokeStyle(5, 0xffffff);

    this.add.text(140, 385, 'Badge', { color: '#ffffff' });
    this.add.text(470, 440, 'Worker', { color: '#ffffff' });
    this.add.text(885, 385, 'Patch Panel', { color: '#ffffff' });
    this.add.text(900, 605, 'Terminal', { color: '#ffffff' });
    this.add.text(1000, 605, 'Cameras', { color: '#ffffff' });

    this.add.text(1040, 410, 'ROGUE NODE', {
      fontSize: '20px',
      color: '#ffcccc',
    });

    [badge, worker, patch, terminal, cameraPanel, rogueTerminal].forEach(
      (obj) => this.physics.add.existing(obj, true)
    );

    // Player
    this.player = this.physics.add.sprite(120, 650, 'player');
    this.player.setScale(1.8);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.walls);

    this.keys = this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
    });

    this.interactText = this.add.text(430, 760, '', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 12,
        y: 8,
      },
    });

    // ===== INTERACTIONS =====
    this.setupInteraction(
      badge,
      () =>
        this.badgeComplete
          ? 'Badge verified'
          : 'Press E to scan badge',
      () => {
        if (this.badgeComplete) return;

        this.badgeComplete = true;
        this.addScore(10);
        this.updateObjectives();
        this.checkDoorUnlock();
      }
    );

    this.setupInteraction(
      worker,
      () =>
        this.employeeComplete
          ? 'Worker verified'
          : 'Press E to verify worker',
      () => {
        if (this.employeeComplete) return;

        this.employeeComplete = true;
        this.addScore(10);
        this.updateObjectives();
        this.checkDoorUnlock();
      }
    );

    this.setupInteraction(
      patch,
      () =>
        this.patchComplete
          ? 'Patch panel inspected'
          : 'Press E to inspect patch panel',
      () => {
        if (this.patchComplete) return;

        const answer = prompt(
          'NETWORK QUESTION:\n\nWhich cable is commonly used for Ethernet?\n\nA) HDMI\nB) Cat6'
        );

        if (answer?.toLowerCase() === 'b') {
          this.patchComplete = true;
          this.addScore(10);
          this.statusText.setText('Status: Network cabling verified.');
          this.updateObjectives();
        }
      }
    );

    this.setupInteraction(
      terminal,
      () =>
        this.terminalComplete
          ? 'Terminal reviewed'
          : 'Press E to access terminal',
      () => {
        if (this.terminalComplete) return;

        const answer = prompt(
          'CIA TRIAD:\n\nWhich option correctly names the CIA Triad?\n\nA) Confidentiality Integrity Availability\nB) Cyber Intelligence Access'
        );

        if (answer?.toLowerCase() === 'a') {
          this.terminalComplete = true;
          this.addScore(10);
          this.statusText.setText('Status: CIA Triad confirmed.');
          this.updateObjectives();
        }
      }
    );

    this.setupInteraction(
      cameraPanel,
      () =>
        this.cameraComplete
          ? 'Cameras reviewed'
          : 'Press E to inspect cameras',
      () => {
        if (this.cameraComplete) return;

        const answer = prompt(
          'CAMERA REVIEW:\n\nWhat is the safest action when a camera blind spot is found?\n\nA) Ignore it\nB) Document and report it'
        );

        if (answer?.toLowerCase() === 'b') {
          this.cameraComplete = true;
          this.addScore(10);
          this.statusText.setText('Status: Camera blind spots documented.');
          this.updateObjectives();
        }
      }
    );

    this.setupInteraction(
      rogueTerminal,
      () =>
        this.rogueTerminalComplete
          ? 'Mission complete'
          : 'Press E to contain Rogue Node',
      () => {
        if (this.rogueTerminalComplete) return;

        if (!this.patchComplete || !this.terminalComplete || !this.cameraComplete) {
          alert('Complete Operations Room objectives first.');
          return;
        }

        const answer = prompt(
          'FINAL CONTAINMENT:\n\nUnauthorized outbound traffic is detected.\n\nWhat should the analyst do first?\n\nA) Document evidence and isolate the affected system\nB) Delete random files'
        );

        if (answer?.toLowerCase() === 'a') {
          this.rogueTerminalComplete = true;
          this.missionComplete = true;
          this.addScore(20);
          this.statusText.setText('MISSION COMPLETE: Rogue Node contained');
          this.timerText.setText('DATA LEAK: CONTAINED');
          this.updateObjectives();

          alert(
            'Mission Complete!\n\nYou successfully identified and contained the Rogue Node before the data leak completed.'
          );
        }
      }
    );
  }

  updateTimer() {
    if (this.missionComplete || this.missionFailed) return;

    this.timeRemaining -= 1;

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;

    this.timerText.setText(
      `DATA LEAK: ${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    );

    if (this.timeRemaining <= 0) {
      this.failMission();
    }
  }

  failMission() {
    this.missionFailed = true;

    this.player.setVelocity(0);

    this.statusText.setText('MISSION FAILED: Unauthorized exfiltration completed');
    this.timerText.setText('DATA LEAK: FAILED');

    this.add.text(330, 420, 'MISSION FAILED', {
      fontSize: '54px',
      color: '#ff3333',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    });

    this.add.text(300, 500, 'Unauthorized exfiltration completed.', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    });
  }

  checkDoorUnlock() {
    if (this.badgeComplete && this.employeeComplete && !this.doorUnlocked) {
      this.doorUnlocked = true;

      this.securityDoor.fillColor = 0x00ff00;

      this.walls.remove(this.securityDoor as any);

      const body = this.securityDoor.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = false;

      this.statusText.setText(
        'Status: Door unlocked. Investigate Operations Room.'
      );
    }
  }

  setupInteraction(
    object: any,
    getText: () => string,
    action: () => void
  ) {
    this.physics.add.overlap(this.player, object, () => {
      if (this.missionComplete || this.missionFailed) return;

      this.interactText.setText(getText());

      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
        action();
      }
    });
  }

  addScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Security Score: ${this.score}`);
  }

  updateObjectives() {
    const done = (value: boolean) => (value ? '✓' : '□');

    this.objectiveText.setText(
`${done(this.badgeComplete)} Verify badge access
${done(this.employeeComplete)} Verify employee
${done(this.patchComplete)} Inspect patch panel
${done(this.terminalComplete)} Access terminal
${done(this.cameraComplete)} Review cameras
${done(this.rogueTerminalComplete)} Contain Rogue Node`
    );
  }

  update() {
    if (this.missionComplete || this.missionFailed) {
      this.player.setVelocity(0);
      return;
    }

    const speed = 260;

    this.player.setVelocity(0);

    if (this.keys.w.isDown) this.player.setVelocityY(-speed);
    if (this.keys.s.isDown) this.player.setVelocityY(speed);
    if (this.keys.a.isDown) this.player.setVelocityX(-speed);
    if (this.keys.d.isDown) this.player.setVelocityX(speed);

    this.interactText.setText('');
  }
}