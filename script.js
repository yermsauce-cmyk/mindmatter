// ============================================================
// YERM • THE CAVE — Interactive Creature Canvas
// Rat creature with parallax, particles, glow, click-to-evolve
// ============================================================

const canvas = document.getElementById('rat-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const rat = {
  img: new Image(),
  baseX: 0.22,
  baseY: 0.45,
  size: 480
};

rat.img.src = 'assets/vex.png';

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const float = Math.sin(Date.now() / 380) * 16;
  const x = canvas.width * rat.baseX;
  const y = canvas.height * rat.baseY + float;
  ctx.drawImage(rat.img, x, y, rat.size, rat.size);
  requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
  const ratCenterX = canvas.width * rat.baseX + rat.size / 2;
  const ratCenterY = canvas.height * rat.baseY + rat.size / 2;
  if (Math.hypot(e.clientX - ratCenterX, e.clientY - ratCenterY) < rat.size * 0.65) {
    canvas.style.filter = 'brightness(3) saturate(2.5)';
    setTimeout(() => canvas.style.filter = '', 250);
  }
});

rat.img.onload = animate;
