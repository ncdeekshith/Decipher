(()=>{
 const video=document.getElementById('launch-video'),toggle=document.getElementById('motion-toggle'),section=document.querySelector('.launch-scroll');if(!video||!toggle||!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),copy=document.querySelector('.launch-copy'),flight=document.querySelector('.flight-copy'),track=document.querySelector('.flight-track span');let paused=reduced.matches,visible=true,pending=false;
 video.muted=true;
 function label(){toggle.textContent=paused?'Play film':'Pause film';toggle.setAttribute('aria-pressed',String(paused));}
 function play(){if(paused||!visible||document.hidden)return;video.play().catch(()=>{paused=true;label();});}
 function update(){pending=false;const p=paused?0:Math.max(0,Math.min(1,-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)));copy.style.opacity=String(1-Math.min(1,p*2.7));copy.style.transform=`translateY(${-p*65}px)`;copy.inert=p>.36;copy.style.pointerEvents=p>.36?'none':'';flight.style.opacity=String(Math.min(1,Math.max(0,(p-.35)*3)));track.style.width=`${p*100}%`;}
 function setPaused(value){paused=value;label();document.body.classList.toggle('film-static',paused);if(paused)video.pause();else play();update();}
 toggle.addEventListener('click',()=>setPaused(!paused));reduced.addEventListener('change',e=>setPaused(e.matches));video.addEventListener('error',()=>{paused=true;label();toggle.textContent='Film unavailable';toggle.disabled=true;document.body.classList.add('film-static');update();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else play();});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)play();else video.pause();}).observe(section);
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});window.addEventListener('resize',update);setPaused(paused);
})();
