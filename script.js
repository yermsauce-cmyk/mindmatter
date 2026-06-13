(() => {
  const canvas = document.getElementById('creature-bg');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const stateKey = 'mm_creature_v1';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(stateKey) || 'null') } catch(e){return null} })();

  const creature = saved || {
    x: w * 0.28,
    y: h * 0.46,
    rx: 260,
    ry: 160,
    hue: 190,
    pulse: 0,
    level: 0,
    scaleX: 1.6
  };

  // expose a small API for external interactions (click-to-evolve)
  window.MM = window.MM || {};
  window.MM.creature = creature;
  window.MM.evolve = function(){
    creature.level = Math.min(4, (creature.level||0) + 1);
    creature.hue = (creature.hue + 40) % 360;
    creature.rx *= 0.96; creature.ry *= 0.96;
    localStorage.setItem(stateKey, JSON.stringify(creature));
  };

  let mouse = {x: w/2, y: h/2};
  let running = true;

  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY });
  window.addEventListener('touchmove', (e)=>{ if(e.touches && e.touches[0]){ mouse.x=e.touches[0].clientX; mouse.y=e.touches[0].clientY }} ,{passive:true});

  window.addEventListener('scroll', () => {
    const s = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    creature.level = Math.min(2, Math.floor(s * 3));
    creature.hue = 190 + creature.level * 40;
  });

  const toggleBtn = document.getElementById('toggle-anim');
  if(toggleBtn){ toggleBtn.addEventListener('click', ()=>{ running = !running; toggleBtn.textContent = running ? 'Pause' : 'Resume'; }) }

  function drawCreature(dt){
    // background fog
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, `rgba(10,10,12,${0.12 + creature.level*0.05})`);
    g.addColorStop(1, 'rgba(2,2,4,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // pulsing size
    creature.pulse += dt * 0.0025;
    const pulse = 1 + Math.sin(creature.pulse) * 0.06 * (1 + creature.level*0.6);

    // move slightly toward mouse (parallax)
    creature.x += (mouse.x - creature.x) * 0.03;
    creature.y += (mouse.y - creature.y) * 0.02;

    // neon body
    const rx = creature.rx * (creature.scaleX || 1) * pulse * (1 + creature.level*0.08);
    const ry = creature.ry * pulse * (1 + creature.level*0.06);
    const gx = ctx.createRadialGradient(creature.x, creature.y, Math.min(10,rx*0.05), creature.x, creature.y, Math.max(rx,ry));
    gx.addColorStop(0, `hsla(${creature.hue},100%,65%,0.95)`);
    gx.addColorStop(0.4, `hsla(${creature.hue+40},90%,45%,0.35)`);
    gx.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.translate(creature.x, creature.y);
    ctx.rotate(Math.sin(creature.pulse*0.6)*0.03);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI*2);
    ctx.fillStyle = gx;
    ctx.fill();

    // soft glow
    ctx.globalCompositeOperation = 'lighter';
    for(let i=1;i<=3;i++){
      ctx.beginPath(); ctx.ellipse(0,0,rx*(0.5+i*0.4),ry*(0.45+i*0.35),0,0,Math.PI*2);
      ctx.fillStyle = `hsla(${creature.hue+10*i},100%,55%,${0.06/(i)})`; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // eyes
    const eyeOffsetX = rx * 0.28;
    const eyeOffsetY = -ry * 0.08;
    const eyeRadius = Math.max(6, Math.min(24, rx*0.08));
    const lookX = (mouse.x - creature.x) * 0.12;
    const lookY = (mouse.y - creature.y) * 0.12;
    // left eye
    ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(-eyeOffsetX,eyeOffsetY,eyeRadius,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle='#111'; ctx.arc(-eyeOffsetX + lookX*0.4, eyeOffsetY + lookY*0.4, eyeRadius*0.45,0,Math.PI*2); ctx.fill();
    // right eye
    ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(eyeOffsetX,eyeOffsetY,eyeRadius,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle='#111'; ctx.arc(eyeOffsetX + lookX*0.4, eyeOffsetY + lookY*0.4, eyeRadius*0.45,0,Math.PI*2); ctx.fill();

    ctx.restore();

    // nose sparkle emitter (red trail toward mouse)
    const noseX = creature.x + (rx * 0.34);
    const noseY = creature.y - (ry * 0.06);
    // spawn a few red particles moving from nose toward mouse
    for(let i=0;i< (creature.level+1); i++){
      particles.push({x:noseX + (Math.random()-0.5)*8, y:noseY + (Math.random()-0.5)*8, life:40 + Math.random()*30, r:1+Math.random()*2, hue: 345 + Math.random()*20, vx:(mouse.x-noseX)*0.02*(Math.random()*0.6+0.2), vy:(mouse.y-noseY)*0.02*(Math.random()*0.6+0.2), type:'spark'});
    }
  }

  let last = performance.now();
  function frame(t){
    const dt = t - last; last = t;
    if(running){ drawCreature(dt); }
    // persist occasionally
    if(Math.random() < 0.02) localStorage.setItem(stateKey, JSON.stringify(creature));
    requestAnimationFrame(frame);
  }

  // clear once to ensure transparency then start
  ctx.clearRect(0,0,w,h);
  requestAnimationFrame(frame);

  // scaleX control binding (if present)
  const scaleInput = document.getElementById('scaleX');
  if(scaleInput){
    scaleInput.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); creature.scaleX = v; });
    // initialize from input value
    creature.scaleX = parseFloat(scaleInput.value || creature.scaleX);
  }

})();

// small particle trail for neon cursor sparkles
(function(){
  const canvas = document.getElementById('creature-bg');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function spawn(x,y,opts){
    const o = opts||{};
    particles.push({x,y,life:o.life||60,r:o.r||(2+Math.random()*4), hue: o.hue||(200+Math.random()*140), vx:o.vx||0, vy:o.vy||0, type:o.type||'dot'});
  }
  window.addEventListener('mousemove', (e)=>{ spawn(e.clientX,e.clientY); });
  function drawParticles(){
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life--;
      // motion
      p.x += (p.vx || (Math.random()-0.5)*2);
      p.y += (p.vy || (Math.random()-0.5)*1.6);
      p.r *= 0.995;
      if(p.life<=0 || p.r<0.2) particles.splice(i,1);
      else{
        ctx.beginPath();
        if(p.type === 'spark'){
          ctx.fillStyle = `hsla(${p.hue},100%,60%,${Math.min(1,p.life/60)})`;
          ctx.arc(p.x,p.y,p.r*1.2,0,Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle = `hsla(${p.hue},80%,60%,${Math.min(1,p.life/90)})`;
          ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  requestAnimationFrame(drawParticles);
})();

// custom cursor element + click-to-evolve
(function(){
  const dot = document.getElementById('cursor-dot');
  if(!dot) return;
  let dx=0, dy=0, cx=window.innerWidth/2, cy=window.innerHeight/2;
  window.addEventListener('mousemove', (e)=>{ cx = e.clientX; cy = e.clientY; });
  function render(){
    dx += (cx - dx) * 0.2; dy += (cy - dy) * 0.2;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('click', (e)=>{
    // spawn a burst
    for(let i=0;i<12;i++){
      const ev = new MouseEvent('mousemove',{clientX:e.clientX + (Math.random()-0.5)*30, clientY:e.clientY + (Math.random()-0.5)*30});
      window.dispatchEvent(ev);
    }
    // pulse cursor
    dot.classList.add('small'); setTimeout(()=>dot.classList.remove('small'),120);
    // evolve creature if API present
    if(window.MM && typeof window.MM.evolve === 'function') window.MM.evolve();
  });
})();
