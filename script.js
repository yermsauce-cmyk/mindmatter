// ============================================================
// YERM • THE CAVE — Interactive Creature Canvas
// Rat creature with parallax, particles, glow, click-to-evolve
// ============================================================

const canvas = document.getElementById('rat-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rat = {
  img: new Image(),
  baseX: 0.20,
  baseY: 0.45,
  size: 480,
  level: parseInt(localStorage.getItem('vexLevel')) || 0,
  breathe: 0
};

rat.img.src = 'assets/vex.png';

let loot = 14;
document.getElementById('loot-count').textContent = loot;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rat.breathe = Math.sin(Date.now() / 300) * 16;
  
  const x = canvas.width * rat.baseX;
  const y = canvas.height * rat.baseY + rat.breathe;

  ctx.drawImage(rat.img, x, y, rat.size, rat.size);
  requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
  const ratCenterX = canvas.width * rat.baseX + rat.size / 2;
  const ratCenterY = canvas.height * rat.baseY + rat.size / 2;

  if (Math.hypot(e.clientX - ratCenterX, e.clientY - ratCenterY) < rat.size * 0.7) {
    loot += 3;
    document.getElementById('loot-count').textContent = loot;
    canvas.style.filter = 'brightness(3)';
    setTimeout(() => canvas.style.filter = '', 250);
  }
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

rat.img.onload = animate;
