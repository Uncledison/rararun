// Rararun - Sprite 및 물리 엔진 안정화 버전 (GitHub Pages 대응)

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    // 720x1280 기준 3레인 (스프라이트 중심 기준 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1; // 중앙 레인에서 시작
    this.player = null;
    this.statusText = null;
  }

  preload() {
    // index.html이 있는 위치를 기준으로 assets 폴더를 고정
    this.load.setPath('assets/');

    // 실제 스프라이트 이미지 (대소문자 정확히!)
    this.load.image('player', 'player.png');

    // 디버깅: 에셋 로드 상태 로깅
    this.load.on('filecomplete-image-player', () => {
      console.log('[LOAD OK] assets/player.png');
    });
    this.load.on('loaderror', (file) => {
      console.error('[LOAD ERROR]', file?.src || file);
    });
    this.load.on('complete', () => {
      console.log('[LOAD COMPLETE] keys =', this.textures.getTextureKeys());
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // 좌상단 디버그 텍스트
    this.statusText = this.add.text(10, 10, 'Initializing...', {
      fontSize: '24px',
      fill: '#00ff00'
    });

    // 플레이어 생성
    const playerX = this.lanePositions[this.currentLane];
    const playerY = 1000;

    this.player = this.physics.add.sprite(playerX, playerY, 'player');
    this.player.setScale(2.0);               // 보기 좋게 확대
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);

    // 입력(터치/마우스)
    this.input.on('pointerdown', this.handleInput, this);

    // 선택: 키보드 좌우 화살표도 지원
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // 키보드 입력 처리(옵션)
    if (this.cursors?.left?.isDown) this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    // 디버깅 텍스트 업데이트
    this.statusText.setText(`Lane: ${this.currentLane} / X: ${Math.round(this.player.x)}`);
  }

  handleInput(pointer) {
    const gameWidth = this.sys.game.config.width;
    const dir = pointer.x < gameWidth / 2 ? -1 : 1; // 좌/우
    this.moveLane(dir);
  }

  moveLane(delta) {
    let newLane = Phaser.Math.Clamp(
      this.currentLane + delta,
      0,
      this.lanePositions.length - 1
    );
    if (newLane === this.currentLane) return;

    this.currentLane = newLane;

    // 부드러운 레인 이동
    this.tweens.add({
      targets: this.player,
      x: this.lanePositions[this.currentLane],
      duration: 150,
      ease: 'Power1'
    });
  }
}

// 게임 설정
const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true
    }
  },
  pixelArt: true,    // 레트로 스프라이트 가장자리 보존
  scene: [GameScene]
};

// 게임 시작
new Phaser.Game(config);
