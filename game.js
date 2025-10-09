const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = 800;
canvas.height = 400;

// 게임 변수
const LANES = 3;
const LANE_WIDTH = canvas.width / LANES;
const LANE_HEIGHT = canvas.height;

// 플레이어 설정
const player = {
    lane: 1, // 0, 1, 2 (왼쪽, 중앙, 오른쪽)
    x: 100,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    image: new Image(),
    targetLane: 1,
    speed: 8 // 레인 이동 속도
};

player.image.src = 'assets/dot.png';

// 게임 상태
let gameRunning = false;
let score = 0;
let gameSpeed = 5;

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' && player.targetLane > 0) {
        player.targetLane--;
    } else if (e.key === 'ArrowRight' && player.targetLane < LANES - 1) {
        player.targetLane++;
    }
});

// 플레이어 업데이트
function updatePlayer() {
    // 부드러운 레인 이동
    const targetY = (player.targetLane * LANE_HEIGHT / LANES) + (LANE_HEIGHT / LANES / 2);
    
    if (Math.abs(player.y - targetY) > 2) {
        if (player.y < targetY) {
            player.y += player.speed;
        } else {
            player.y -= player.speed;
        }
    } else {
        player.y = targetY;
        player.lane = player.targetLane;
    }
}

// 플레이어 그리기
function drawPlayer() {
    ctx.drawImage(
        player.image,
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height
    );
}

// 배경 그리기 (레인 구분선)
function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 레인 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    for (let i = 1; i < LANES; i++) {
        const y = (canvas.height / LANES) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    // 화면 클리어
    drawBackground();
    
    // 업데이트
    updatePlayer();
    
    // 그리기
    drawPlayer();
    
    // 다음 프레임
    requestAnimationFrame(gameLoop);
}

// 게임 시작
function startGame() {
    gameRunning = true;
    score = 0;
    player.lane = 1;
    player.targetLane = 1;
    player.y = canvas.height / 2;
    
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('score').textContent = '점수: 0';
    
    gameLoop();
}

// 재시작 버튼
document.getElementById('restartBtn').addEventListener('click', startGame);

// 이미지 로드 후 게임 시작
player.image.onload = () => {
    startGame();
};
