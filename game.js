class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.lanePositions = [120, 360, 600]; // 3레인
    this.currentLane = 1;                 // 중앙
    this.player = null;
  }

  preload() {
    // 반드시 repo-root/assets/dot.png 존재해야 함
    this.load.image("dot", "assets/dot.png?v=3");
  }

  create() {
    this.cameras.main.setBackgroundColor("#111111");

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    // ⬇️ preload가 끝난 뒤 create에서 sprite 생성 → 즉시 보임
    this.player = this.add.sprite(x, y, "dot");
    this.player.setDisplaySize(96, 96);

    // 터치 입력
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
  scene: [GameScene],
});
