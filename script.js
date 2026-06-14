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
  baseX: 0.22,
  baseY: 0.42,
  size: 420,
  level: parseInt(localStorage.getItem('vexLevel')) || 0,
  breathe: 0
};

rat.img.src = 'assets/vex.png';

let loot = 14;
document.getElementById('loot-count').textContent = loot;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  rat.breathe = Math.sin(Date.now() / 280) * 15;

  const x = canvas.width * rat.baseX;
  const y = canvas.height * rat.baseY + rat.breathe;

  ctx.drawImage(rat.img, x, y, rat.size, rat.size);

  requestAnimationFrame(animate);
}

// Click to interact with rat
canvas.addEventListener('click', (e) => {
  const ratX = canvas.width * rat.baseX;
  const ratY = canvas.height * rat.baseY;

  if (Math.abs(e.clientX - (ratX + rat.size/2)) < rat.size * 0.6 &&
      Math.abs(e.clientY - (ratY + rat.size/2)) < rat.size * 0.7) {
    
    rat.level = Math.min(rat.level + 1, 12);
    loot += 3;
    
    localStorage.setItem('vexLevel', rat.level);
    document.getElementById('loot-count').textContent = loot;

    canvas.style.transition = 'filter 0.1s';
    canvas.style.filter = 'brightness(3) saturate(2.5)';
    setTimeout(() => canvas.style.filter = '', 250);
  }
});

// Menu clicks also evolve
document.querySelectorAll('.menu-link').forEach(item => {
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

rat.img.onload = () => {
  animate();
  console.log("🦇 Vex is now interactive!");
};
