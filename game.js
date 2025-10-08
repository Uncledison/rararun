class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    // 3레인 (720 기준 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1; // 중앙 레인
    this.player = null;
  }

  preload() {
    // 반드시 repo-root/assets/dot.png 위치
    this.load.image("dot", "assets/dot.png?v=1");
  }

  create() {
    this.cameras.main.setBackgroundColor("#111111"); // 어두운 회색 배경

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    // dot.png만 표시 (폴백 없음)
    this.player = this.physics.add.sprite(x, y, "dot");
    this.player.setDisplaySize(96, 96);  // 크기 강제
    this.player.setImmovable(true);

    // 터치 입력 (좌/우 화면 절반으로 이동)
    this.input.on("pointerdown", this.handleInput, this);
  }

  handleInput(pointer) {
    const gameWidth = this.sys.game.config.width;
    if (pointer.x < gameWidth / 2) {
      this.moveLane(-1);
    } else {
      this.moveLane(1);
    }
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
