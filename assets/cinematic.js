import * as THREE from './three.module.js';

const section = document.querySelector('.cinematic-scroll');
const stage = document.querySelector('.cinematic-stage');
const host = document.querySelector('#cinematic-canvas');
const plates = [...document.querySelectorAll('.cinematic-plate')];
const copies = [...document.querySelectorAll('[data-copy]')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const motion = document.querySelector('#cinematic-motion');
const progressBar = document.querySelector('.cinematic-progress span');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = n => Math.max(0, Math.min(1, n));
const ease = (a,b,p) => { const t=clamp((p-a)/(b-a)); return t*t*(3-2*t); };
let paused = reduced.matches, selected = 0, progress = 0, target = 0;
let renderer, material, scene, camera, frame, visible = true, last = 0;
const positions = [0, .53, .91];

function state(p) {
 const reveal = ease(.16,.32,p), launch = ease(.64,.76,p);
 return {reveal, launch, zoom: 1+2.7*(1-ease(.23,.57,p)), ascent:ease(.75,1,p), chapter:p<.32?0:p<.73?1:2};
}
function measure() {
 target = paused ? positions[selected] : clamp(-section.getBoundingClientRect().top / Math.max(1,section.offsetHeight-stage.offsetHeight));
 if (renderer && (material.uniforms.viewport.value.x !== stage.clientWidth || material.uniforms.viewport.value.y !== stage.clientHeight)) {
  renderer.setSize(stage.clientWidth,stage.clientHeight,false);
  material.uniforms.viewport.value.set(stage.clientWidth,stage.clientHeight);
 }
 requestFrame();
}
function paint(p, time) {
 const s=state(p);
 plates[0].style.opacity=1-s.reveal;
 plates[1].style.opacity=s.reveal*(1-s.launch);
 plates[2].style.opacity=s.launch;
 plates[0].style.transform=`scale(${1+ease(0,.3,p)*.12})`;
 plates[1].style.transform=`scale(${s.zoom})`;
 plates[1].style.transformOrigin='65% 12%';
 plates[2].style.transform=`scale(${1+s.ascent*.045})`;
 copies.forEach((copy,i)=>{
  const active=i===s.chapter;
  copy.style.opacity=active?'1':'0';
  copy.style.pointerEvents=active?'auto':'none';
  copy.inert=!active;
  copy.setAttribute('aria-hidden',String(!active));
  copy.querySelectorAll('a').forEach(a=>a.tabIndex=active?0:-1);
 });
 chapters.forEach((button,i)=>i===s.chapter?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));
 progressBar.style.width=`${p*100}%`;
 if(renderer) {
  material.uniforms.progress.value=p;
  material.uniforms.time.value=paused?0:time;
  renderer.render(scene,camera);
 }
}
function tick(now) {
 frame=null;
 const delta=Math.min((now-last)/1000,.05);last=now;
 progress=paused?target:progress+(target-progress)*(1-Math.exp(-delta*12));
 if(Math.abs(progress-target)<.0001)progress=target;
 paint(progress,now/1000);
 if(visible&&!document.hidden&&!paused&&(Math.abs(progress-target)>.0001 || progress>.65))requestFrame();
}
function requestFrame(){if(!frame)frame=requestAnimationFrame(tick);}
function setPaused(value){
 paused=value;
 document.documentElement.classList.toggle('cinematic-paused',paused);
 motion.textContent=paused?'Enable motion':'Pause motion';
 motion.setAttribute('aria-pressed',String(paused));
 measure();
}
chapters.forEach((button,i)=>button.addEventListener('click',()=>{
 selected=i;
 if(paused){target=positions[i];requestFrame();}
 else window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top+positions[i]*(section.offsetHeight-stage.offsetHeight),behavior:'smooth'});
}));
motion.addEventListener('click',()=>{selected=state(progress).chapter;setPaused(!paused);});
reduced.addEventListener('change',e=>setPaused(e.matches));
window.addEventListener('scroll',measure,{passive:true});
window.addEventListener('resize',measure);
document.addEventListener('visibilitychange',requestFrame);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestFrame();}).observe(section);
setPaused(paused);

// Photorealistic CGI plates with a camera pullback and localized exhaust refraction.
// The scene stays available as ordinary images if WebGL cannot initialize.
async function initialize(){
 try {
  const loader=new THREE.TextureLoader();
  const textures=await Promise.all(plates.map(img=>loader.loadAsync(img.src)));
  renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.domElement.setAttribute('aria-hidden','true');
  host.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.Camera();
  material=new THREE.ShaderMaterial({
   uniforms:{cockpit:{value:textures[0]},pad:{value:textures[1]},launch:{value:textures[2]},viewport:{value:new THREE.Vector2()},imageAspect:{value:textures[0].image.width/textures[0].image.height},progress:{value:0},time:{value:0}},
   vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
   fragmentShader:`
   precision highp float;
   varying vec2 vUv;
   uniform sampler2D cockpit,pad,launch;
   uniform vec2 viewport;
   uniform float imageAspect,progress,time;
   vec2 cover(vec2 uv){
    float a=viewport.x/viewport.y;
    vec2 crop=vec2(min(a/imageAspect,1.0),min(imageAspect/a,1.0));
    return uv*crop+(1.0-crop)*vec2(.66,.5);
   }
   void main(){
    vec2 uv=cover(vUv);
    float r=smoothstep(.16,.32,progress);
    float ignition=smoothstep(.64,.76,progress);
    float zoom=1.0+2.7*(1.0-smoothstep(.23,.57,progress));
    vec2 cockpitUv=(uv-vec2(.65,.5))/(1.0+.12*smoothstep(0.0,.3,progress))+vec2(.65,.5);
    vec2 padUv=(uv-vec2(.65,.88))/zoom+vec2(.65,.88);
    float rise=smoothstep(.75,1.0,progress);
    vec2 launchUv=(uv-vec2(.66,.65))/(1.0+rise*.045)+vec2(.66,.65);
    // Restrict atmospheric movement below the engines, preserving rigid metal.
    float smoke=(1.0-smoothstep(.27,.43,launchUv.y))*smoothstep(.25,.5,launchUv.x);
    launchUv.x+=smoke*.0024*sin(launchUv.y*51.0-time*1.7)*sin(launchUv.x*32.0+time*.8);
    launchUv.y+=smoke*.0018*sin(launchUv.x*43.0-time*1.1);
    vec3 a=texture2D(cockpit,cockpitUv).rgb;
    vec3 b=texture2D(pad,padUv).rgb;
    vec3 c=texture2D(launch,launchUv).rgb;
    float heat=exp(-pow((launchUv.x-.66)*13.0,2.0))*(1.0-smoothstep(.25,.43,launchUv.y));
    c*=1.0+heat*.035*sin(time*12.0);
    gl_FragColor=vec4(mix(mix(a,b,r),c,ignition),1.0);
   }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('ready');renderer=null;});
  measure();paint(progress,0);host.classList.add('ready');
 }catch(error){host.classList.remove('ready');renderer=null;}
}
initialize();
