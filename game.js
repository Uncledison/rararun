// Rararun - dot.png 표시 디버그 & 가시성 보강

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.lanePositions = [120, 360, 600]; // 720폭 기준 3레인
    this.currentLane = 1;                 // 중앙
    this.player = null;
    this.statusText = null;
    this.crosshair = null;
    this.halo = null;                     // 가시성 보강용 흰색 원
    this.usingFallback = false;
  }

  preload() {
    this.load.setPath('assets/');

    // dot.png (캐시 버스트)
    this.load.image('dot', 'dot.png?v=3');

    this.load.on('filecomplete-image-dot', () => {
      console.log('[LOAD OK] assets/dot.png');
    });
    this.load.on('loaderror', (file) => {
      console.error('[LOAD ERROR]', file?.src || file);
    });
  }

  create() {
    // 완전 검정보다 약간 띄운 배경으로 대비 확보
    this.cameras.main.setBackgroundColor('#111111');

    // 배경 보조 그리드
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x222222, 1);
    for (let x = 0; x <= 720; x += 60) grid.lineBetween(x, 0, x, 1280);
    for (let y = 0; y <= 1280; y += 60) grid.lineBetween(0, y, 720, y);

    // 폴백(빨간 사각형) 준비
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 48, 48);
    g.generateTexture('fallbackRect', 48, 48);
    g.destroy();

    const playerX = this.lanePositions[this.currentLane];
    const playerY = 1000;

    const keyToUse = this.textures.exists('dot') ? 'dot' : 'fallbackRect';
    this.usingFallback = keyToUse === 'fallbackRect';

    // ▶▶ 가시성 보강용 흰색 헤일로(스프라이트 뒤)
    this.halo = this.add.graphics();
    this.halo.fillStyle(0xffffff, 0.8);
    this.halo.fillCircle(0, 0, 54); // 플레이어보다 약간 큼
    this.halo.setDepth(8);

    // 플레이어 스프라이트
    this.player = this.physics.add.sprite(playerX, playerY, keyToUse);
    this.player.setDisplaySize(96, 96);   // dot가 작아도 확실히 보이게
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setVisible(true);
    this.player.setAlpha(1);

    // 디버그 십자 (플레이어 위치 표시)
    this.crosshair = this.add.graphics();
    this.crosshair.lineStyle(2, 0x00ff00, 1);
    this.crosshair.beginPath();
    this.crosshair.moveTo(-60, 0); this.crosshair.lineTo(60, 0);
    this.crosshair.moveTo(0, -60); this.crosshair.lineTo(0, 60);
    this.crosshair.strokePath();
    this.crosshair.setDepth(11);

    // 텍스처 중앙 픽셀 투명도/색상 확인
    const centerInfo = this.getCenterPixelInfo('dot'); // {a,r,g,b} 또는 null

    this.statusText = this.add.text(
      10, 10,
      `Lane:${this.currentLane} X:${Math.round(this.player.x)} tex:${keyToUse}`
      + (centerInfo ? ` / dotCenter a:${centerInfo.a} rgb(${centerInfo.r},${centerInfo.g},${centerInfo.b})` : ' / dotCenter N/A')
      + (this.usingFallback ? ' / [FALLBACK]' : ''),
      { fontSize: '20px', fill: '#00ff00' }
    );

    // 입력
    this.input.on('pointerdown', this.handleInput, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    // SPACE: dot <-> fallback 토글
    this.input.keyboard.on('keydown-SPACE', () => {
      this.usingFallback = !this.usingFallback;
      this.player.setTexture(this.usingFallback ? 'fallbackRect' : 'dot');
      this.player.setDisplaySize(96, 96);
    });
  }

  update() {
    if (this.cursors?.left?.isDown) this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    // 헤일로/십자 위치를 플레이어에 맞춤
    if (this.player) {
      this.halo.x = this.player.x;
      this.halo.y = this.player.y;
      this.crosshair.x = this.player.x;
      this.crosshair.y = this.player.y;
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
      targets: this.player,
      x: this.lanePositions[this.currentLane],
      duration: 150,
      ease: 'Power1'
    });
  }

  // 중앙 픽셀 RGBA를 읽어 투명/검정 여부를 즉시 체크
  getCenterPixelInfo(key) {
    if (!this.textures.exists(key)) return null;
    const tex = this.textures.get(key);
    const src = tex.getSourceImage();
    if (!src || !src.width || !src.height) return null;
    const cx = (src.width / 2) | 0;
    const cy = (src.height / 2) | 0;

    // Phaser 내장 헬퍼
    const alpha = this.textures.getPixelAlpha(cx, cy, key);
    const color = Phaser.Display.Color.RGBToString(
      this.textures.getPixel(cx, cy, key)?.r ?? 0,
      this.textures.getPixel(cx, cy, key)?.g ?? 0,
      this.textures.getPixel(cx, cy, key)?.b ?? 0,
      255,
      ','
    ); // "rgb(r,g,b,255)" 형태

    const p = this.textures.getPixel(cx, cy, key);
    if (!p) return { a: alpha ?? 0, r: 0, g: 0, b: 0 };
    return { a: alpha ?? 0, r: p.r, g: p.g, b: p.b };
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
