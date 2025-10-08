// Rararun - dot.png 표시 안정화 버전 (GitHub Pages 대응)

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    // 720x1280 기준 3레인 (스프라이트 중심 기준 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1;         // 중앙 레인
    this.player = null;
    this.statusText = null;
    this.debugRing = null;
  }

  preload() {
    // index.html 기준 상대 경로
    this.load.setPath('assets/');

    // ✅ 실제 파일명에 맞춤 (캐시 버스트로 새 파일 강제 로드)
    this.load.image('dot', 'dot.png?v=1');

    // 로드 로깅/에러 확인
    this.load.on('filecomplete-image-dot', () => {
      console.log('[LOAD OK] assets/dot.png');
    });
    this.load.on('loaderror', (file) => {
      console.error('[LOAD ERROR]', file?.src || file);
    });
    this.load.on('complete', () => {
      console.log('[LOAD COMPLETE] keys =', this.textures.getTextureKeys());
    });

    // ✅ 폴백용 텍스처(빨간 사각형) 미리 만들어 두기
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('fallbackRect', 32, 32);
    g.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // 디버그 텍스트
    this.statusText = this.add.text(10, 10, 'Initializing...', {
      fontSize: '24px', fill: '#00ff00'
    });

    const playerX = this.lanePositions[this.currentLane];
    const playerY = 1000;

    // ✅ dot 텍스처가 있으면 dot, 없으면 폴백 사용
    const keyToUse = this.textures.exists('dot') ? 'dot' : 'fallbackRect';
    this.player = this.physics.add.sprite(playerX, playerY, keyToUse);

    // dot.png가 아주 작아도 보이도록 표시 크기 고정(정비율)
    this.player.setDisplaySize(96, 96);  // 필요시 64~128 사이로 조절
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // ✅ 대상 위치 확인용 디버그 링 (플레이어를 따라다님)
    this.debugRing = this.add.graphics();
    this.debugRing.lineStyle(2, 0x00ff00, 1);
    this.debugRing.strokeCircle(0, 0, 54); // 플레이어(96px) 둘레보다 약간 크게
    this.debugRing.setDepth(9);

    // 입력
    this.input.on('pointerdown', this.handleInput, this);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // 키보드 좌우도 지원(옵션)
    if (this.cursors?.left?.isDown) this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    // 디버그 텍스트
    const texKey = this.player.texture?.key || 'none';
    this.statusText.setText(`Lane: ${this.currentLane} / X: ${Math.round(this.player.x)} / tex: ${texKey}`);

    // 디버그 링을 플레이어 위치로
    if (this.debugRing && this.player) {
      this.debugRing.x = this.player.x;
      this.debugRing.y = this.player.y;
    }
  }

  handleInput(pointer) {
    const gameWidth = this.sys.game.config.width;
    const dir = pointer.x < gameWidth / 2 ? -1 : 1; // 좌/우
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
