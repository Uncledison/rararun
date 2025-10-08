// game.js

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // 캐릭터의 좌우 '레인(Lane)' 위치를 정의합니다. (예: 3차선)
        this.lanePositions = [
            Phaser.Display.Align.CENTER, // 이 부분은 템플릿 코드라서 추후 수정
            240, // 왼쪽 레인 X좌표
            360, // 중앙 레인 X좌표 (width 720의 절반)
            480  // 오른쪽 레인 X좌표
        ];
        this.currentLane = 2; // 중앙 레인(2번)에서 시작
    }
    
    // 1. 에셋 로드 (미리 준비한 assets/player.png를 로드합니다)
    preload() {
        // 이미지가 준비되면 주석을 해제하세요.
        this.load.image('player', 'assets/player.png');
    }

    // 2. 게임 객체 초기화
    create() {
        // 이전의 테스트 텍스트는 이제 필요 없으므로 제거합니다.
        
        // **********************************
        // 캐릭터(플레이어)를 화면 하단 중앙에 배치
        // **********************************
        this.player = this.physics.add.sprite(
            this.lanePositions[this.currentLane], // 중앙 레인 X 좌표
            1000, // 화면 하단 Y 좌표
            'player' // 로드한 이미지 키
        );
        // 캐릭터의 크기를 조정합니다.
        this.player.setScale(1.5); 
        
        // 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
    }
    
    // 3. 매 프레임마다 로직 실행
    update(time, delta) {
        // 여기에서 맵을 스크롤하는 로직(자동 전진)을 넣을 것입니다.
    }
    
    // 4. 좌우 터치 입력 처리
    handleInput(pointer) {
        const gameWidth = this.sys.game.config.width;
        let newLane = this.currentLane;

        if (pointer.x < gameWidth / 2) {
            // 화면 왼쪽을 터치 -> 왼쪽 레인으로 이동
            newLane = Math.max(1, this.currentLane - 1);
        } else {
            // 화면 오른쪽을 터치 -> 오른쪽 레인으로 이동
            newLane = Math.min(3, this.currentLane + 1);
        }
        
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            
            // 캐릭터의 X좌표를 부드럽게 새 레인 위치로 이동시킵니다.
            this.tweens.add({
                targets: this.player,
                x: this.lanePositions[this.currentLane],
                duration: 100, // 0.1초 동안 빠르게 움직입니다.
                ease: 'Power1'
            });
        }
    }
}

// (이 부분은 이전과 동일하게 유지)
const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    physics: {
        default: 'arcade', 
        arcade: {}
    },
    scene: [GameScene]
};
const game = new Phaser.Game(config);
