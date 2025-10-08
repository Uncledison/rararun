// Rararun: 모바일/웹 배포용 최종본 — dot.png 기본 표시

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    // 720x1280 기준 3레인 (스프라이트 중심 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1; // 중앙 레인에서 시작

    this.player = null;        // 본체
    this.playerOutline = null; // 흰색 아웃라인(가시성 보강)
    this.halo = null;          // 흰색 헤일로(가시성 보강)
  }

  preload() {
    // index.html 기준 상대 경로
    this.load.setPath("assets/");

    // 실제 아이콘: assets/dot.png (필요 시 v=숫자만 바꿔 캐시 무력화)
    this.load.image("dot", "dot.png?v=1");
  }

  create() {
    // 밝은 회색 배경(검은 배경보다 가시성 좋음)
    this.cameras.main.setBackgroundColor("#111111");

    // 폴백 텍스처(빨간 사각형) — dot 로드 실패 시에만 사용
    const g = this.add.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff0000, 1).fillRect(0, 0, 64, 64);
    g.generateTexture("fallbackRect", 64, 64);

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    // ✅ 항상 dot를 우선 사용, 없으면 그때만 폴백
    const texKey = this.textures.exists("dot") ? "dot" : "fallbackRect";

    // 가시성 보강: 흰색 헤일로(뒤)
    this.halo = this.add.graphics().setDepth(8);
    this.halo.fillStyle(0xffffff, 0.85).fillCircle(0, 0, 58);
    this.halo.setPosition(x, y);

    // 가시성 보강: 아웃라인(같은 텍스처를 살짝 크게 + 흰색 틴트)
    this.playerOutline = this.add.image(x, y, texKey).setDepth(9);
    this.playerOutline.setDisplaySize(110, 110).setTint(0xffffff).setAlpha(0.95);

    // 본체 스프라이트
    this.player = this.physics.add.sprite(x, y, texKey).setDepth(10);
    this.player.setDisplaySize(96, 96);       // 아이콘이 작아도 확실히 보이게
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);

    // 터치 입력(좌/우 화면 절반)
    this.input.on("pointerdown", this.handleInput, this);
  }

  update() {
    // 보조 레이어(헤일로/아웃라인) 위치를 본체에 동기화
    if (!this.player) return;
    this.halo.x = this.player.x;
    this.halo.y = this.player.y;
    this.playerOutline.x = this.player.x;
    this.playerOutline.y = this.player.y;
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
      targets: [this.player, this.playerOutline, this.halo],
      x: this.lanePositions[this.currentLane],
      duration: 150,
      ease: "Power1",
    });
  }
}

// 게임 설정 및 시작
new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  physics: { default: "arcade", arcade: {} },
  pixelArt: true,
  scene: [GameScene],
});
