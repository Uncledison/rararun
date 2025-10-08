// game.js: Rararun - Sprite 및 물리 엔진 안정화 버전

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // 3차선 위치 정의 (X 좌표)
        this.lanePositions = [
            0,   
            240, 
            360, 
            480  
        ];
        this.currentLane = 2; // 중앙 레인(2번)에서 시작
        this.player = null;   // 이제 Graphics 대신 Sprite 객체를 사용할 것입니다.
        this.statusText = null;     
    }
    
    // 1. 에셋 로드 (필수: assets/player.png 파일을 사용합니다)
    preload() {
        // 'player'라는 키로 player.png 파일을 로드합니다.
        this.load.image('player', 'assets/player.png');
    }

    // 2. 게임 객체 초기화
    create() {
        this.cameras.main.setBackgroundColor('#000000');
        
        // 디버깅 텍스트 생성
        this.statusText = this.add.text(10, 10, 'Initializing...', { 
            fontSize: '24px', 
            fill: '#00ff00' 
        });
        
        // *******************************************************
        // * 핵심: 물리 엔진 Sprite 생성 (가장 안정적인 방법)
        // *******************************************************
        const playerX = this.lanePositions[this.currentLane];
        const playerY = 1000; 

        this.player = this.physics.add.sprite(
            playerX, 
            playerY, 
            'player' // 로드한 'player' 이미지를 사용
        );
        this.player.setScale(2.0); // 이미지 크기를 두 배로 키워 잘 보이게 합니다.
        this.player.setImmovable(true); // 움직이지 않도록 설정 (러너 게임의 고정 캐릭터)

        // 캔버스 터치 이벤트를 등록합니다.
        this.input.on('pointerdown', this.handleInput, this);
    }
    
    update(time, delta) {
        // 디버깅 텍스트 업데이트
        this.statusText.setText(`Lane: ${this.currentLane} / X: ${this.player.x}`);
    }

    // 좌우 터치 입력 처리 (애니메이션 Tween 사용)
    handleInput(pointer) {
        const gameWidth = this.sys.game.config.width;
        let newLane = this.currentLane;

        if (pointer.x < gameWidth / 2) {
            newLane = Math.max(1, this.currentLane - 1); // 왼쪽 이동
        } else {
            newLane = Math.min(3, this.currentLane + 1); // 오른쪽 이동
        }
        
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            
            // 스프라이트를 새 레인 위치로 부드럽게 이동시킵니다. (애니메이션)
            this.tweens.add({
                targets: this.player,
                x: this.lanePositions[this.currentLane],
                duration: 150, // 0.15초 이동
                ease: 'Power1'
            });
        }
    }
}


// 게임 환경 설정 (config)
const config = {
    type: Phaser.AUTO,
    width: 720,  
    height: 1280, 
    // *******************************************************
    // * 핵심: 물리 엔진 설정 추가 (Sprite 사용을 위해 필수)
    // *******************************************************
    physics: {
        default: 'arcade', 
        arcade: {
            // debug: true // 디버깅 시 유용합니다.
        }
    },
    scene: [GameScene]
};

// 게임 시작
const game = new Phaser.Game(config);
