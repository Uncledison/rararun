// Rararun - 최종본: 모바일/PC 공통, dot.png만 표시 (폴백/토글 없음)

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    // 720x1280 기준 3레인 (스프라이트 중심 X 좌표)
    this.lanePositions = [120, 360, 600];
    this.currentLane = 1; // 중앙 레인
    this.player = null;        // 본체
    this.playerOutline = null; // 흰색 아웃라인
    this.halo = null;          // 흰색 헤일로
  }

  preload() {
    // index.html 기준 상대 경로
    this.load.setPath("assets/");
    // 실제 아이콘만 로드(캐시 무력화 필요시 ?v=숫자 변경)
    this.load.image("dot", "dot.png?v=1");
  }

  create() {
    // 짙은 회색 배경: 파란 거북이 + 투명 PNG 가시성 ↑
    this.cameras.main.setBackgroundColor("#111111");

    const x = this.lanePositions[this.currentLane];
    const y = 1000;

    // dot.png의 투명 여백을 자동 트림해 중앙 정렬 문제 방지
    const useKey = this.makeTrimmedTexture("dot") || "dot";

    // 가시성 보강: 흰색 헤일로(뒤)
    this.halo = this.add.graphics().setDepth(8);
    this.halo.fillStyle(0xffffff, 0.85).fillCircle(0, 0, 58);
    this.halo.setPosition(x, y);

    // 가시성 보강: 흰색 아웃라인(같은 텍스처를 살짝 크게)
    this.playerOutline = this.add.image(x, y, useKey).setDepth(9);
    this.playerOutline.setDisplaySize(110, 110).setTint(0xffffff).setAlpha(0.95);

    // 본체 (dot.png)
    this.player = this.physics.add.sprite(x, y, useKey).setDepth(10);
    this.player.setDisplaySize(96, 96);  // 아이콘 작아도 확실히 보이도록
    this.player.setImmovable(true);
    this.player.setCollideWorldBounds(true);

    // 터치 입력(좌/우 화면 절반)
    this.input.on("pointerdown", this.handleInput, this);
  }

  update() {
    // 보조 레이어 위치를 본체에 동기화
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

  /**
   * 투명(알파 0) 영역을 자동으로 잘라 새 텍스처를 생성.
   * 전부 투명이면 null 반환(그땐 원본 키를 그대로 사용).
   */
  makeTrimmedTexture(key) {
    if (!this.textures.exists(key)) return null;
    const tex = this.textures.get(key);
    const img = tex.getSourceImage();
    if (!img || !img.width || !img.height) return null;

    const w = img.width, h = img.height;
    const cvs = document.createElement("canvas");
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (data[i + 3] > 0) { // 알파>0만 유효 픽셀
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0 || maxY < 0) return null; // 전부 투명

    const tw = maxX - minX + 1;
    const th = maxY - minY + 1;

    // 약간의 마진(2%) 추가
    const m = Math.round(Math.min(w, h) * 0.02);
    const sx = Math.max(0, minX - m);
    const sy = Math.max(0, minY - m);
    const sw = Math.min(w - sx, tw + m * 2);
    const sh = Math.min(h - sy, th + m * 2);

    const out = document.createElement("canvas");
    out.width = sw; out.height = sh;
    out.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const newKey = key + "_trim";
    if (this.textures.exists(newKey)) this.textures.remove(newKey);
    this.textures.addImage(newKey, out);
    return newKey;
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
