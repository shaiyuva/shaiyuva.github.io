/* ============================================================
   SHARED BEHAVIOR — nav, page-transition curtain, reveals, glow
   ============================================================ */

/* curtain: drop away on load, sweep in on internal nav */
(function(){
  const curtain = document.querySelector('.curtain');
  if(!curtain) return;
  const hold = parseInt(curtain.dataset.hold || '250', 10);
  setTimeout(()=>{ curtain.classList.add('leaving'); }, hold);
  setTimeout(()=>{ curtain.style.display='none'; }, hold + 700);

  document.querySelectorAll('a[data-transition]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download')) return;
      e.preventDefault();
      curtain.style.display='flex';
      curtain.classList.remove('leaving');
      curtain.style.transform='scaleY(1)';
      setTimeout(()=>{ window.location.href = href; }, 340);
    });
  });
})();

/* mobile nav toggle */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('nav.links');
  if(!btn || !links) return;
  btn.addEventListener('click', ()=> links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>links.classList.remove('open')));
})();

/* active nav link */
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* scroll reveal for .reveal / .reveal-scale / .tech-badge */
(function(){
  const els = document.querySelectorAll('.reveal, .reveal-scale, .tech-badge, .reveal-stagger > *');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.12});
  els.forEach(el=>io.observe(el));
})();

/* stagger children delay */
(function(){
  document.querySelectorAll('.reveal-stagger').forEach(group=>{
    Array.from(group.children).forEach((child,i)=>{
      child.classList.add('reveal');
      child.style.transitionDelay = (i*70) + 'ms';
    });
  });
})();

/* cursor glow (desktop only) */
(function(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  const glow = document.createElement('div');
  glow.className = 'glow-cursor';
  document.body.appendChild(glow);
  let raf = null, tx=0, ty=0, cx=0, cy=0;
  window.addEventListener('mousemove', e=>{
    tx = e.clientX; ty = e.clientY;
    glow.style.opacity = '1';
    if(!raf) raf = requestAnimationFrame(loop);
  });
  function loop(){
    cx += (tx-cx)*0.12; cy += (ty-cy)*0.12;
    glow.style.left = cx+'px'; glow.style.top = cy+'px';
    if(Math.abs(tx-cx)>0.5 || Math.abs(ty-cy)>0.5){ raf = requestAnimationFrame(loop); } else { raf = null; }
  }
})();

/* ============================================================
   CUSTOM CURSOR — magic sparkle: exact-position glowing star
   + a canvas trail of drifting, twinkling sparkle particles
   ============================================================ */
(function(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  document.documentElement.classList.add('has-cursor');

  const star = document.createElement('div');
  star.className = 'cur-star';
  star.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z"/></svg>';
  document.body.appendChild(star);

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-sparkle-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const colors = ['#F2B84B','#F7CD79','#9CA2FF','#7C83FD','#F5F3EA'];
  let particles = [], lastX = null, lastY = null;

  function spawn(x, y){
    const n = 1 + Math.floor(Math.random()*2);
    for(let i=0;i<n;i++){
      particles.push({
        x: x + (Math.random()-0.5)*8, y: y + (Math.random()-0.5)*8,
        vx: (Math.random()-0.5)*0.5, vy: -0.35 - Math.random()*0.55,
        life: 0, maxLife: 36 + Math.random()*26,
        size: 2 + Math.random()*3.2, rot: Math.random()*Math.PI*2, vr: (Math.random()-0.5)*0.18,
        color: colors[Math.floor(Math.random()*colors.length)]
      });
    }
  }

  window.addEventListener('mousemove', e=>{
    const x = e.clientX, y = e.clientY;
    star.style.transform = `translate(${x}px, ${y}px)`;
    if(lastX === null || Math.hypot(x-lastX, y-lastY) > 5){ spawn(x,y); lastX = x; lastY = y; }
  });

  function drawStar(x, y, r, rot){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath();
    for(let i=0;i<4;i++){
      const a = (i*Math.PI)/2;
      ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      ctx.lineTo(Math.cos(a+Math.PI/4)*r*0.3, Math.sin(a+Math.PI/4)*r*0.3);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.life++; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const t = p.life/p.maxLife;
      const alpha = t < 0.15 ? t/0.15 : Math.max(0, 1-((t-0.15)/0.85));
      const twinkle = 0.55 + 0.45*Math.sin(p.life*0.5);
      ctx.globalAlpha = alpha*twinkle;
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      drawStar(p.x, p.y, p.size*(1-t*0.3), p.rot);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    particles = particles.filter(p=>p.life < p.maxLife);
    requestAnimationFrame(loop);
  }
  loop();

  const hoverSel = 'a, button, .tech-badge, .skill-chip, input, textarea, .term-hint button, .radial, [data-transition]';
  document.addEventListener('mouseover', e=>{ if(e.target.closest(hoverSel)) star.classList.add('hover'); });
  document.addEventListener('mouseout', e=>{ if(e.target.closest(hoverSel)) star.classList.remove('hover'); });
  window.addEventListener('mouseleave', ()=>{ star.style.opacity='0'; });
  window.addEventListener('mouseenter', ()=>{ star.style.opacity='1'; });
})();

/* ============================================================
   TEXT REVEAL — splits headings into words (mask-slide) or
   characters (dissolve-in) and reveals them on scroll/load
   ============================================================ */
(function(){
  function splitWords(el){
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/(\s+)/).map(chunk=>{
      if(/^\s+$/.test(chunk)) return chunk;
      return `<span class="tr-word"><span>${chunk}</span></span>`;
    }).join('');
  }
  function splitChars(el){
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split('').map((ch,i)=>`<span class="tr-char" style="transition-delay:${i*18}ms">${ch===' '?'&nbsp;':ch}</span>`).join('');
  }
  document.querySelectorAll('[data-reveal="words"]').forEach(splitWords);
  document.querySelectorAll('[data-reveal="chars"]').forEach(splitChars);

  const targets = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('tr-ready'); io.unobserve(e.target); }
    });
  }, {threshold:0.2});
  targets.forEach(t=>io.observe(t));
})();

/* ============================================================
   CHART REVEAL — animates .chart-bars and .radial-row fills
   into view once, driven by scroll intersection
   ============================================================ */
(function(){
  const groups = document.querySelectorAll('.chart-bars, .radial-row');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.25});
  groups.forEach(g=>io.observe(g));
})();
