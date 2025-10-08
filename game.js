// game.js: Rararun - 완전한 디버깅 및 사각형 표시 코드

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // 3차선 위치 정의 (X 좌표)
        this.lanePositions = [
            0,   // 인덱스 0은 사용하지 않음
            240, // 왼쪽 레인 (L)
            360, // 중앙 레인 (C)
            480  // 오른쪽 레인 (R)
        ];
        this.currentLane = 2; // 중앙 레인(2번)에서 시작
        this.playerGraphics = null; // 사각형을 그릴 Graphics 객체
        this.statusText = null;     // 디버깅 텍스트 객체
    }
    
    // 1. 에셋 로드 (현재는 테스트를 위해 비워둠)
    preload() {
        // 이미지를 사용할 경우 여기에 추가: 
        // this.load.image('player', 'assets/player.png');
    }

    // 2. 게임 객체 초기화
    create() {
        // 배경을 완전히 검정색으로 설정하여 캔버스 크기 확인 (선택 사항)
        this.cameras.main.setBackgroundColor('#000000');
        
        // 디버깅 텍스트를 먼저 생성하여 화면에 표시되는지 확인합니다.
        this.statusText = this.add.text(10, 10, 'Initializing...', { 
            fontSize: '24px', 
            fill: '#00ff00' 
        });
        
        // Graphics 객체 생성 (화면에 사각형을 그리는 도구)
        this.playerGraphics = this.add.graphics();
        
        // 초기 사각형을 그리는 함수 호출
        this.drawPlayer(this.currentLane); 

        // 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
    }
    
    // 3. 매 프레임마다 실행되는 루프
    update(time, delta) {
        // 디버깅 텍스트를 현재 상태로 업데이트
        this.statusText.setText(`Lane: ${this.currentLane} / X: ${this.lanePositions[this.currentLane]}`);
    }

    // 4. 캐릭터를 그리는 보조 함수 (사각형 그리기 로직)
    drawPlayer(laneIndex) {
        const targetX = this.lanePositions[laneIndex];
        const playerY = 1000; // 화면 하단 위치
        
        // 이전 도형을 깨끗하게 지웁니다.
        this.playerGraphics.clear();
        
        // 사각형 그리기 시작 (빨간색)
        this.playerGraphics.fillStyle(0xff0000, 1); // 색상 (빨강)과 투명도 (1) 설정
        this.playerGraphics.fillRect(
            targetX - 25,  // X 시작 위치 (사각형 중앙을 targetX에 맞춤)
            playerY - 25,  // Y 시작 위치 (사각형 중앙을 playerY에 맞춤)
            50,            // 너비
            50             // 높이
        ); 
    }
    
    // 5. 좌우 터치 입력 처리
    handleInput(pointer) {
        const gameWidth = this.sys.game.config.width;
        let newLane = this.currentLane;

        if (pointer.x < gameWidth / 2) {
            // 화면 왼쪽 터치: 왼쪽으로 이동 시도
            newLane = Math.max(1, this.currentLane - 1); // 1 레인 아래로는 못 감
        } else {
            // 화면 오른쪽 터치: 오른쪽으로 이동 시도
            newLane = Math.min(3, this.currentLane + 1); // 3 레인 위로는 못 감
        }
        
        if (newLane !== this.currentLane) {
            // 레인이 바뀌면
            this.currentLane = newLane;
            
            // 1) 사각형을 새 위치에 다시 그립니다.
            this.drawPlayer(this.currentLane);
            
            // 2) 디버깅 텍스트는 update()에서 자동으로 갱신됩니다.
        }
    }
}


// 게임 환경 설정 (config)
const config = {
    type: Phaser.AUTO,
    width: 720,  // 모바일 세로 화면 폭
    height: 1280, // 모바일 세로 화면 높이
    // Graphics 객체는 물리 엔진이 필요 없으므로 'physics' 설정은 제거
    scene: [GameScene]
};

// 게임 시작
const game = new Phaser.Game(config);
