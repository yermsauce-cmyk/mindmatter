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
  x: canvas.width * 0.22,
  y: canvas.height * 0.42,
  size: 380,
  level: parseInt(localStorage.getItem('vexLevel')) || 0,
  breathe: 0
};

rat.img.src = '/mindmatter/assets/vex-base.png';

let loot = 14;
document.getElementById('loot-count').textContent = loot;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  rat.breathe = Math.sin(Date.now() / 300) * 12;

  ctx.drawImage(rat.img, 
    rat.x, 
    rat.y + rat.breathe, 
    rat.size, 
    rat.size);

  requestAnimationFrame(animate);
}

// Click on rat to evolve
canvas.addEventListener('click', (e) => {
  // Only evolve if click is near the rat
  if (e.clientX > rat.x - 100 && e.clientX < rat.x + rat.size + 100) {
    rat.level = Math.min(rat.level + 1, 12);
    loot += 3;
    localStorage.setItem('vexLevel', rat.level);
    document.getElementById('loot-count').textContent = loot;

    // Flash feedback
    canvas.style.filter = 'brightness(2.5)';
    setTimeout(() => canvas.style.filter = '', 200);
  }
});

// Menu clicks also evolve
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    rat.level = Math.min(rat.level + 1, 12);
    localStorage.setItem('vexLevel', rat.level);
    const action = item.dataset.action;
    alert(`Vex is guiding you to ${action.toUpperCase()}... 👁️`);
  });
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

rat.img.onload = animate;
