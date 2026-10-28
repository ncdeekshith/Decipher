const menu=document.querySelector('.menu');
const nav=document.querySelector('#navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}});
const form=document.querySelector('#consultation');
if(form){
 const chosen=new URLSearchParams(location.search).get('service');
 if(['ad-films','film-production','branded-content','post-production','not-sure'].includes(chosen))form.elements.service.value=chosen;
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const service=form.elements.service.selectedOptions[0].text;const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')||'Not provided'}\nService: ${service}\n\nProject brief:\n${data.get('brief')}\n\nI agree to be contacted about this enquiry.`;location.href=`mailto:Deciphermediahouse@gmail.com?subject=${encodeURIComponent('Film project enquiry — '+service)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-status').textContent='Your brief is ready in your email app. It has not been sent by this website. Review it and send it there, or email Deciphermediahouse@gmail.com directly.'});
}
const filmIdPattern=/^[A-Za-z0-9_-]{11}$/;
function createPlayer(id,title){
 if(!filmIdPattern.test(id))return null;
 const frame=document.createElement('iframe');
 frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
 frame.title=title;
 frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
 frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';
 return frame;
}
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
 const frame=createPlayer(button.dataset.film,button.getAttribute('aria-label')||'Featured film');
 if(frame){button.replaceWith(frame);frame.focus();}
}));
const filmDialog=document.querySelector('#film-dialog');
if(filmDialog){
 let filmTrigger;
 document.querySelectorAll('[data-watch]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.watch;
  const frame=createPlayer(id,button.dataset.title);
  if(!frame)return;
  if(typeof filmDialog.showModal!=='function'){location.href=`https://www.youtube.com/watch?v=${id}`;return;}
  filmTrigger=button;
  document.querySelector('#film-dialog-title').textContent=button.dataset.title;
  document.querySelector('#dialog-youtube').href=`https://www.youtube.com/watch?v=${id}`;
  document.querySelector('#dialog-player').replaceChildren(frame);
  filmDialog.showModal();
  document.documentElement.classList.add('film-open');
 }));
 document.querySelector('.dialog-close').addEventListener('click',()=>filmDialog.close());
 filmDialog.addEventListener('click',event=>{if(event.target===filmDialog){const rect=filmDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)filmDialog.close();}});
 filmDialog.addEventListener('close',()=>{
  document.querySelector('#dialog-player').replaceChildren();
  document.documentElement.classList.remove('film-open');
  filmTrigger?.focus();
 });
}
const filters=[...document.querySelectorAll('[data-filter]')];
const projects=[...document.querySelectorAll('.portfolio-card[data-category]')];
filters.forEach(button=>button.addEventListener('click',()=>{
 const selected=button.dataset.filter;
 filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
 let count=0;
 projects.forEach(project=>{project.hidden=selected!=='all'&&project.dataset.category!==selected;if(!project.hidden)count++;});
 document.querySelector('#portfolio-count').textContent=`${count} ${count===1?'project':'projects'}`;
}));
