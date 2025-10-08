// Rararun - dot.png 표시 디버그 강화 버전

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    // 720x1280 기준 3레인 (스프라이트 중심 기준 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1; // 중앙
    this.player = null;
    this.statusText = null;
    this.crosshair = null;   // 디버그 십자
    this.bgGrid = null;      // 배경 그리드
    this.usingFallback = false; // 폴백 텍스처 사용 여부
  }

  preload() {
    this.load.setPath('assets/');
    // 실제 파일명과 대소문자 정확히! 캐시 버스트 쿼리로 갱신 강제
    this.load.image('dot', 'dot.png?v=2');

    this.load.on('filecomplete-image-dot', () => {
      console.log('[LOAD OK] assets/dot.png');
    });
    this.load.on('loaderror', (file) => {
      console.error('[LOAD ERROR]', file?.src || file);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // 배경 그리드(보여짐 확인용)
    this.bgGrid = this.add.graphics();
    this.bgGrid.lineStyle(1, 0x222222, 1);
    for (let x = 0; x <= 720; x += 60) {
      this.bgGrid.lineBetween(x, 0, x, 1280);
    }
    for (let y = 0; y <= 1280; y += 60) {
      this.bgGrid.lineBetween(0, y, 720, y);
    }

    // 폴백 텍스처(빨간 사각형) 준비
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 48, 48);
    g.generateTexture('fallbackRect', 48, 48);
    g.destroy();

    // 플레이어 생성
    const playerX = this.lanePositions[this.currentLane];
    const playerY = 1000;

    const keyToUse = this.textures.exists('dot') ? 'dot' : 'fallbackRect';
    this.usingFallback = keyToUse === 'fallbackRect';

    this.player = this.physics.add.sprite(playerX, playerY, keyToUse);
    // dot이 아주 작아도 보이도록 표시 크기 고정
    this.player.setDisplaySize(96, 96);
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setVisible(true);
    this.player.setAlpha(1);

    // 디버그 십자(교차선) : 플레이어 위치 가시화
    this.crosshair = this.add.graphics();
    this.crosshair.lineStyle(2, 0x00ff00, 1);
    this.crosshair.beginPath();
    this.crosshair.moveTo(-60, 0);
    this.crosshair.lineTo(60, 0);
    this.crosshair.moveTo(0, -60);
    this.crosshair.lineTo(0, 60);
    this.crosshair.strokePath();
    this.crosshair.setDepth(9);
    // Graphics는 (0,0) 기준으로 그리므로 위치를 이동
    this.crosshair.x = this.player.x;
    this.crosshair.y = this.player.y;

    // 상태 텍스트
    const texDims = this.getTextureDims('dot'); // {w,h} 또는 null
    this.statusText = this.add.text(10, 10,
      `Lane: ${this.currentLane} / X: ${Math.round(this.player.x)} / tex: ${keyToUse}`
      + (texDims ? ` / dot(${texDims.w}x${texDims.h})` : ' / dot(N/A)'),
      { fontSize: '22px', fill: '#00ff00' }
    );

    // 입력
    this.input.on('pointerdown', this.handleInput, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 스페이스: dot <-> fallback 토글 (눈으로 비교)
    this.input.keyboard.on('keydown-SPACE', () => {
      this.usingFallback = !this.usingFallback;
      this.player.setTexture(this.usingFallback ? 'fallbackRect' : 'dot');
      // 토글 즉시 보이게 사이즈 유지
      this.player.setDisplaySize(96, 96);
    });
  }

  update() {
    // 키보드 좌우 이동(옵션)
    if (this.cursors?.left?.isDown)      this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    // 십자 위치를 플레이어에 맞춤
    if (this.crosshair && this.player) {
      this.crosshair.x = this.player.x;
      this.crosshair.y = this.player.y;
    }

    // 상태 텍스트 갱신
    const key = this.player.texture?.key || 'none';
    const dims = this.getTextureDims('dot');
    this.statusText.setText(
      `Lane: ${this.currentLane} / X: ${Math.round(this.player.x)} / tex: ${key}`
      + (dims ? ` / dot(${dims.w}x${dims.h})` : ' / dot(N/A)')
      + (this.usingFallback ? ' / [FALLBACK]' : '')
    );
  }

  handleInput(pointer) {
    const gameWidth = this.sys.game.config.width;
    const dir = pointer.x < gameWidth / 2 ? -1 : 1;
    this.moveLane(dir);
  }

  moveLane(delta) {
    const newLane = Phaser.Math.Clamp(
      this.currentLane + delta,
      0,
      this.lanePositions.length - 1
    );
    if (newLane === this.currentLane) return;

    this.currentLane = newLane;
    this.tweens.add({
      targets: this.player,
      x: this.lanePositions[this.currentLane],
      duration: 150,
      ease: 'Power1'
    });
  }

  getTextureDims(key) {
    if (!this.textures.exists(key)) return null;
    const source = this.textures.get(key).getSourceImage();
    if (!source) return null;
    return { w: source.width, h: source.height };
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
