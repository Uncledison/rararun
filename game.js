// game.js

// 1. GameScene 정의: 모든 게임 로직이 들어갈 곳
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    // 에셋 로드 (이미지 파일은 'assets' 폴더에 미리 올려야 합니다)
    preload() {
        // 예시: this.load.image('player', 'assets/player.png');
    }

    // 게임 객체 초기화
    create() {
        // 배경, 플레이어, 장애물 그룹 생성
        this.add.text(100, 100, 'Tomb of the Web Loading...', { fontSize: '24px', fill: '#fff' });
        
        // **********************************************
        // 핵심 1: 좌우 터치 입력 설정
        this.input.on('pointerdown', this.handleInput, this);
        // **********************************************
    }
    
    // 매 프레임마다 로직 실행
    update(time, delta) {
        // 핵심 2: 맵 자동 스크롤 (이전에 설명한 '앞으로 달리기' 로직)
        // this.moveMapForward(delta);
    }
    
    handleInput(pointer) {
        // 핵심 3: 좌우 이동 처리 로직
        console.log('터치 위치:', pointer.x);
        // 이 로직을 구현해서 캐릭터를 좌우로 이동시킵니다.
    }
}


// 2. 게임 환경 설정
const config = {
    type: Phaser.AUTO,
    width: 720,  // 모바일 세로 화면 폭
    height: 1280, // 모바일 세로 화면 높이
    physics: {
        default: 'arcade', // 간단한 충돌 처리를 위한 물리 엔진 사용
        arcade: {
            // debug: true // 개발 시 유용: 충돌 박스 표시
        }
    },
    scene: [GameScene]
};

// 3. 게임 시작
const game = new Phaser.Game(config);
