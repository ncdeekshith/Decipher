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
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
 const frame=document.createElement('iframe');
 frame.src='https://www.youtube-nocookie.com/embed/Kgo_Ad4parY?autoplay=1';
 frame.title='Featured myPAL film';
 frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
 frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';
 button.replaceWith(frame);
 frame.focus();
}));
