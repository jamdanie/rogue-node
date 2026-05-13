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
  securityDoor!: Phaser.GameObjects.Sprite;

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
    this.createPixelAssets();

    this.cameras.main.setBackgroundColor('#050816');

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
      fontSize: '24px',
      color: '#ff4444',
    });

    this.statusText = this.add.text(
      450,
      80,
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

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    this.add.rectangle(640, 500, 1160, 480, 0x141c2f);

    this.add.text(130, 260, 'ACCESS CONTROL ROOM', {
      fontSize: '20px',
      color: '#6b7280',
    });

    this.add.text(875, 260, 'OPERATIONS ROOM', {
      fontSize: '20px',
      color: '#6b7280',
    });

    this.walls = this.physics.add.staticGroup();

    const createWall = (x: number, y: number, width: number, height: number) => {
      const wall = this.add.rectangle(x, y, width, height, 0x3b4252);
      this.physics.add.existing(wall, true);
      this.walls.add(wall as any);
    };

    createWall(640, 250, 1160, 20);
    createWall(640, 730, 1160, 20);
    createWall(60, 500, 20, 480);
    createWall(1220, 500, 20, 480);
    createWall(780, 370, 25, 180);
    createWall(780, 650, 25, 180);

    this.securityDoor = this.add.sprite(780, 510, 'door');
    this.securityDoor.setScale(2.1);
    this.physics.add.existing(this.securityDoor, true);
    this.walls.add(this.securityDoor as any);

    this.tweens.add({
      targets: this.securityDoor,
      alpha: 0.45,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    for (let y = 340; y <= 560; y += 90) {
      const rack = this.add.sprite(340, y, 'serverRack');
      rack.setScale(2.2);

      const light = this.add.circle(358, y - 25, 4, 0x00ff66);

      this.tweens.add({
        targets: light,
        alpha: 0.2,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });

      this.physics.add.existing(rack, true);
      this.walls.add(rack as any);
    }

    const badge = this.add.sprite(170, 340, 'badgeReader').setScale(2.2);
    const worker = this.add.sprite(500, 380, 'worker').setScale(2.2);
    const patch = this.add.sprite(930, 340, 'patchPanel').setScale(2.2);
    const terminal = this.add.sprite(930, 560, 'terminal').setScale(2.2);
    const cameraPanel = this.add.sprite(1030, 560, 'camera').setScale(2.2);
    const rogueTerminal = this.add.sprite(1090, 340, 'rogueNode').setScale(2.6);

    this.tweens.add({
      targets: rogueTerminal,
      scaleX: 2.95,
      scaleY: 2.95,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: rogueTerminal,
      alpha: 0.65,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    [terminal, cameraPanel].forEach((obj) => {
      this.tweens.add({
        targets: obj,
        alpha: 0.55,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
    });

    this.add.text(135, 390, 'Badge', { color: '#ffffff' });
    this.add.text(470, 440, 'Worker', { color: '#ffffff' });
    this.add.text(885, 390, 'Patch Panel', { color: '#ffffff' });
    this.add.text(900, 610, 'Terminal', { color: '#ffffff' });
    this.add.text(1000, 610, 'Cameras', { color: '#ffffff' });

    this.add.text(1038, 415, 'ROGUE NODE', {
      fontSize: '20px',
      color: '#ffcccc',
    });

    [badge, worker, patch, terminal, cameraPanel, rogueTerminal].forEach(
      (obj) => this.physics.add.existing(obj, true)
    );

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

    this.setupInteraction(
      badge,
      () => (this.badgeComplete ? 'Badge verified' : 'Press E to scan badge'),
      () => {
        if (this.badgeComplete) return;

        this.badgeComplete = true;
        this.addScore(10);
        this.statusText.setText('Status: Badge verified. Check worker identity.');
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
        this.statusText.setText('Status: Access-control risks cleared.');
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

  createPixelAssets() {
    const makeTexture = (
      key: string,
      draw: (g: Phaser.GameObjects.Graphics) => void,
      width = 48,
      height = 48
    ) => {
      const g = this.add.graphics();
      draw(g);
      g.generateTexture(key, width, height);
      g.destroy();
    };

    makeTexture('badgeReader', (g) => {
      g.fillStyle(0x0f172a);
      g.fillRect(6, 4, 36, 40);
      g.lineStyle(3, 0x38bdf8);
      g.strokeRect(6, 4, 36, 40);
      g.fillStyle(0x22c55e);
      g.fillRect(16, 10, 16, 6);
      g.fillStyle(0xffffff);
      g.fillRect(18, 24, 12, 4);
      g.fillRect(18, 31, 12, 4);
    });

    makeTexture('worker', (g) => {
      g.fillStyle(0xfacc15);
      g.fillRect(16, 4, 16, 10);
      g.fillStyle(0xffcc99);
      g.fillRect(14, 14, 20, 16);
      g.fillStyle(0x1f2937);
      g.fillRect(12, 30, 24, 14);
      g.fillStyle(0xffffff);
      g.fillRect(17, 18, 4, 4);
      g.fillRect(27, 18, 4, 4);
    });

    makeTexture('patchPanel', (g) => {
      g.fillStyle(0x111827);
      g.fillRect(4, 8, 40, 30);
      g.lineStyle(3, 0xf59e0b);
      g.strokeRect(4, 8, 40, 30);
      g.fillStyle(0x38bdf8);
      for (let x = 10; x <= 34; x += 8) {
        g.fillRect(x, 18, 4, 6);
      }
      g.lineStyle(2, 0x22c55e);
      g.lineBetween(12, 32, 20, 40);
      g.lineBetween(28, 32, 36, 40);
    });

    makeTexture('terminal', (g) => {
      g.fillStyle(0x0f172a);
      g.fillRect(4, 6, 40, 28);
      g.lineStyle(3, 0x00ff99);
      g.strokeRect(4, 6, 40, 28);
      g.fillStyle(0x00ff99);
      g.fillRect(10, 14, 24, 4);
      g.fillRect(10, 22, 16, 4);
      g.fillStyle(0x334155);
      g.fillRect(18, 34, 12, 8);
      g.fillRect(12, 42, 24, 4);
    });

    makeTexture('camera', (g) => {
      g.fillStyle(0x312e81);
      g.fillRect(8, 14, 30, 18);
      g.lineStyle(3, 0xa78bfa);
      g.strokeRect(8, 14, 30, 18);
      g.fillStyle(0x000000);
      g.fillCircle(18, 23, 6);
      g.fillStyle(0x60a5fa);
      g.fillCircle(18, 23, 3);
      g.fillStyle(0xa78bfa);
      g.fillRect(34, 18, 8, 10);
    });

    makeTexture('rogueNode', (g) => {
      g.fillStyle(0x450a0a);
      g.fillRect(4, 4, 40, 40);
      g.lineStyle(4, 0xff0033);
      g.strokeRect(4, 4, 40, 40);
      g.fillStyle(0xff0033);
      g.fillCircle(24, 24, 12);
      g.fillStyle(0xffffff);
      g.fillCircle(24, 24, 5);
      g.lineStyle(2, 0xffcccc);
      g.lineBetween(24, 8, 24, 16);
      g.lineBetween(24, 32, 24, 40);
      g.lineBetween(8, 24, 16, 24);
      g.lineBetween(32, 24, 40, 24);
    });

    makeTexture('door', (g) => {
      g.fillStyle(0x450a0a);
      g.fillRect(10, 2, 28, 44);
      g.lineStyle(3, 0xff3333);
      g.strokeRect(10, 2, 28, 44);
      g.fillStyle(0xff3333);
      g.fillRect(14, 20, 20, 6);
    });

    makeTexture('serverRack', (g) => {
      g.fillStyle(0x020617);
      g.fillRect(8, 2, 32, 44);
      g.lineStyle(2, 0x00ff66);
      g.strokeRect(8, 2, 32, 44);
      g.fillStyle(0x334155);
      g.fillRect(12, 8, 24, 5);
      g.fillRect(12, 18, 24, 5);
      g.fillRect(12, 28, 24, 5);
      g.fillStyle(0x22c55e);
      g.fillCircle(32, 10, 2);
      g.fillCircle(32, 20, 2);
      g.fillCircle(32, 30, 2);
    });
  }

  updateTimer() {
    if (this.missionComplete || this.missionFailed) return;

    this.timeRemaining--;

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;

    this.timerText.setText(
      `DATA LEAK: ${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    );

    if (this.timeRemaining <= 60) {
      this.tweens.add({
        targets: this.timerText,
        alpha: 0.2,
        duration: 300,
        yoyo: true,
      });
    }

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

      this.securityDoor.setTexture('door');
      this.securityDoor.setTint(0x22c55e);
      this.securityDoor.alpha = 1;

      this.walls.remove(this.securityDoor as any);

      const body = this.securityDoor.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = false;

      this.statusText.setText('Status: Door unlocked. Investigate Operations Room.');
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