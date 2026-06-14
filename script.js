// ============================================================
// YERM • THE CAVE — Interactive Creature Canvas
// Rat creature with parallax, particles, glow, click-to-evolve
// ============================================================

const canvas = document.getElementById('creature-canvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

// --- Load creature image ---
const creatureImg = new Image();
creatureImg.src = '/mindmatter/assets/vex-base.png';

// --- State (persisted) ---
const stateKey = 'mm_creature_v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(stateKey) || 'null'); } catch(e){ return null; } })();

const creature = saved || {
  x: w * 0.28,
  y: h * 0.46,
  rx: 260,
  ry: 160,
  hue: 320,       // magenta-pink base
  pulse: 0,
  level: 0,
  scaleX: 1.6
};

// --- Particles system ---
const particles = [];

function spawnParticle(x, y, opts) {
  const o = opts || {};
  particles.push({
    x, y,
    life: o.life || 60,
    r: o.r || (2 + Math.random() * 4),
    hue: o.hue || (320 + Math.random() * 40),
    vx: o.vx || (Math.random() - 0.5) * 2,
    vy: o.vy || (Math.random() - 0.5) * 1.6,
    type: o.type || 'dot'
  });
}

// --- Mouse tracking ---
let mouse = { x: w / 2, y: h / 2 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  // spawn trail particles
  if (Math.random() < 0.3) {
    spawnParticle(e.clientX, e.clientY, { life: 40, r: 1.5, hue: 320, type: 'dot' });
  }
});

// --- Click to evolve ---
window.addEventListener('click', (e) => {
  // burst particles at click
  for (let i = 0; i < 16; i++) {
    spawnParticle(e.clientX, e.clientY, {
      life: 50 + Math.random() * 30,
      r: 2 + Math.random() * 3,
      hue: 320 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      type: 'spark'
    });
  }
  // evolve creature
  creature.level = Math.min(10, (creature.level || 0) + 1);
  creature.hue = (creature.hue + 30) % 360;
  creature.rx *= 0.96;
  creature.ry *= 0.96;
  localStorage.setItem(stateKey, JSON.stringify(creature));
  // update loot
  const lootEl = document.getElementById('loot');
  if (lootEl) lootEl.textContent = 14 + creature.level * 3;
  // update progress bar
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) progressFill.style.width = Math.min(100, 45 + creature.level * 5) + '%';
  // flash
  canvas.style.filter = 'brightness(1.8) saturate(1.5)';
  setTimeout(() => canvas.style.filter = '', 300);
});

// --- Custom cursor ---
const dot = document.getElementById('cursor-dot');
let dx = 0, dy = 0, cx = w / 2, cy = h / 2;
window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });
function renderCursor() {
  dx += (cx - dx) * 0.2;
  dy += (cy - dy) * 0.2;
  if (dot) {
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(renderCursor);
}
renderCursor();

// Click pulse on cursor
window.addEventListener('click', () => {
  if (dot) {
    dot.classList.add('small');
    setTimeout(() => dot.classList.remove('small'), 120);
  }
});

// --- Main animation loop ---
let last = performance.now();

function frame(t) {
  const dt = t - last;
  last = t;

  ctx.clearRect(0, 0, w, h);

  // --- Draw creature ---
  creature.pulse += dt * 0.0025;
  const pulse = 1 + Math.sin(creature.pulse) * 0.06 * (1 + creature.level * 0.6);

  // Parallax — creature drifts toward mouse
  creature.x += (mouse.x - creature.x) * 0.02;
  creature.y += (mouse.y - creature.y) * 0.015;

  const rx = creature.rx * (creature.scaleX || 1) * pulse * (1 + creature.level * 0.08);
  const ry = creature.ry * pulse * (1 + creature.level * 0.06);

  if (creatureImg.complete && creatureImg.naturalWidth > 0) {
    // Draw the rat creature image with glow
    ctx.save();
    ctx.translate(creature.x, creature.y);
    ctx.rotate(Math.sin(creature.pulse * 0.6) * 0.03);

    // Glow layer behind image
    ctx.globalCompositeOperation = 'lighter';
    const glowSize = Math.max(rx, ry) * 1.4;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    glow.addColorStop(0, `hsla(${creature.hue}, 100%, 60%, 0.25)`);
    glow.addColorStop(0.5, `hsla(${creature.hue}, 100%, 50%, 0.08)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

    // Main image
    ctx.globalCompositeOperation = 'source-over';
    const iw = rx * 2;
    const ih = ry * 2;
    ctx.drawImage(creatureImg, -iw / 2, -ih / 2, iw, ih);

    ctx.restore();
  } else {
    // Fallback ellipse while image loads
    ctx.save();
    ctx.translate(creature.x, creature.y);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    grad.addColorStop(0, `hsla(${creature.hue},100%,65%,0.95)`);
    grad.addColorStop(0.4, `hsla(${creature.hue+40},90%,45%,0.35)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // --- Nose sparkle emitter (magenta particles toward mouse) ---
  const noseX = creature.x + (rx * 0.34);
  const noseY = creature.y - (ry * 0.06);
  for (let i = 0; i < (creature.level + 1); i++) {
    particles.push({
      x: noseX + (Math.random() - 0.5) * 8,
      y: noseY + (Math.random() - 0.5) * 8,
      life: 40 + Math.random() * 30,
      r: 1 + Math.random() * 2,
      hue: 320 + Math.random() * 30,
      vx: (mouse.x - noseX) * 0.02 * (Math.random() * 0.6 + 0.2),
      vy: (mouse.y - noseY) * 0.02 * (Math.random() * 0.6 + 0.2),
      type: 'spark'
    });
  }

  // --- Draw & update particles ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life--;
    p.x += (p.vx || (Math.random() - 0.5) * 2);
    p.y += (p.vy || (Math.random() - 0.5) * 1.6);
    p.r *= 0.995;
    if (p.life <= 0 || p.r < 0.2) {
      particles.splice(i, 1);
    } else {
      ctx.beginPath();
      if (p.type === 'spark') {
        ctx.fillStyle = `hsla(${p.hue},100%,60%,${Math.min(1, p.life / 60)})`;
        ctx.arc(p.x, p.y, p.r * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `hsla(${p.hue},80%,60%,${Math.min(1, p.life / 90)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Persist occasionally
  if (Math.random() < 0.02) localStorage.setItem(stateKey, JSON.stringify(creature));

  requestAnimationFrame(frame);
}

// --- Resize handler ---
window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// --- Start animation when image loads ---
creatureImg.onload = () => {
  requestAnimationFrame(frame);
};

// Fallback: start anyway after 2 seconds even if image hasn't loaded
setTimeout(() => {
  if (!creatureImg.complete) requestAnimationFrame(frame);
}, 2000);

// --- Menu interactions ---
document.querySelectorAll('.neon-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const action = link.dataset.action;
    // Evolve on menu click
    creature.level = Math.min(10, (creature.level || 0) + 1);
    localStorage.setItem(stateKey, JSON.stringify(creature));
    const lootEl = document.getElementById('loot');
    if (lootEl) lootEl.textContent = 14 + creature.level * 3;
    // Spawn particles at link position
    const rect = link.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      spawnParticle(
        rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
        rect.top + rect.height / 2,
        { life: 40, r: 2, hue: 320, type: 'spark' }
      );
    }
  });
});
