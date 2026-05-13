import Phaser from 'phaser';

type TerminalScenario = {
  title: string;
  body: string;
  optionA: string;
  optionB: string;
  correct: 'A' | 'B';
  successStatus: string;
};

export default class MainScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  keys!: any;

  interactText!: Phaser.GameObjects.Text;
  scoreText!: Phaser.GameObjects.Text;
  objectiveText!: Phaser.GameObjects.Text;
  statusText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  threatText!: Phaser.GameObjects.Text;

  playerLight!: Phaser.GameObjects.Arc;
  rogueGlow!: Phaser.GameObjects.Arc;

  terminalOverlay?: Phaser.GameObjects.Container;

  guard!: Phaser.GameObjects.Sprite;
  guardDetectionCircle!: Phaser.GameObjects.Arc;
  guardDirection = 1;
  guardMinX = 230;
  guardMaxX = 650;
  guardSpeed = 85;

  score = 0;
  timeRemaining = 300;
  threatLevel = 0;

  badgeComplete = false;
  employeeComplete = false;
  serverClueComplete = false;
  laptopComplete = false;
  patchComplete = false;
  terminalComplete = false;
  cameraComplete = false;
  rogueTerminalComplete = false;

  doorUnlocked = false;
  missionComplete = false;
  missionFailed = false;
  terminalOpen = false;

  walls!: Phaser.Physics.Arcade.StaticGroup;
  securityDoor!: Phaser.GameObjects.Sprite;
  cameraZone!: Phaser.GameObjects.Rectangle;

  terminalScenarios: TerminalScenario[] = [
    {
      title: 'OUTBOUND TRAFFIC ALERT',
      body: `> scan outbound traffic

Suspicious outbound connection detected.

SOURCE:      OPS-RACK-03
DESTINATION: 185.199.108.153
PORT:        6667
STATUS:      UNAUTHORIZED

Which CIA Triad principle is MOST at risk if unauthorized data leaves the network?`,
      optionA: 'Confidentiality',
      optionB: 'Availability',
      correct: 'A',
      successStatus: 'Status: SOC terminal reviewed. Confidentiality risk confirmed.',
    },
    {
      title: 'FAILED LOGIN ALERT',
      body: `> review auth logs

Multiple failed login attempts detected.

ACCOUNT:     admin.ops
SOURCE IP:   203.0.113.44
ATTEMPTS:    27
STATUS:      LOCKOUT TRIGGERED

What is the safest first response?`,
      optionA: 'Ignore it unless the user complains',
      optionB: 'Document, verify, and escalate the suspicious activity',
      correct: 'B',
      successStatus: 'Status: Suspicious login activity documented and escalated.',
    },
    {
      title: 'RANSOMWARE WARNING',
      body: `> inspect file server

Unusual file rename activity detected.

HOST:        FILE-SRV-02
PATTERN:     .locked extension
RATE:        400 files/minute
STATUS:      ACTIVE SPREAD

What should the analyst prioritize first?`,
      optionA: 'Isolate affected system and preserve evidence',
      optionB: 'Delete random files to slow it down',
      correct: 'A',
      successStatus: 'Status: Ransomware response selected. Isolation prioritized.',
    },
    {
      title: 'PORT SCAN DETECTED',
      body: `> inspect IDS alert

Possible reconnaissance detected.

SOURCE:      198.51.100.77
TARGET:      OPS-NET
PORTS:       22, 80, 443, 3389, 8080
STATUS:      SCANNING

What does this activity most likely represent?`,
      optionA: 'Normal printer traffic',
      optionB: 'Reconnaissance / network scanning',
      correct: 'B',
      successStatus: 'Status: Reconnaissance activity identified.',
    },
    {
      title: 'INTEGRITY ALERT',
      body: `> verify config hash

Configuration mismatch detected.

DEVICE:      CORE-SWITCH-01
BASELINE:    MATCH FAILED
CHANGE LOG:  NO APPROVED CHANGE FOUND
STATUS:      UNAUTHORIZED MODIFICATION

Which CIA Triad principle is MOST directly affected?`,
      optionA: 'Integrity',
      optionB: 'Availability',
      correct: 'A',
      successStatus: 'Status: Integrity issue identified and flagged.',
    },
  ];

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

    this.cameras.main.setBackgroundColor('#020617');

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

    this.threatText = this.add.text(1010, 95, 'THREAT: 0%', {
      fontSize: '22px',
      color: '#f97316',
    });

    this.statusText = this.add.text(
      450,
      80,
      'Status: Avoid patrol and investigate access-control risks',
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

    this.add.rectangle(640, 500, 1160, 480, 0x111827);

    for (let x = 80; x <= 1200; x += 80) {
      this.add.line(x, 500, 0, -230, 0, 230, 0x1f2937, 0.35);
    }

    for (let y = 280; y <= 700; y += 80) {
      this.add.line(640, y, -560, 0, 560, 0, 0x1f2937, 0.35);
    }

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

    const serverRackZones: Phaser.GameObjects.Rectangle[] = [];

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

      const rackZone = this.add.rectangle(410, y, 120, 90, 0x00ff66, 0.01);
      this.physics.add.existing(rackZone, true);
      serverRackZones.push(rackZone);
    }

    const badge = this.add.sprite(170, 340, 'badgeReader').setScale(2.2);
    const worker = this.add.sprite(500, 380, 'worker').setScale(2.2);
    const laptop = this.add.sprite(610, 620, 'laptop').setScale(2.2);

    const patch = this.add.sprite(930, 340, 'patchPanel').setScale(2.2);
    const terminal = this.add.sprite(930, 560, 'terminal').setScale(2.2);
    const cameraPanel = this.add.sprite(1030, 560, 'camera').setScale(2.2);
    const rogueTerminal = this.add.sprite(1090, 340, 'rogueNode').setScale(2.6);

    this.cameraZone = this.add.rectangle(980, 455, 300, 150, 0xff0000, 0.03);
    this.cameraZone.setStrokeStyle(2, 0xff3333, 0.15);
    this.physics.add.existing(this.cameraZone, true);

    this.tweens.add({
      targets: this.cameraZone,
      alpha: 0.01,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.rogueGlow = this.add.circle(1090, 340, 95, 0xff0033, 0.18);

    this.tweens.add({
      targets: this.rogueGlow,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

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
    this.add.text(575, 665, 'Laptop', { color: '#ffffff' });
    this.add.text(885, 390, 'Patch Panel', { color: '#ffffff' });
    this.add.text(900, 610, 'Terminal', { color: '#ffffff' });
    this.add.text(1000, 610, 'Cameras', { color: '#ffffff' });

    this.add.text(1038, 415, 'ROGUE NODE', {
      fontSize: '20px',
      color: '#ffcccc',
    });

    [badge, worker, laptop, patch, terminal, cameraPanel, rogueTerminal].forEach(
      (obj) => this.physics.add.existing(obj, true)
    );

    this.playerLight = this.add.circle(120, 650, 130, 0x38bdf8, 0.12);

    this.tweens.add({
      targets: this.playerLight,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0.07,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    this.add.rectangle(640, 500, 1160, 480, 0x000000, 0.18).setDepth(5);

    this.playerLight.setDepth(6);
    this.rogueGlow.setDepth(6);

    this.guardDetectionCircle = this.add.circle(430, 610, 95, 0xff3333, 0.12);
    this.guardDetectionCircle.setStrokeStyle(2, 0xff6666, 0.6);
    this.guardDetectionCircle.setDepth(7);

    this.tweens.add({
      targets: this.guardDetectionCircle,
      scaleX: 1.18,
      scaleY: 1.18,
      alpha: 0.04,
      duration: 850,
      yoyo: true,
      repeat: -1,
    });

    this.guard = this.add.sprite(430, 610, 'guard');
    this.guard.setScale(2.2);
    this.guard.setDepth(9);

    this.add.text(405, 665, 'Patrol', {
      color: '#ffcccc',
      fontSize: '16px',
    }).setDepth(9);

    this.player = this.physics.add.sprite(120, 650, 'player');
    this.player.setScale(1.8);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    this.physics.add.collider(this.player, this.walls);

    this.physics.add.overlap(this.player, this.cameraZone, () => {
      if (this.missionComplete || this.missionFailed || this.cameraComplete) return;
      this.increaseThreat(0.4);
    });

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

    this.interactText.setDepth(20);

    this.setupInteraction(
      badge,
      () => (this.badgeComplete ? 'Badge verified' : 'Press E to scan badge'),
      () => {
        if (this.badgeComplete) return;

        this.playTone(700, 0.08);
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

        this.playTone(520, 0.08);
        this.employeeComplete = true;
        this.addScore(10);
        this.statusText.setText('Status: Access-control risks cleared.');
        this.updateObjectives();
        this.checkDoorUnlock();
      }
    );

    serverRackZones.forEach((zone) => {
      this.setupInteraction(
        zone,
        () =>
          this.serverClueComplete
            ? 'Server logs already reviewed'
            : 'Press E to inspect server logs',
        () => {
          if (this.serverClueComplete) return;

          this.playTone(640, 0.08);
          this.serverClueComplete = true;
          this.addScore(10);
          this.statusText.setText('Status: Server logs show outbound traffic from OPS-RACK-03.');
          this.updateObjectives();

          alert(
            `SERVER LOGS FOUND

OPS-RACK-03 shows repeated outbound traffic to an untrusted destination.

Clue:
The Rogue Node appears to be using a compromised operations rack as a relay point.`
          );
        }
      );
    });

    this.setupInteraction(
      laptop,
      () =>
        this.laptopComplete
          ? 'Laptop evidence reviewed'
          : 'Press E to inspect laptop',
      () => {
        if (this.laptopComplete) return;

        this.playTone(720, 0.08);
        this.laptopComplete = true;
        this.addScore(10);
        this.statusText.setText('Status: Laptop evidence recovered.');
        this.updateObjectives();

        alert(
          `LAPTOP EVIDENCE

Recovered note:

"Temporary VPN exception approved for contractor access.
Do not disable until after maintenance window."

Risk:
The laptop suggests poor access control and a possible unauthorized remote access path.`
        );
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
          this.playTone(600, 0.08);
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
          : 'Press E to open SOC terminal',
      () => {
        if (this.terminalComplete || this.terminalOpen) return;
        this.openTerminalMiniGame();
      }
    );

    this.setupInteraction(
      cameraPanel,
      () =>
        this.cameraComplete
          ? 'Cameras reviewed; detection zone disabled'
          : 'Press E to inspect cameras',
      () => {
        if (this.cameraComplete) return;

        const answer = prompt(
          'CAMERA REVIEW:\n\nWhat is the safest action when a camera blind spot is found?\n\nA) Ignore it\nB) Document and report it'
        );

        if (answer?.toLowerCase() === 'b') {
          this.playTone(680, 0.08);
          this.cameraComplete = true;
          this.cameraZone.destroy();
          this.addScore(10);
          this.statusText.setText('Status: Cameras reviewed. Detection zone disabled.');
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

        if (
          !this.serverClueComplete ||
          !this.laptopComplete ||
          !this.patchComplete ||
          !this.terminalComplete ||
          !this.cameraComplete
        ) {
          this.playTone(180, 0.12);
          alert(
            'You need more evidence before containment.\n\nRequired:\n- Server logs\n- Laptop evidence\n- Patch panel\n- SOC terminal\n- Cameras'
          );
          return;
        }

        const answer = prompt(
          'FINAL CONTAINMENT:\n\nUnauthorized outbound traffic is detected and supporting evidence has been collected.\n\nWhat should the analyst do first?\n\nA) Document evidence and isolate the affected system\nB) Delete random files'
        );

        if (answer?.toLowerCase() === 'a') {
          this.playSuccessSound();
          this.rogueTerminalComplete = true;
          this.missionComplete = true;
          this.addScore(20);
          this.statusText.setText('MISSION COMPLETE: Rogue Node contained');
          this.timerText.setText('DATA LEAK: CONTAINED');
          this.updateObjectives();

          this.cameras.main.shake(250, 0.006);

         this.cameras.main.fadeOut(1500, 0, 0, 0);

this.time.delayedCall(1700, () => {
  this.scene.start('level2-scene');
});
        }
      }
    );
  }

  openTerminalMiniGame() {
    this.terminalOpen = true;
    this.player.setVelocity(0);
    this.playTone(760, 0.08);

    const scenario = Phaser.Utils.Array.GetRandom(this.terminalScenarios);

    const overlayBg = this.add.rectangle(640, 430, 800, 450, 0x020617, 0.96);
    overlayBg.setStrokeStyle(3, 0x00ff99);

    const header = this.add.text(280, 230, `SOC TERMINAL // ${scenario.title}`, {
      fontSize: '24px',
      color: '#00ff99',
    });

    const body = this.add.text(280, 280, scenario.body, {
      fontSize: '18px',
      color: '#d1fae5',
      lineSpacing: 7,
      wordWrap: { width: 720 },
    });

    const optionA = this.add.text(310, 535, `[ A ] ${scenario.optionA}`, {
      fontSize: '21px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: { x: 12, y: 8 },
    });

    const optionB = this.add.text(310, 590, `[ B ] ${scenario.optionB}`, {
      fontSize: '21px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: { x: 12, y: 8 },
    });

    const closeText = this.add.text(700, 650, 'ESC / X = close', {
      fontSize: '18px',
      color: '#94a3b8',
    });

    this.terminalOverlay = this.add.container(0, 0, [
      overlayBg,
      header,
      body,
      optionA,
      optionB,
      closeText,
    ]);

    this.terminalOverlay.setDepth(100);

    const completeTerminal = () => {
      if (this.terminalComplete) return;

      this.playSuccessSound();
      this.terminalComplete = true;
      this.terminalOpen = false;
      this.addScore(10);
      this.statusText.setText(scenario.successStatus);
      this.updateObjectives();
      this.terminalOverlay?.destroy();
    };

    const wrongAnswer = () => {
      this.playTone(180, 0.12);
      this.increaseThreat(8);
      this.statusText.setText('Status: Incorrect SOC analysis increased threat.');
    };

    optionA.setInteractive({ useHandCursor: true });
    optionB.setInteractive({ useHandCursor: true });

    optionA.on('pointerdown', () => {
      scenario.correct === 'A' ? completeTerminal() : wrongAnswer();
    });

    optionB.on('pointerdown', () => {
      scenario.correct === 'B' ? completeTerminal() : wrongAnswer();
    });

    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const xKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    escKey?.once('down', () => this.closeTerminalMiniGame());
    xKey?.once('down', () => this.closeTerminalMiniGame());
  }

  closeTerminalMiniGame() {
    if (!this.terminalOpen) return;

    this.terminalOpen = false;
    this.terminalOverlay?.destroy();
    this.statusText.setText('Status: SOC terminal closed.');
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

    makeTexture('guard', (g) => {
      g.fillStyle(0x1e293b);
      g.fillRect(13, 10, 22, 30);
      g.fillStyle(0x111827);
      g.fillRect(10, 4, 28, 10);
      g.fillStyle(0xffcc99);
      g.fillRect(15, 14, 18, 13);
      g.fillStyle(0xffffff);
      g.fillRect(18, 18, 4, 4);
      g.fillRect(27, 18, 4, 4);
      g.fillStyle(0x38bdf8);
      g.fillRect(18, 31, 12, 4);
      g.fillStyle(0x000000);
      g.fillRect(12, 40, 8, 6);
      g.fillRect(28, 40, 8, 6);
    });

    makeTexture('laptop', (g) => {
      g.fillStyle(0x020617);
      g.fillRect(8, 10, 32, 22);
      g.lineStyle(3, 0x38bdf8);
      g.strokeRect(8, 10, 32, 22);
      g.fillStyle(0x00ff99);
      g.fillRect(14, 17, 20, 4);
      g.fillRect(14, 24, 12, 4);
      g.fillStyle(0x475569);
      g.fillRect(5, 34, 38, 7);
      g.fillStyle(0x94a3b8);
      g.fillRect(18, 36, 12, 2);
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

  updateGuard(delta: number) {
    if (this.doorUnlocked || this.missionComplete || this.missionFailed) {
      this.guard.setAlpha(0.35);
      this.guardDetectionCircle.setAlpha(0);
      return;
    }

    this.guard.x += this.guardDirection * this.guardSpeed * (delta / 1000);

    if (this.guard.x >= this.guardMaxX) {
      this.guard.x = this.guardMaxX;
      this.guardDirection = -1;
      this.guard.setFlipX(true);
    }

    if (this.guard.x <= this.guardMinX) {
      this.guard.x = this.guardMinX;
      this.guardDirection = 1;
      this.guard.setFlipX(false);
    }

    this.guardDetectionCircle.x = this.guard.x;
    this.guardDetectionCircle.y = this.guard.y;

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.guard.x,
      this.guard.y
    );

    if (distance < 95 && !this.terminalOpen) {
      this.increaseThreat(0.22);
      this.statusText.setText('Status: Patrol noticed you. Move away.');
    }
  }

  increaseThreat(amount: number) {
    if (this.missionComplete || this.missionFailed) return;

    this.threatLevel = Math.min(100, this.threatLevel + amount);
    this.threatText.setText(`THREAT: ${Math.floor(this.threatLevel)}%`);

    if (this.threatLevel >= 100) {
      this.failMission('MISSION COMPROMISED: Detection threshold exceeded');
    }
  }

  playTone(frequency: number, duration: number) {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  playSuccessSound() {
    this.playTone(600, 0.08);

    this.time.delayedCall(100, () => {
      this.playTone(800, 0.08);
    });

    this.time.delayedCall(200, () => {
      this.playTone(1000, 0.12);
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
      this.failMission('MISSION FAILED: Unauthorized exfiltration completed');
    }
  }

  failMission(reason = 'MISSION FAILED') {
    this.missionFailed = true;

    this.playTone(140, 0.4);

    this.player.setVelocity(0);

    this.statusText.setText(reason);
    this.timerText.setText('DATA LEAK: FAILED');

    this.add.text(330, 420, 'MISSION FAILED', {
      fontSize: '54px',
      color: '#ff3333',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    }).setDepth(200);

    this.add.text(250, 500, reason, {
      fontSize: '26px',
      color: '#ffffff',
      backgroundColor: '#111827',
      padding: {
        x: 20,
        y: 12,
      },
    }).setDepth(200);
  }

  checkDoorUnlock() {
    if (this.badgeComplete && this.employeeComplete && !this.doorUnlocked) {
      this.doorUnlocked = true;

      this.playSuccessSound();

      this.securityDoor.setTint(0x22c55e);
      this.securityDoor.alpha = 1;

      this.walls.remove(this.securityDoor as any);

      const body = this.securityDoor.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = false;

      this.statusText.setText('Status: Door unlocked. Patrol stood down. Investigate Operations Room.');

      this.tweens.add({
        targets: this.securityDoor,
        scaleY: 0.05,
        alpha: 0.2,
        duration: 650,
        ease: 'Power2',
      });

      this.cameras.main.shake(180, 0.003);
    }
  }

  setupInteraction(
    object: any,
    getText: () => string,
    action: () => void
  ) {
    this.physics.add.overlap(this.player, object, () => {
      if (this.missionComplete || this.missionFailed || this.terminalOpen) return;

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
${done(this.serverClueComplete)} Inspect server logs
${done(this.laptopComplete)} Review laptop evidence
${done(this.patchComplete)} Inspect patch panel
${done(this.terminalComplete)} Analyze SOC terminal
${done(this.cameraComplete)} Review cameras
${done(this.rogueTerminalComplete)} Contain Rogue Node`
    );
  }

  update(_time: number, delta: number) {
    if (this.missionComplete || this.missionFailed || this.terminalOpen) {
      this.player.setVelocity(0);
      return;
    }

    const speed = 260;

    this.player.setVelocity(0);

    if (this.keys.w.isDown) this.player.setVelocityY(-speed);
    if (this.keys.s.isDown) this.player.setVelocityY(speed);
    if (this.keys.a.isDown) this.player.setVelocityX(-speed);
    if (this.keys.d.isDown) this.player.setVelocityX(speed);

    this.playerLight.x = this.player.x;
    this.playerLight.y = this.player.y;

    this.updateGuard(delta);

    this.interactText.setText('');
  }
}