const canvas = document.getElementById('creature-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let creatureLevel = parseInt(localStorage.getItem('vexLevel')) || 0;
let loot = 14;

// Load your creature image (use the one from the image you showed)
const vexImg = new Image();
vexImg.src = 'assets/vex-base.png';   // ← Put your image in assets/ folder

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Simple parallax + glow effect
  const mouseX = (mousePos.x / canvas.width) * 50 - 25;
  
  ctx.drawImage(vexImg, 
    canvas.width * 0.15 + mouseX, 
    canvas.height * 0.3, 
    450, 450);
  
  requestAnimationFrame(animate);
}

// Mouse tracking
let mousePos = { x: canvas.width / 2 };
canvas.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
});

canvas.addEventListener('click', () => {
  creatureLevel = Math.min(creatureLevel + 1, 10);
  loot += 3;
  localStorage.setItem('vexLevel', creatureLevel);
  document.getElementById('loot-count').textContent = loot;
  
  // Visual feedback
  canvas.style.filter = 'brightness(1.8) saturate(1.5)';
  setTimeout(() => canvas.style.filter = '', 300);
});

// Menu clicks
document.querySelectorAll('.neon-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const action = link.dataset.action;
    alert(`Vex reacts to you entering ${action.toUpperCase()} 👀`); 
    // Later: open sections, galleries, etc.
    creatureLevel = Math.min(creatureLevel + 1, 10);
    localStorage.setItem('vexLevel', creatureLevel);
  });
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

vexImg.onload = animate;
