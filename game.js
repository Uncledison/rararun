class ShowDotScene extends Phaser.Scene {
  constructor(){ super({ key:'ShowDot' }); }

  preload(){
    this.load.setPath('assets/');
    this.load.image('dot', 'dot.png?v=42');

    // 폴백(빨간 사각형)
    const g = this.add.graphics({ x:0, y:0, add:false });
    g.fillStyle(0xff0000, 1).fillRect(0,0,64,64);
    g.generateTexture('fallbackRect', 64, 64);
  }

  create(){
    const W = 720, H = 1280, CX = W/2, CY = 1000;

    // 배경 그리드 + 진회색 배경 (가시성 보강)
    const tile = this.textures.createCanvas('checker', 40, 40);
    const ctx = tile.getContext();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0,0,40,40);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0,0,20,20); ctx.fillRect(20,20,20,20);
    tile.refresh();
    const grid = this.add.tileSprite(W/2, H/2, W, H, 'checker').setDepth(0);
    this.cameras.main.setBackgroundColor('#111111');

    // 흰색 헤일로
    const halo = this.add.graphics().setDepth(8);
    halo.fillStyle(0xffffff, 0.9).fillCircle(0,0,60);
    halo.setPosition(CX, CY);

    // 1) dot 텍스처 있으면 투명여백 트림해서 새 텍스처 만든다
    const useKey = this.textures.exists('dot') ? this.makeTrimmedTexture('dot') : 'fallbackRect';

    // 2) 아웃라인: 같은 텍스처를 살짝 크게 흰색으로
    const outline = this.add.image(CX, CY, useKey).setDepth(9);
    outline.setTint(0xffffff).setAlpha(0.95);

    // 3) 본체
    const icon = this.add.image(CX, CY, useKey).setDepth(10);

    // 표시 크기(높이 기준 160px)
    const src = this.textures.get(useKey).getSourceImage();
    const sw = src.width, sh = src.height;
    const targetH = 160;
    const scale = targetH / sh;
    icon.setScale(scale);
    outline.setScale(scale * 1.12); // 아웃라인은 살짝 크게

    // 중앙 가이드
    const cross = this.add.graphics().setDepth(11);
    cross.lineStyle(2, 0x00ff00, 1);
    cross.lineBetween(CX-60, CY, CX+60, CY);
    cross.lineBetween(CX, CY-60, CX, CY+60);

    // 상태 텍스트
    const label = this.add.text(12, 12,
      `tex:${useKey} src:${sw}x${sh}  (배경 탭: 토글)`,
      { fontFamily:'monospace', fontSize:22, color:'#00ff88' }).setDepth(20);

    // 화면 탭으로 배경 색 순환
    const colors = ['#111111','#0b1020','#000000','#ffffff'];
    let idx = 0;
    this.input.on('pointerdown', () => {
      idx = (idx+1) % colors.length;
      this.cameras.main.setBackgroundColor(colors[idx]);
      grid.setVisible(colors[idx] !== '#ffffff');
    });
  }

  /**
   * 투명(알파=0) 픽셀을 제외하고 바운딩 박스를 계산한 뒤,
   * 잘라낸(canvas) 새 텍스처를 만들어 반환한다.
   * 투명 픽셀이 너무 많아도 중앙에 꽉 차게 보이도록 보정.
   * @param {string} key 원본 텍스처 키
   * @returns {string} 새 텍스처 키(예: 'dot_trim') 또는 원본 키
   */
  makeTrimmedTexture(key){
    const tex = this.textures.get(key);
    const img = tex.getSourceImage();
    if (!img || !img.width || !img.height) return key;

    const w = img.width, h = img.height;

    // 원본 픽셀을 읽어 알파>0인 최소/최대 영역을 찾는다
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y=0; y<h; y++){
      for (let x=0; x<w; x++){
        const i = (y*w + x) * 4;
        const a = data[i+3]; // 0~255
        if (a > 0){ // 완전 투명만 제외(반투명은 포함)
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 전부 투명하면 원본 그대로 사용(=보이지 않는 이미지)
    if (maxX < 0 || maxY < 0) return key;

    const tw = maxX - minX + 1;
    const th = maxY - minY + 1;

    // 여백이 너무 작게 잘리면 약간의 마진 추가(시각적 안전)
    const margin = Math.round(Math.min(w, h) * 0.02); // 2%
    const sx = Math.max(0, minX - margin);
    const sy = Math.max(0, minY - margin);
    const sw = Math.min(w - sx, tw + margin*2);
    const sh = Math.min(h - sy, th + margin*2);

    // 새 캔버스에 잘라 그린다
    const out = document.createElement('canvas');
    out.width = sw; out.height = sh;
    out.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    // Phaser 텍스처로 등록
    const newKey = key + '_trim';
    if (this.textures.exists(newKey)) this.textures.remove(newKey);
    this.textures.addImage(newKey, out);
    return newKey;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  scene: [ShowDotScene]
});
