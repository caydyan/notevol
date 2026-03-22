const starfield = document.querySelector('#starfield');
const ctx = starfield.getContext('2d');
const stars = [];
const panels = [...document.querySelectorAll('.panel')];
const carousel = document.querySelector('#carousel');
const dotsWrap = document.querySelector('#dots');
const pulseCore = document.querySelector('.pulse-core');
const tiltNodes = [...document.querySelectorAll('[data-tilt]')];

const resizeCanvas = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  starfield.width = window.innerWidth * ratio;
  starfield.height = window.innerHeight * ratio;
  starfield.style.width = `${window.innerWidth}px`;
  starfield.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const seedStars = () => {
  stars.length = 0;
  const count = Math.min(120, Math.floor(window.innerWidth * 0.22));
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1.2 + 0.3,
      size: Math.random() * 2 + 0.3,
      alpha: Math.random() * 0.6 + 0.15,
    });
  }
};

const drawStars = (time = 0) => {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach((star, i) => {
    const drift = Math.sin(time * 0.00035 + i) * 10 * star.z;
    const y = (star.y + time * 0.012 * star.z) % (window.innerHeight + 12);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = i % 3 === 0 ? 'rgba(120,247,255,0.9)' : 'rgba(255,120,199,0.45)';
    ctx.arc(star.x + drift, y - 6, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
};

const buildDots = () => {
  panels.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `查看第 ${index + 1} 张`);
    dot.addEventListener('click', () => {
      panels[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
};

const syncCarousel = () => {
  const offset = carousel.scrollLeft;
  const width = carousel.clientWidth * 0.82 + 12;
  const activeIndex = Math.round(offset / width);
  panels.forEach((panel, index) => panel.classList.toggle('active', index === activeIndex));
  [...dotsWrap.children].forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
};

const attachTilt = (node) => {
  const reset = () => {
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  node.addEventListener('pointermove', (event) => {
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-2px)`;
  });

  node.addEventListener('pointerleave', reset);
  node.addEventListener('pointerup', reset);
};

const burst = () => {
  pulseCore.animate(
    [
      { transform: 'scale(1)', filter: 'saturate(1)' },
      { transform: 'scale(1.08)', filter: 'saturate(1.45)' },
      { transform: 'scale(1)', filter: 'saturate(1)' },
    ],
    { duration: 880, easing: 'cubic-bezier(.22,1,.36,1)' },
  );
  document.documentElement.animate(
    [
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.18)' },
      { filter: 'brightness(1)' },
    ],
    { duration: 620, easing: 'ease-out' },
  );
};

buildDots();
syncCarousel();
resizeCanvas();
seedStars();
requestAnimationFrame(drawStars);

window.addEventListener('resize', () => {
  resizeCanvas();
  seedStars();
  syncCarousel();
});
carousel.addEventListener('scroll', syncCarousel, { passive: true });
tiltNodes.forEach(attachTilt);
pulseCore.addEventListener('click', burst);
document.querySelector('.action-pulse').addEventListener('click', burst);
document.querySelectorAll('.action-jump').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
