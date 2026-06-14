// ============================================================
// YERM • THE CAVE — Interactive Creature Canvas
// Rat creature with parallax, particles, glow, click-to-evolve
// ============================================================

const canvas = document.getElementById('creature-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vex = {
  img: new Image(),
  x: canvas.width * 0.2,
  y: canvas.height * 0.35,
  size: 420,
  level: parseInt(localStorage.getItem('vexLevel')) || 0,
  angle: 0,
  glow: 0
};

vex.img.src = '/mindmatter/assets/vex-base.png';

let loot = 14;
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let scrollProgress = 0;

// Update loot display
document.getElementById('loot').textContent = loot;

// Animation Loop - Makes Vex feel alive
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Breathing + floating movement
  const breathe = Math.sin(Date.now() / 400) * 8;
  vex.y = canvas.height * 0.35 + breathe;

  // Look at mouse (simple head tilt)
  vex.angle = (mouse.x - canvas.width * 0.4) / 30;

  ctx.save();
  ctx.translate(vex.x + vex.size/2, vex.y + vex.size/2);
  ctx.rotate(vex.angle * Math.PI / 180);
  ctx.drawImage(vex.img, -vex.size/2, -vex.size/2, vex.size, vex.size);
  ctx.restore();

  // Glow effect based on level
  if (vex.level > 2) {
    ctx.shadowBlur = 60;
    ctx.shadowColor = '#ff00ff';
    ctx.drawImage(vex.img, vex.x - 30, vex.y - 30, vex.size + 60, vex.size + 60);
  }

  requestAnimationFrame(animate);
}

// Mouse Interaction
canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener('click', () => {
  vex.level = Math.min(vex.level + 1, 12);
  loot += Math.floor(Math.random() * 3) + 2;
  
  localStorage.setItem('vexLevel', vex.level);
  document.getElementById('loot').textContent = loot;

  // Visual feedback
  canvas.style.filter = 'brightness(2) saturate(2)';
  setTimeout(() => canvas.style.filter = '', 180);
});

// Scroll Interaction (Evolution)
window.addEventListener('scroll', () => {
  scrollProgress = Math.min(window.scrollY / 800, 1);
  if (scrollProgress > 0.3 && vex.level < 5) {
    vex.level = Math.min(vex.level + 1, 12);
    localStorage.setItem('vexLevel', vex.level);
  }
});

// Menu clicks also evolve Vex
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    vex.level = Math.min(vex.level + 1, 12);
    localStorage.setItem('vexLevel', vex.level);
    
    const section = item.dataset.section;
    alert(`Vex is guiding you to ${section.toUpperCase()}... 👁️`); 
    // Later: replace alert with actual sections
  });
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

vex.img.onload = () => {
  animate();
  console.log("🦇 Vex is alive and watching...");
};
