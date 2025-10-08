class MinimalScene extends Phaser.Scene {
  constructor(){ super({ key:'MinimalScene' }); }

  preload(){
    // index.html 기준 상대 경로
    this.load.setPath('assets/');
    this.load.image('dot', 'dot.png?v=9');

    this.load.on('filecomplete-image-dot', () => {
      console.log('[OK] dot.png loaded');
    });
    this.load.on('loaderror', (f) => {
      console.error('[ERR] loaderror', f?.src || f);
    });
  }

  create(){
    // 1) 체크보드 배경(투명/검정일 때 대비용)
    const tile = this.textures.createCanvas('checker', 40, 40);
    const ctx = tile.getContext();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0,0,40,40);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0,0,20,20); ctx.fillRect(20,20,20,20);
    tile.refresh();
    const bg = this.add.tileSprite(360,640,720,1280,'checker');
    bg.setDepth(0);

    // 2) 흰색 헤일로(아이콘이 어두워도 보이게)
    const halo = this.add.graphics();
    halo.fillStyle(0xffffff, 0.9);
    halo.fillCircle(0,0,90);
    halo.setPosition(360, 640);
    halo.setDepth(1);

    // 3) 중앙에 dot.png만 “이미지”로 배치 (물리/트윈 일절 없음)
    const img = this.add.image(360, 640, 'dot');
    img.setDepth(2);

    // 아이콘이 아주 크거나 작아도 보이도록 화면 높이 기준 스케일 자동 보정
    const src = this.textures.get('dot').getSourceImage();
    const sw = src?.width || 0, sh = src?.height || 0;
    // 목표 표시 높이 180px
    const targetH = 180;
    if (sw && sh){
      const scale = targetH / sh;
      img.setScale(scale);
      console.log(`[INFO] dot size = ${sw}x${sh}, scale=${scale.toFixed(2)}`);
    }

    // 4) 경계 박스(실제 그려지는 표시 크기)
    this.time.delayedCall(50, () => {
      const b = img.getBounds();
      const box = this.add.graphics();
      box.lineStyle(2, 0x00ff00, 1);
      box.strokeRect(b.x, b.y, b.width, b.height);
      box.setDepth(3);
      console.log('[INFO] display bounds', b);
    });

    // 5) 중앙 픽셀 알파/색상 점검(진짜 투명이면 바로 알 수 있음)
    const cx = Math.floor((sw||1)/2), cy = Math.floor((sh||1)/2);
    const p = this.textures.getPixel(cx, cy, 'dot');
    const a = this.textures.getPixelAlpha(cx, cy, 'dot');
    console.log(`[INFO] center pixel rgba = ${p?.r||0},${p?.g||0},${p?.b||0}, alpha=${a}`);

    // 6) 상태 텍스트
    this.add.text(12, 12,
      `dot: ${sw}x${sh}  centerα:${a}  (SPACE: 흰배경 토글)`,
      { fontSize:'20px', fill:'#00ff88' }).setDepth(4);

    // SPACE: 배경을 완전 흰색으로 바꿔 대비 확인
    let white = false;
    this.input.keyboard.on('keydown-SPACE', () => {
      white = !white;
      this.cameras.main.setBackgroundColor(white ? '#ffffff' : '#000000');
      bg.setVisible(!white);
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  scene: [MinimalScene]
});
