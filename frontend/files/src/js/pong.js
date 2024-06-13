export default () => {
	
	const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 8;
const winningScore = 3;

let paddle1Y = canvas.height / 2 - paddleHeight / 2;
let paddle2Y = canvas.height / 2 - paddleHeight / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = 5;
let ballDY = 5;

let player1Score = 0;
let player2Score = 0;
let isGameOver = false;

let keysPressed = {};

function drawPaddle(x, y) {
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillText(player1Score, 100, 50);
    ctx.fillText(player2Score, canvas.width - 100, 50);
}

function drawGameOverScreen(winner) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2 - 50);
    ctx.fillText(`Player ${winner} wins!`, canvas.width / 2 - 120, canvas.height / 2);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawPaddle(0, paddle1Y);
    drawPaddle(canvas.width - paddleWidth, paddle2Y);

    // Draw ball
    drawBall(ballX, ballY);

    // Draw score
    drawScore();

    if (isGameOver) {
        drawGameOverScreen(player1Score > player2Score ? 1 : 2);
        return;
    }

    // Update ball position
    ballX += ballDX;
    ballY += ballDY;

    // Collision detection with top and bottom walls
    if (ballY + ballDY > canvas.height - ballRadius || ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    }

    // Collision detection with paddles
    if ((ballX - ballRadius < paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > paddle2Y && ballY < paddle2Y + paddleHeight)) {
        ballDX = -ballDX;
    }

    // Player scores
    if (ballX - ballRadius < 0) {
        player2Score++;
        reset();
    } else if (ballX + ballRadius > canvas.width) {
        player1Score++;
        reset();
    }

    // Check for game over
    if (player1Score === winningScore || player2Score === winningScore) {
        isGameOver = true;
    }

    requestAnimationFrame(draw);
}

function reset() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDX = -ballDX;
    ballDY = 5;
}

document.getElementById("startButton").addEventListener("click", function() {
    draw();
});

document.addEventListener("keydown", function(e) {
    keysPressed[e.key] = true;
});

document.addEventListener("keyup", function(e) {
    delete keysPressed[e.key];
});

function updatePaddlePosition() {
    if (keysPressed["ArrowUp"] && paddle2Y > 0) {
        paddle2Y -= 10;
    } else if (keysPressed["ArrowDown"] && paddle2Y < canvas.height - paddleHeight) {
        paddle2Y += 10;
    } else if (keysPressed["w"] && paddle1Y > 0) {
        paddle1Y -= 10;
    } else if (keysPressed["s"] && paddle1Y < canvas.height - paddleHeight) {
        paddle1Y += 10;
    }
}

// Start the game loop
function gameLoop() {
    updatePaddlePosition();
    requestAnimationFrame(gameLoop);
}

// Start the game loop when the game starts
document.getElementById("startButton").addEventListener("click", function() {
    draw();
    gameLoop();
});
}
