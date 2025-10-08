// game.js: Rararun - 최종 안정화 및 디버깅 코드

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
        this.playerGraphics = null; 
        this.statusText = null;     
    }
    
    preload() {
        // 이미지를 사용할 경우 여기에 추가됩니다.
    }

    create() {
        // 배경을 검정색으로 설정
        this.cameras.main.setBackgroundColor('#000000');
        
        // 디버깅 텍스트 생성
        this.statusText = this.add.text(10, 10, 'Initializing...', { 
            fontSize: '24px', 
            fill: '#00ff00' 
        });
        
        // Graphics 객체 생성 (사각형 그리기 도구)
        this.playerGraphics = this.add.graphics();
        
        // 초기 사각형 그리기 함수 호출 (Lane 2)
        this.drawPlayer(this.currentLane); 

        // 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
    }
    
    update(time, delta) {
        // 디버깅 텍스트를 현재 상태로 업데이트합니다.
        this.statusText.setText(`Lane: ${this.currentLane} / X: ${this.lanePositions[this.currentLane]}`);
    }

    // 캐릭터를 그리는 보조 함수 (사각형 그리기 로직)
    drawPlayer(laneIndex) {
        const targetX = this.lanePositions[laneIndex];
        const playerY = 800;  // 화면 중앙 Y=800 위치에 배치 (더 잘 보이도록)
        
        const size = 200;     // <-- 사각형 크기를 200x200으로 확대 (표시 여부 확인용)
        const halfSize = size / 2;
        
        // 1. 이전 도형을 깨끗하게 지웁니다.
        this.playerGraphics.clear();
        
        // 2. 새 도형을 그립니다.
        this.playerGraphics.fillStyle(0xff0000, 1); // 빨간색 설정
        this.playerGraphics.fillRect(
            targetX - halfSize,  // X 시작 위치 (중앙 정렬)
            playerY - halfSize,  // Y 시작 위치 (중앙 정렬)
            size,                // 너비 200
            size                 // 높이 200
        ); 
    }
    
    // 좌우 터치 입력 처리
    handleInput(pointer) {
        const gameWidth = this.sys.game.config.width;
        let newLane = this.currentLane;

        // 왼쪽 터치
        if (pointer.x < gameWidth / 2) {
            newLane = Math.max(1, this.currentLane - 1); // 1 레인 이하로 못 감
        } 
        // 오른쪽 터치
        else {
            newLane = Math.min(3, this.currentLane + 1); // 3 레인 이상으로 못 감
        }
        
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            
            // 레인이 바뀌면 사각형을 새 위치에 다시 그립니다.
            this.drawPlayer(this.currentLane);
        }
    }
}


// 게임 환경 설정 (config)
const config = {
    type: Phaser.AUTO,
    width: 720,  // 모바일 세로 화면 폭
    height: 1280, // 모바일 세로 화면 높이
    scene: [GameScene]
};

// 게임 시작
const game = new Phaser.Game(config);
