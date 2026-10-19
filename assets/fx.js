(()=>{const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(pointer:fine)').matches,de=document.documentElement;
/* page transition: six slats sweep across, target page name flashes */
const fx=document.createElement('div');fx.id='fx';fx.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i><b></b>';document.body.appendChild(fx);
const arrived=sessionStorage.getItem('fxnav');
if(arrived){$('b',fx).textContent=sessionStorage.getItem('fxlabel')||'';sessionStorage.removeItem('fxnav');de.classList.remove('fx-nav');setTimeout(()=>fx.classList.add('open'),RM?0:220)}else fx.classList.add('open');
document.addEventListener('click',e=>{const a=e.target.closest('a[data-transition]');if(!a||RM||e.metaKey||e.ctrlKey||a.target==='_blank')return;const h=a.getAttribute('href');if(!h||h[0]=='#')return;
e.preventDefault();e.stopPropagation();sessionStorage.setItem('fxnav','1');sessionStorage.setItem('fxlabel',a.textContent.trim());$('b',fx).textContent=a.textContent.trim();fx.classList.remove('open');setTimeout(()=>location.href=h,900)},true);
addEventListener('pageshow',e=>{if(e.persisted)fx.classList.add('open')});
/* scroll progress + nav hide on scroll-down */
const bar=document.createElement('div');bar.id='fx-bar';document.body.appendChild(bar);const nav=$('header.nav');let ly=0;
addEventListener('scroll',()=>{const y=scrollY,m=de.scrollHeight-innerHeight;bar.style.transform=`scaleX(${m>0?y/m:0})`;
if(nav){const open=$('nav.links.open');nav.classList.toggle('hid',y>140&&y>ly&&!open)}ly=y;
const art=$('.hero-bg-art');if(art&&!RM)art.style.transform=`translateY(${y*.18}px)`},{passive:true});
if(fine&&!RM){
/* 3D tilt + amber spotlight on cards */
$$('[class*="card"]:not(.form-card)').forEach(c=>{if(getComputedStyle(c).position==='static')c.style.position='relative';c.classList.add('fx-t');const s=document.createElement('div');s.className='fx-spot';c.prepend(s);
c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',px*100+'%');c.style.setProperty('--my',py*100+'%');c.style.transform=`perspective(800px) rotateY(${(px-.5)*8}deg) rotateX(${(.5-py)*8}deg) translateY(-3px)`});
c.addEventListener('mouseleave',()=>c.style.transform='')});
/* magnetic buttons */
$$('.btn').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('mouseleave',()=>b.style.transform='')});
/* hero parallax with the mouse */
const art=$('.hero-bg-art');if(art)addEventListener('mousemove',e=>{art.style.translate=`${(e.clientX/innerWidth-.5)*-26}px ${(e.clientY/innerHeight-.5)*-26}px`})}
/* count-up on stat numbers */
if(!RM)$$('.stat-num').forEach(n=>{const q=n.textContent.match(/^(\d+)(.*)$/);if(!q)return;const end=+q[1];new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();const t0=performance.now();(function u(t){const p=Math.min(1,(t-t0)/1200);n.textContent=Math.round(end*(1-Math.pow(1-p,3)))+q[2];if(p<1)requestAnimationFrame(u)})(t0)}}).observe(n)});
})();
