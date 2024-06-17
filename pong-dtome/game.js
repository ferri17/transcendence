let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let leftPad;
let rightPad;
let ball;

function startGame() {
  ctx.fillStyle = "black";
  console.log(canvas.width);
  console.log(canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  leftPad = new Pad(10, 70, 0 + 30, canvas.height / 2);
  rightPad = new Pad(10, 70, canvas.width - 30, canvas.height / 2);
  window.requestAnimationFrame(render);
}

class Pad {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  draw = function () {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
}

class Ball {
  draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (keyState["KeyW"] || keyState["w"]) {
    if (leftPad.y - 10 < 0) {
      leftPad.y = 0;
    } else {
      leftPad.y -= 10;
    }
  }
  if (keyState["KeyS"] || keyState["s"]) {
    if (leftPad.y + 10 > canvas.height - leftPad.height) {
      leftPad.y = canvas.height - leftPad.height;
    } else {
      leftPad.y += 10;
    }
    console.log(leftPad.y);
  }
  if (keyState["ArrowUp"]) {
    if (rightPad.y - 10 < 0) {
      rightPad.y = 0;
    } else {
      rightPad.y -= 10;
    }
  }
  if (keyState["ArrowDown"]) {
    if (rightPad.y + 10 > canvas.height - rightPad.height) {
      rightPad.y = canvas.height - rightPad.height;
    } else {
      rightPad.y += 10;
    }
  }
  leftPad.draw();
  rightPad.draw();
  window.requestAnimationFrame(render);
}

startGame();

let keyState = {};
window.addEventListener(
  "keydown",
  function (e) {
    console.log(e.code);
    console.log(e.key);
    keyState[e.code || e.key] = true;
  },
  true
);
window.addEventListener(
  "keyup",
  function (e) {
    keyState[e.code || e.key] = false;
  },
  true
);
