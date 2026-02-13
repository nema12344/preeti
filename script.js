const revealBtn = document.getElementById("revealBtn");
const musicBtn = document.getElementById("musicBtn");
const promiseBtn = document.getElementById("promiseBtn");
const closeModal = document.getElementById("closeModal");
const modal = document.getElementById("modal");
const story = document.getElementById("story");
const yesBtn = document.getElementById("yesBtn");
const music = document.getElementById("music");

const canvas = document.getElementById("hearts");
const ctx = canvas.getContext("2d");
const petalsCanvas = document.getElementById("petals");
const petalsCtx = petalsCanvas.getContext("2d");

let hearts = [];
let petals = [];
let lastSpawn = 0;
let lastPetalSpawn = 0;
let playing = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  petalsCanvas.width = window.innerWidth;
  petalsCanvas.height = window.innerHeight;
}

function createHeart(x, y, burst = false) {
  const size = burst ? random(10, 22) : random(6, 16);
  return {
    x,
    y,
    size,
    speed: burst ? random(1.8, 3.2) : random(0.4, 1.4),
    drift: random(-0.6, 0.6),
    alpha: random(0.4, 0.85),
    hue: Math.random() > 0.5 ? "#f4a7b9" : "#f5d08a",
  };
}

function drawHeart(h) {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.scale(h.size / 20, h.size / 20);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.bezierCurveTo(-12, -22, -30, -6, 0, 18);
  ctx.bezierCurveTo(30, -6, 12, -22, 0, -10);
  ctx.closePath();
  ctx.fillStyle = h.hue;
  ctx.globalAlpha = h.alpha;
  ctx.fill();
  ctx.restore();
}

function updateHearts(delta) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach((h) => {
    h.y -= h.speed;
    h.x += h.drift;
    h.alpha -= 0.001;
    drawHeart(h);
  });
  hearts = hearts.filter((h) => h.y > -40 && h.alpha > 0);

  if (delta - lastSpawn > 380) {
    lastSpawn = delta;
    hearts.push(createHeart(random(0, canvas.width), canvas.height + 20));
  }

  requestAnimationFrame(updateHearts);
}

function createPetal() {
  return {
    x: random(0, petalsCanvas.width),
    y: random(-200, -20),
    size: random(8, 18),
    speed: random(0.6, 1.6),
    drift: random(-0.4, 0.8),
    sway: random(0.004, 0.01),
    angle: random(0, Math.PI * 2),
    alpha: random(0.3, 0.7),
  };
}

function drawPetal(p) {
  petalsCtx.save();
  petalsCtx.translate(p.x, p.y);
  petalsCtx.rotate(p.angle);
  petalsCtx.scale(p.size / 16, p.size / 16);
  petalsCtx.beginPath();
  petalsCtx.moveTo(0, 0);
  petalsCtx.bezierCurveTo(8, -10, 18, -6, 12, 8);
  petalsCtx.bezierCurveTo(6, 18, -6, 16, -10, 6);
  petalsCtx.closePath();
  petalsCtx.fillStyle = "rgba(244, 167, 185, 0.8)";
  petalsCtx.globalAlpha = p.alpha;
  petalsCtx.fill();
  petalsCtx.restore();
}

function updatePetals(delta) {
  petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
  petals.forEach((p) => {
    p.y += p.speed;
    p.x += p.drift + Math.sin(p.y * p.sway) * 0.6;
    p.angle += 0.004;
    p.alpha -= 0.0005;
    drawPetal(p);
  });
  petals = petals.filter((p) => p.y < petalsCanvas.height + 40 && p.alpha > 0.1);

  if (delta - lastPetalSpawn > 520) {
    lastPetalSpawn = delta;
    petals.push(createPetal());
  }

  requestAnimationFrame(updatePetals);
}

function burstHearts() {
  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.6;
  for (let i = 0; i < 18; i += 1) {
    hearts.push(createHeart(centerX + random(-60, 60), centerY + random(-20, 40), true));
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function setModal(open) {
  modal.classList.toggle("open", open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
}

revealBtn.addEventListener("click", () => {
  story.scrollIntoView({ behavior: "smooth" });
});

promiseBtn.addEventListener("click", () => setModal(true));
closeModal.addEventListener("click", () => setModal(false));
modal.addEventListener("click", (event) => {
  if (event.target === modal) setModal(false);
});

musicBtn.addEventListener("click", async () => {
  if (!playing) {
    try {
      await music.play();
      playing = true;
      musicBtn.textContent = "Pause Our Moment";
      musicBtn.setAttribute("aria-pressed", "true");
    } catch (err) {
      musicBtn.textContent = "Tap Again to Play";
    }
  } else {
    music.pause();
    playing = false;
    musicBtn.textContent = "Play Our Moment";
    musicBtn.setAttribute("aria-pressed", "false");
  }
});

yesBtn.addEventListener("click", () => {
  yesBtn.textContent = "Forever Yes";
  burstHearts();
  setModal(true);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
requestAnimationFrame(updateHearts);
requestAnimationFrame(updatePetals);
