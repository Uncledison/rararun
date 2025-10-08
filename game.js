// game.js 수정 (임시 테스트 코드)

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.lanePositions = [
            0, // 인덱스 0은 사용하지 않음
            240, // 왼쪽 레인
            360, // 중앙 레인
            480  // 오른쪽 레인
        ];
        this.currentLane = 2;
        // player 객체를 클래스 변수로 초기화합니다.
        this.player = null; 
    }
    
    // 1. preload()에서 에셋 로드 부분을 주석 처리하거나 비워둡니다.
    preload() {
        // 이미지를 로드하지 않음
    }

    // 2. create() 함수를 수정하여 사각형을 그립니다.
    create() {
        const playerX = this.lanePositions[this.currentLane];
        const playerY = 1000; 

        // **********************************
        // 이미지 대신 빨간색 사각형 (그래픽 객체)을 생성합니다.
        // **********************************
        this.player = this.add.graphics({ fillStyle: { color: 0xff0000 } }); // 빨간색
        
        // 사각형 도형을 그리고, 변수 player에 할당합니다.
        // x, y, width, height: 중앙에 50x50 크기의 사각형을 그립니다.
        this.player.fillRect(playerX - 25, playerY - 25, 50, 50); 
        
        // 물리 엔진이 적용된 객체가 아니므로, 아래 물리 설정 관련 부분은 잠시 보류합니다.
        
        // 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
        
        // 현재 위치를 확인하기 위한 임시 텍스트를 다시 추가합니다.
        this.add.text(10, 10, `Loaded on Lane: ${playerX}`, { fontSize: '24px', fill: '#00ff00' });
    }
    
    // ... update()와 handleInput() 함수는 그대로 유지 ...
}

// (나머지 config는 그대로 유지)
const config = {
    // ...
    // physics: {} 부분은 잠시 주석 처리하거나 제거해도 좋습니다. (그래픽 객체에는 물리 엔진을 사용하지 않기 때문)
    // type, width, height, scene 등은 유지
    // ...
};
const game = new Phaser.Game(config);

