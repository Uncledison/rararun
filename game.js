class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.lanePositions = [120, 360, 600];
    this.currentLane = 1;

    this.player = null;
    this.playerOutline = null;
    this.halo = null;
    this.statusText = null;

    this.usingFallback = false;
    this.bgIndex = 0;
    this.bgColors = ['#0b1020', '#111111', '#e5e5e5'];
  }

  preload() {
    this.load.setPath('assets/');
    this.load.image('dot', 'dot.png?v=1'); // dot.png 확정

    this.load.on('filecomplete-image-dot', () => {
      console.log('[LOAD OK] assets/dot.png');
    });
    this.load.on('loaderror', (file) => {
      console.error('[LOAD ERROR]', file?.src || file);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor(this.bgColors[this.bgIndex]);

    // fallback 빨간 사각형
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 48, 48);
    g.generateTexture('fallbackRect', 48, 48);
    g.destroy();

    // 흰색 헤일로
    this.halo = this.add.graphics();
    this.halo.fillStyle(0xffffff, 0.9);
    this.halo.fillCircle(0, 0, 54);
    this.halo.setDepth(8);

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    const keyToUse = this.textures.exists('dot') ? 'dot' : 'fallbackRect';
    this.usingFallback = keyToUse === 'fallbackRect';

    // 흰색 아웃라인 (살짝 크게)
    this.playerOutline = this.add.image(x, y, keyToUse);
    this.playerOutline.setDisplaySize(110, 110);
    this.playerOutline.setTint(0xffffff);
    this.playerOutline.setAlpha(0.95);
    this.playerOutline.setDepth(9);

    // 본체 (dot.png or fallback)
    this.player = this.physics.add.sprite(x, y, keyToUse);
    this.player.setDisplaySize(96, 96);
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // 상태 텍스트
    const dims = this.getTextureDims('dot');
    this.statusText = this.add.text(
      10, 10,
      `Lane:${this.currentLane} X:${Math.round(this.player.x)} tex:${this.player.texture?.key}`
      + (dims ? ` / dot(${dims.w}x${dims.h})` : ' / dot(N/A)')
      + (this.usingFallback ? ' / [FALLBACK]' : ''),
      { fontSize: '20px', fill: '#00ff00' }
    );

    this.input.on('pointerdown', this.handleInput, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    // SPACE: dot <-> fallback 토글
    this.input.keyboard.on('keydown-SPACE', () => {
      this.usingFallback = !this.usingFallback;
      const tex = this.usingFallback ? 'fallbackRect' : 'dot';
      this.player.setTexture(tex).setDisplaySize(96, 96);
      this.playerOutline.setTexture(tex).setDisplaySize(110, 110).setTint(0xffffff);
    });

    // B: 배경색 순환
    this.input.keyboard.on('keydown-B', () => {
      this.bgIndex = (this.bgIndex + 1) % this.bgColors.length;
      this.cameras.main.setBackgroundColor(this.bgColors[this.bgIndex]);
    });
  }

  update() {
    if (this.cursors?.left?.isDown) this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    if (this.player) {
      this.halo.x = this.player.x;
      this.halo.y = this.player.y;
      this.playerOutline.x = this.player.x;
      this.playerOutline.y = this.player.y;
    }

    const key = this.player.texture?.key || 'none';
    this.statusText.setText(
      `Lane:${this.currentLane} X:${Math.round(this.player.x)} tex:${key}`
      + (this.usingFallback ? ' / [FALLBACK]' : '')
    );
  }

  handleInput(pointer) {
    const gameWidth = this.sys.game.config.width;
    this.moveLane(pointer.x < gameWidth / 2 ? -1 : 1);
  }

  moveLane(delta) {
    const newLane = Phaser.Math.Clamp(this.currentLane + delta, 0, this.lanePositions.length - 1);
    if (newLane === this.currentLane) return;

    this.currentLane = newLane;
    this.tweens.add({
      targets: [this.player, this.playerOutline, this.halo],
      x: this.lanePositions[this.currentLane],
      duration: 150,
      ease: 'Power1'
    });
  }

  getTextureDims(key) {
    if (!this.textures.exists(key)) return null;
    const src = this.textures.get(key).getSourceImage();
    if (!src) return null;
    return { w: src.width, h: src.height };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  physics: { default: 'arcade', arcade: {} },
  pixelArt: true,
  scene: [GameScene]
};

new Phaser.Game(config);
