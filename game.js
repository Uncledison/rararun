class VisualDebugScene extends Phaser.Scene {
  constructor(){ super({ key:'VisualDebug' }); }

  preload(){
    this.load.setPath('assets/');
    // 캐시 갱신 쉽게 하려면 ?v=숫자 바꾸세요
    this.load.image('dot', 'dot.png?v=10');

    // 로드 실패 대비용 폴백 텍스처는 미리 만들어 둠
    this.make.graphics({ x:0, y:0, add:false })
      .fillStyle(0xff0000, 1).fillRect(0,0,64,64)
      .generateTexture('fallbackRect', 64,64);
  }

  create(){
    const W=720, H=1280;
    // 체커보드 배경(투명/검정 대비)
    const tile = this.textures.createCanvas('checker', 40, 40);
    const ctx = tile.getContext();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0,0,40,40);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0,0,20,20); ctx.fillRect(20,20,20,20);
    tile.refresh();
    this.bg = this.add.tileSprite(W/2,H/2,W,H,'checker').setDepth(0);

    // 배경 컬러 순환용
    this.bgColors = ['#000000', '#111111', '#0b1020', '#ffffff'];
    this.bgIndex = 1;
    this.cameras.main.setBackgroundColor(this.bgColors[this.bgIndex]);

    // 중앙 위치
    const cx = W/2, cy = H*0.5;

    // 헤일로(밝은 원) → 아이콘이 어두워도 보이게
    this.halo = this.add.graphics().setDepth(1);
    this.halo.fillStyle(0xffffff, 0.9).fillCircle(0,0,100);
    this.halo.setPosition(cx, cy);

    // dot가 있으면 dot, 없으면 폴백
    const key = this.textures.exists('dot') ? 'dot' : 'fallbackRect';

    // 이미지 본체 (물리X, 그냥 표시만)
    this.icon = this.add.image(cx, cy, key).setDepth(2);

    // 원본 크기 확인
    const src = this.textures.get(key).getSourceImage();
    const sw = src?.width || 0, sh = src?.height || 0;

    // 화면 높이 기준 200px로 보정
    const targetH = 200;
    if (sw && sh) this.icon.setScale(targetH / sh);

    // 경계선(실제 표시 크기)
    this.bounds = this.add.graphics().setDepth(3);
    this.time.delayedCall(50, () => this.drawBounds(), null, this);

    // 십자선(정중앙 가이드)
    this.cross = this.add.graphics().setDepth(3);
    this.cross.lineStyle(3, 0x00ff00, 1);
    this.cross.lineBetween(cx-80, cy, cx+80, cy);
    this.cross.lineBetween(cx, cy-80, cx, cy+80);

    // 화면 상단 상태 텍스트(진단 정보)
    this.label = this.add.text(12, 40, '', { fontFamily:'monospace', fontSize: 22, color:'#00ff88' })
      .setDepth(5).setScrollFactor(0);

    // 힌트 상자
    this.hint = document.getElementById('hint');
    this.hint.innerText =
      '터치 안내:\n' +
      '• 화면 한 번 탭: 배경 색 순환\n' +
      '• 두 손가락 탭: 폴백(빨간 사각형) ↔ dot 토글\n' +
      '• 길게 누르기(1초): 헤일로 on/off';
    this.hint.style.display = 'block';

    // 제스처
    this.input.on('pointerdown', (p) => {
      if (p.pointers && p.pointers.length >= 2) {
        // 두 손가락 탭 → 폴백 토글
        const usingFallback = this.icon.texture.key === 'fallbackRect';
        const next = usingFallback ? (this.textures.exists('dot') ? 'dot' : 'fallbackRect') : 'fallbackRect';
        this.icon.setTexture(next);
        if (next === 'fallbackRect') this.icon.setDisplaySize(200,
