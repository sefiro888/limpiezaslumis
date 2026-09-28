(() => {
 'use strict';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const header=document.querySelector('.site-header');
 let scrollQueued=false;
 const updateScroll=()=>{
  scrollQueued=false;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  header.style.setProperty('--read-progress',String(max>0?Math.min(1,Math.max(0,window.scrollY/max)):0));
  header.classList.toggle('is-scrolled',window.scrollY>32);
  const jumps=[...document.querySelectorAll('.service-jumpnav a')];
  let active=jumps[0];
  jumps.forEach(link=>{const section=document.querySelector(link.getAttribute('href'));if(section&&section.getBoundingClientRect().top<190)active=link;});
  jumps.forEach(link=>{if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 };
 window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;if(window.requestAnimationFrame)window.requestAnimationFrame(updateScroll);else setTimeout(updateScroll,16);}},{passive:true});
 updateScroll();

 const carousel=document.querySelector('.scene-carousel');
 if(carousel){
  const tabs=[...carousel.querySelectorAll('[role="tab"]')];
  const panels=[...carousel.querySelectorAll('[role="tabpanel"]')];
  const pause=carousel.querySelector('.scene-pause');
  let current=0,timer=null,userPaused=false,hovering=false,inView=true;
  const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
  const schedule=()=>{
   stop();
   if(userPaused||reduced.matches||document.hidden||hovering||!inView||carousel.contains(document.activeElement))return;
   timer=setTimeout(()=>show((current+1)%tabs.length),7200);
  };
  const pauseLabel=()=>{pause.setAttribute('aria-pressed',String(userPaused));pause.setAttribute('aria-label',userPaused?'Reanudar cambio de escenas':'Pausar cambio de escenas');pause.querySelector('span').textContent=userPaused?'▶':'Ⅱ';};
  const show=(index,manual=false)=>{
   current=(index+tabs.length)%tabs.length;
   tabs.forEach((tab,i)=>{const active=i===current;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;panels[i].hidden=!active;});
   if(manual){userPaused=true;pauseLabel();}
   schedule();
  };
  tabs.forEach((tab,i)=>{
   tab.addEventListener('click',()=>show(i,true));
   tab.addEventListener('keydown',event=>{
    let next=null;
    if(event.key==='ArrowRight')next=(i+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==null){event.preventDefault();show(next,true);tabs[next].focus();}
   });
  });
  pause.addEventListener('click',()=>{userPaused=!userPaused;pauseLabel();schedule();});
  carousel.addEventListener('mouseenter',()=>{hovering=true;stop();});
  carousel.addEventListener('mouseleave',()=>{hovering=false;schedule();});
  carousel.addEventListener('focusin',stop);
  carousel.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget))setTimeout(schedule,0);});
  document.addEventListener('visibilitychange',schedule);
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(carousel);}
  reduced.addEventListener('change',()=>{pause.hidden=reduced.matches;schedule();});
  pause.hidden=reduced.matches;
  schedule();
 }

 const form=document.querySelector('.consultation-form');
 if(form){
  const select=form.querySelector('select');
  const sourceOptions=[...select.options].map(option=>({value:option.value,label:option.textContent,category:option.dataset.category}));
  const zone=form.querySelector('[name="zone"]');
  const size=form.querySelector('[name="size"]');
  const preview=form.querySelector('textarea');
  const link=form.querySelector('.planner-send');
  const note=form.querySelector('.planner-service-note');
  const updateMessage=()=>{
   const service=sourceOptions.find(option=>option.value===select.value);
   if(!service)return;
   let message=`Hola, he visto la web de Limpiezas Lumis y quería consultar ${service.label.toLocaleLowerCase('es')}.`;
   message+=zone.value.trim()?` El espacio está en ${zone.value.trim()}.`:' El espacio está en Zaragoza.';
   if(size.value.trim())message+=` El tamaño aproximado es ${size.value.trim()}.`;
   message+=' Puedo enviaros fotografías. ¿Podemos hablar del presupuesto?';
   preview.value=message;
   link.href='https://wa.me/34652609338?text='+encodeURIComponent(message);
   note.hidden=!['tapicerias','sofas'].includes(select.value);
  };
  const updateCategory=()=>{
   const category=form.querySelector('[name="space"]:checked').value;
   const previous=select.value;
   const options=sourceOptions.filter(option=>option.category===category);
   select.replaceChildren(...options.map(item=>{const option=document.createElement('option');option.value=item.value;option.textContent=item.label;return option;}));
   if(options.some(option=>option.value===previous))select.value=previous;
   else select.value={hogar:'pisos-viviendas',exterior:'cristales',profesional:'oficinas',superficies:'pulido-suelos'}[category];
   updateMessage();
  };
  form.querySelectorAll('[name="space"]').forEach(input=>input.addEventListener('change',updateCategory));
  select.addEventListener('change',updateMessage);
  zone.addEventListener('input',updateMessage);size.addEventListener('input',updateMessage);
  form.addEventListener('submit',event=>{event.preventDefault();link.focus();});
  updateCategory();
 }

 const viewer=document.querySelector('.image-viewer');
 const gallery=[...document.querySelectorAll('.gallery-open')];
 if(viewer&&typeof viewer.showModal==='function'){
  let index=0,origin=null;
  const image=viewer.querySelector('img');
  const counter=viewer.querySelector('.viewer-count');
  const show=indexToShow=>{index=(indexToShow+gallery.length)%gallery.length;image.src=gallery[index].href;image.alt=gallery[index].querySelector('img').alt;counter.textContent=`${index+1} / ${gallery.length}`;};
  gallery.forEach((link,i)=>link.addEventListener('click',event=>{
   if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();origin=link;show(i);viewer.showModal();document.body.classList.add('viewer-open');
  }));
  viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
  viewer.querySelector('.viewer-prev').addEventListener('click',()=>show(index-1));
  viewer.querySelector('.viewer-next').addEventListener('click',()=>show(index+1));
  viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}});
  viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');if(origin)origin.focus();});
 }
})();
