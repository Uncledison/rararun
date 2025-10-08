// 배포용: 모바일에서도 dot.png가 기본으로 보이게

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.lanePositions = [120, 360, 600]; // 720 폭 기준 3레인
    this.currentLane = 1;                 // 중앙
    this.player = null;
    this.playerOutline = null;
    this.halo = null;
    this.statusText = null;
  }

  preload() {
    // index.html 기준 상대 경로
    this.load.setPath("assets/");
    // dot.png를 기본으로 사용 (캐시 버스트는 배포 때 숫자만 바꾸세요)
    this.load.image("dot", "dot.png?v=1");
  }

  create() {
    this.cameras.main.setBackgroundColor("#111111"); // 어두운 회색(대비 확보)

    // 폴백 텍스처(빨간 사각형) 생성
    const g = this.add.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff0000, 1).fillRect(0, 0, 64, 64);
    g.generateTexture("fallbackRect", 64, 64);

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    // ✅ 항상 dot를 먼저 시도, 실패(로드 안됨)이면 그때만 폴백
    const key = this.textures.exists("dot") ? "dot" : "fallbackRect";

    // 흰색 헤일로(배경과 대비)
    this.halo = this.add.graphics().setDepth(8);
    this.halo.fillStyle(0xffffff, 0.85).fillCircle(0, 0, 58);
    this.halo.setPosition(x, y);

    // 흰색 아웃라인(같은 이미지 살짝 크게)
    this.playerOutline = this.add.image(x, y, key).setDepth(9);
    this.playerOutline.setDisplaySize(110, 110).setTint(0xffffff).setAlpha(0.95);

    // 본체
    this.player = this.physics.add.sprite(x, y, key).setDepth(10);
    this.player.setDisplaySize(96, 96);
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);

    // 상태 텍스트(원하면 지워도 됨)
    this.statusText = this.add.text(10, 10,
      `Lane:${this.currentLane} X:${Math.round(this.player.x)} tex:${key}`,
      { fontSize: "20px", fill: "#00ff00" });

    // 터치(좌/우 화면 절반)
    this.input.on("pointerdown", this.handleInput, this);

    // (옵션) 키보드도 지원
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors?.left?.isDown) this.moveLane(-1);
    else if (this.cursors?.right?.isDown) this.moveLane(1);

    // 보조 요소 위치 동기화
    if (this.player) {
      this.halo.x = this.player.x;
      this.halo.y = this.player.y;
      this.playerOutline.x = this.player.x;
      this.playerOutline.y = this.player.y;
      this.statusText.setText(
        `Lane:${this.currentLane} X:${Math.round(this.player.x)} tex:${this.player.texture?.key}`
      );
    }
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
      ease: "Power1",
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  physics: { default: "arcade", arcade: {} },
  pixelArt: true,
  scene: [GameScene],
});
