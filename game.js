// game.js: Rararun 디버깅용 최소 동작 코드

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // 3차선 위치 정의 (X 좌표)
        this.lanePositions = [
            0,   // 인덱스 0은 사용하지 않음
            240, // 왼쪽 레인
            360, // 중앙 레인 (화면 폭 720의 절반)
            480  // 오른쪽 레인
        ];
        this.currentLane = 2; // 중앙 레인(2번)에서 시작
        this.player = null; 
    }
    
    preload() {
        // 이미지를 로드하지 않음 (사각형 테스트)
    }

    create() {
        const playerX = this.lanePositions[this.currentLane];
        const playerY = 1000; 

        // 1. 빨간색 사각형 (그래픽 객체)을 생성합니다.
        // Phaser.GameObjects.Graphics 객체는 물리 엔진 없이 단순 도형을 그립니다.
        this.playerGraphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        
        // 사각형 도형을 그리고, this.playerGraphics에 담습니다.
        // x, y, width, height: 중앙에 50x50 크기의 사각형을 그립니다.
        this.playerGraphics.fillRect(playerX - 25, playerY - 25, 50, 50); 
        
        // 2. 현재 위치를 확인하기 위한 임시 텍스트를 다시 추가합니다.
        this.statusText = this.add.text(10, 10, `Loaded: ${playerX}`, { fontSize: '24px', fill: '#00ff00' });
        
        // 3. 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
    }
    
    update(time, delta) {
        // 자동 전진 로직이 없으므로 현재는 비어 있습니다.
        // 캐릭터가 움직일 때마다 텍스트 업데이트 (디버깅용)
        this.statusText.setText(`Lane: ${this.currentLane} / X: ${this.playerGraphics.x + this.lanePositions[this.currentLane]}`);
    }
    
    handleInput(pointer) {
        const gameWidth = this.sys.game.config.width;
        let newLane = this.currentLane;

        // 화면 왼쪽 터치 = 왼쪽으로 이동 시도
        if (pointer.x < gameWidth / 2) {
            newLane = Math.max(1, this.currentLane - 1); // 1 레인 아래로 못 감
        } 
        // 화면 오른쪽 터치 = 오른쪽으로 이동 시도
        else {
            newLane = Math.min(3, this.currentLane + 1); // 3 레인 위로 못 감
        }
        
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            
            // Graphics 객체는 x/y 좌표를 직접 조작하는 대신 'transform'을 사용해야 합니다.
            // 하지만 단순 테스트를 위해, 여기서는 사각형을 다시 그려 이동하는 것처럼 보이게 합니다.
            // **Phaser.Tweens**를 사용하여 부드러운 애니메이션을 구현합니다.
            
            // 기존 사각형을 지웁니다.
            this.playerGraphics.clear(); 
            
            // 새 위치에 사각형을 다시 그립니다. (실제 게임에서는 Tween을 사용해 부드럽게 움직입니다)
            const targetX = this.lanePositions[this.currentLane];
            this.playerGraphics.fillRect(targetX - 25, 1000 - 25, 50, 50);
            this.playerGraphics.fillStyle(0xff0000, 1); // 다시 빨간색으로 설정
        }
    }
}


// 게임 환경 설정
const config = {
    type: Phaser.AUTO,
    width: 720,  // 모바일 세로 화면 폭
    height: 1280, // 모바일 세로 화면 높이
    scene: [GameScene],
    // 물리 엔진을 사용하지 않으므로 config에서 제거합니다.
};

// 게임 시작
const game = new Phaser.Game(config);
