const page = document.querySelector("#birthdayPage");
const gift = document.querySelector("#gift");
const replay = document.querySelector("#replay");
const canvas = document.querySelector("#fireworks");
const context = canvas.getContext("2d");

const colors = ["#ff5f9f", "#ff9fc3", "#ffd84d", "#ffb923", "#7bdff2", "#9b7bff", "#6fe3a1"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let particles = [];
let animationFrame = null;
let burstTimers = [];
let isOpen = false;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeBurst(x, y, amount = 56) {
  for (let index = 0; index < amount; index += 1) {
    const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.18;
    const speed = 2.2 + Math.random() * 4.8;

    particles.push({
      x,
      y,
      previousX: x,
      previousY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.035 + Math.random() * 0.035,
      drag: 0.982,
      life: 1,
      decay: 0.006 + Math.random() * 0.007,
      size: 1.8 + Math.random() * 3.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  if (!animationFrame) animateFireworks();
}

function animateFireworks() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.globalCompositeOperation = "source-over";

  particles = particles.filter((particle) => particle.life > 0);

  particles.forEach((particle) => {
    particle.previousX = particle.x;
    particle.previousY = particle.y;
    particle.vx *= particle.drag;
    particle.vy = particle.vy * particle.drag + particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= particle.decay;

    context.globalAlpha = Math.max(particle.life, 0);
    context.strokeStyle = particle.color;
    context.lineWidth = particle.size * particle.life;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(particle.previousX, particle.previousY);
    context.lineTo(particle.x, particle.y);
    context.stroke();
  });

  context.globalAlpha = 1;

  if (particles.length > 0) {
    animationFrame = requestAnimationFrame(animateFireworks);
  } else {
    animationFrame = null;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function scheduleFireworks() {
  if (reduceMotion.matches) return;

  const positions = [
    [0.24, 0.28, 0],
    [0.75, 0.25, 180],
    [0.5, 0.2, 420],
    [0.14, 0.5, 690],
    [0.86, 0.48, 860],
    [0.35, 0.38, 1120],
    [0.67, 0.4, 1320],
  ];

  burstTimers = positions.map(([x, y, delay], index) =>
    window.setTimeout(() => {
      makeBurst(window.innerWidth * x, window.innerHeight * y, index === 2 ? 72 : 52);
    }, delay),
  );
}

function openGift() {
  if (isOpen) return;

  isOpen = true;
  page.classList.add("is-opening");
  gift.setAttribute("aria-expanded", "true");

  window.setTimeout(() => {
    page.classList.remove("is-opening");
    page.classList.add("is-open");
  }, 700);

  window.setTimeout(() => {
    makeBurst(window.innerWidth / 2, window.innerHeight * 0.42, 76);
    scheduleFireworks();
  }, reduceMotion.matches ? 0 : 280);
}

function resetGift() {
  burstTimers.forEach(window.clearTimeout);
  burstTimers = [];
  particles = [];
  isOpen = false;
  page.classList.remove("is-opening", "is-open");
  gift.setAttribute("aria-expanded", "false");
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  window.setTimeout(() => gift.focus(), 80);
}

gift.addEventListener("click", openGift);
replay.addEventListener("click", resetGift);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
