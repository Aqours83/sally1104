const page = document.querySelector("#birthdayPage");
const gift = document.querySelector("#gift");
const canvas = document.querySelector("#fireworks");
const context = canvas.getContext("2d");
const postcards = document.querySelector("#postcards");
const postcardScroll = document.querySelector("#postcardScroll");
const currentPage = document.querySelector("#currentPage");
const scrollHintText = document.querySelector("#scrollHintText");
const scrollArrow = document.querySelector(".scroll-arrow");

const colors = ["#ff5f9f", "#ff9fc3", "#ffd84d", "#ffb923", "#7bdff2", "#9b7bff", "#6fe3a1"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let particles = [];
let animationFrame = null;
let fireworkTimers = [];
let isOpen = false;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeBurst(x, y, amount = 64) {
  for (let index = 0; index < amount; index += 1) {
    const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.16;
    const speed = 2.4 + Math.random() * 5.2;

    particles.push({
      x,
      y,
      previousX: x,
      previousY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.03 + Math.random() * 0.04,
      drag: 0.983,
      life: 1,
      decay: 0.005 + Math.random() * 0.005,
      size: 1.8 + Math.random() * 3.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  if (!animationFrame) animateFireworks();
}

function animateFireworks() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
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

  const burstPattern = [
    [0.18, 0.25],
    [0.78, 0.22],
    [0.48, 0.16],
    [0.28, 0.46],
    [0.85, 0.43],
    [0.62, 0.34],
    [0.12, 0.38],
    [0.7, 0.19],
    [0.39, 0.3],
    [0.88, 0.29],
  ];

  fireworkTimers = burstPattern.map(([x, y], index) =>
    window.setTimeout(() => {
      const amount = index === 2 || index === 8 ? 78 : 58;
      makeBurst(window.innerWidth * x, window.innerHeight * y, amount);
    }, index * 300),
  );
}

function showPostcards() {
  page.classList.add("show-postcards");
  postcards.setAttribute("aria-hidden", "false");
  postcardScroll.scrollTop = 0;
  gift.disabled = true;
}

function openGift() {
  if (isOpen) return;

  isOpen = true;
  page.classList.add("is-opening");
  gift.setAttribute("aria-expanded", "true");

  window.setTimeout(() => {
    page.classList.remove("is-opening");
    page.classList.add("is-open");
  }, reduceMotion.matches ? 0 : 700);

  if (reduceMotion.matches) {
    window.setTimeout(showPostcards, 900);
    return;
  }

  fireworkTimers.push(
    window.setTimeout(() => {
      makeBurst(window.innerWidth / 2, window.innerHeight * 0.39, 86);
      scheduleFireworks();
    }, 300),
  );

  fireworkTimers.push(
    window.setTimeout(() => page.classList.add("is-fireworks-fading"), 3300),
    window.setTimeout(showPostcards, 4300),
  );
}

function updatePostcardProgress(cardNumber) {
  currentPage.textContent = String(cardNumber).padStart(2, "0");

  if (cardNumber === 4) {
    scrollHintText.textContent = "SCROLL UP TO REVISIT";
    scrollArrow.textContent = "↑";
  } else {
    scrollHintText.textContent = "SCROLL TO TURN THE PAGE";
    scrollArrow.textContent = "↓";
  }
}

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updatePostcardProgress(Number(entry.target.dataset.card));
      }
    });
  },
  {
    root: postcardScroll,
    threshold: 0.65,
  },
);

document.querySelectorAll(".postcard-page").forEach((card) => cardObserver.observe(card));
gift.addEventListener("click", openGift);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
