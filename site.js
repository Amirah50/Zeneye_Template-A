(function(){
  var root=document.documentElement,KEY='zeneye-theme',label=document.getElementById('modeLabel');
  function apply(t){if(t==='zen'){root.setAttribute('data-theme','zen');label.textContent='Default'}else{root.removeAttribute('data-theme');label.textContent='Zen Mode'}}
  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}apply(saved);
  document.getElementById('mode').addEventListener('click',function(){var n=root.getAttribute('data-theme')==='zen'?'light':'zen';apply(n);try{localStorage.setItem(KEY,n)}catch(e){}});

  var burger=document.getElementById('burger'),mnav=document.getElementById('mnav');
  burger.addEventListener('click',function(){var o=mnav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  document.getElementById('yr').textContent=new Date().getFullYear();
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // dropdown: hover (mouse), click/tap, Esc, outside click
  var dd=document.querySelector('.dd'),btn=dd.querySelector('.dd-btn'),t;
  function open(o){dd.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)}
  btn.addEventListener('click',function(e){e.stopPropagation();open(!dd.classList.contains('open'))});
  if(matchMedia('(hover:hover)').matches){
    dd.addEventListener('mouseenter',function(){clearTimeout(t);open(true)});
    dd.addEventListener('mouseleave',function(){t=setTimeout(function(){open(false)},180)});
  }
  document.addEventListener('click',function(e){if(!dd.contains(e.target))open(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){open(false);btn.focus()}});

  var bar=document.getElementById('bar'),hd=document.getElementById('hd'),tick=false;
  function onS(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')';hd.classList.toggle('s',scrollY>8);tick=false}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onS)}},{passive:true});onS();

  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('on');io.unobserve(e.target)})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  var CLIPPED='[data-m=wipe],[data-m=circle],[data-m=inset]';
  var pending=[].slice.call(document.querySelectorAll(CLIPPED));
  document.querySelectorAll('.rv').forEach(function(el){if(!el.matches(CLIPPED))io.observe(el)});
  // fully clipped elements have no visible area, so the observer never sees them: check by position instead
  function checkClipped(){pending=pending.filter(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*0.94&&r.bottom>0){el.classList.add('on');return false}return true})}
  addEventListener('scroll',checkClipped,{passive:true});addEventListener('resize',checkClipped);checkClipped();

  // video strip (home): clips appear when the file exists in /videos
  var reel=document.getElementById('reel');
  if(reel){
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
      [].forEach.call(reel.querySelectorAll('.clip'),function(c){var v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';
        v.addEventListener('loadeddata',function(){var m=c.querySelector('.m');m.appendChild(v);var p=m.querySelector('.ph');if(p)p.remove()},{once:true});v.src=c.dataset.v});
      vio.disconnect()})},{rootMargin:'200px'});
    vio.observe(reel);
    reel.addEventListener('click',function(e){var c=e.target.closest('.clip'),v=c&&c.querySelector('video');if(v){v.paused?v.play():v.pause()}});
  }

  // contact form
  var f=document.getElementById('visit');
  if(f){
    var b=new URLSearchParams(location.search).get('b'),sel=document.getElementById('s');
    if(b){var g=sel.querySelector('optgroup[data-k="'+b+'"]');if(g)sel.value=g.firstElementChild.textContent}
    var sv=new URLSearchParams(location.search).get('s');if(sv)[].forEach.call(sel.options,function(o){if(o.textContent===sv)sel.value=o.value||o.textContent});
    f.addEventListener('submit',function(e){
      e.preventDefault();var ok=document.getElementById('ok'),bad=document.getElementById('bad');ok.style.display='none';bad.style.display='none';
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
        .then(function(r){if(!r.ok)throw 0;ok.style.display='block';f.reset()}).catch(function(){bad.style.display='block'});
    });
  }
})();

// ---- hero slider: six businesses, each new slide wipes in from left to right
(function(){
  var sl=document.getElementById('slider');if(!sl)return;
  var slides=[].slice.call(sl.querySelectorAll('.sl')),dotsEl=document.getElementById('slDots'),i=0,timer,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar=document.createElement('div');bar.className='sl-bar';sl.appendChild(bar);
  var dots=slides.map(function(s,n){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show '+s.getAttribute('aria-label'));b.addEventListener('click',function(){go(n);restart()});dotsEl.appendChild(b);return b});
  function show(n,first){
    var old=slides[i];i=(n+slides.length)%slides.length;var nw=slides[i];
    if(!first){slides.forEach(function(s){s.classList.remove('prev')});old.classList.remove('cur');old.classList.add('prev');
      nw.style.transition='none';nw.classList.remove('cur','prev');void nw.offsetWidth;nw.style.transition='';}
    nw.classList.add('cur');
    dots.forEach(function(d,k){d.classList.toggle('on',k===i)});
  }
  function go(n){show(n)}
  function barRun(){bar.classList.remove('run');void bar.offsetWidth;if(!reduce)bar.classList.add('run')}
  function restart(){clearInterval(timer);barRun();if(!reduce)timer=setInterval(function(){go(i+1);barRun()},5000)}
  function stop(){clearInterval(timer);bar.classList.remove('run');bar.style.transform='scaleX(0)'}
  document.getElementById('slNext').addEventListener('click',function(){go(i+1);restart()});
  document.getElementById('slPrev').addEventListener('click',function(){go(i-1);restart()});
  sl.addEventListener('mouseenter',stop);sl.addEventListener('mouseleave',restart);sl.addEventListener('focusin',stop);sl.addEventListener('focusout',restart);
  var x0=null;sl.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  sl.addEventListener('touchend',function(e){if(x0===null)return;var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40){go(i+(d<0?1:-1));restart()}x0=null});
  show(0,true);restart();
})();

// contact page opened from "Book a site visit"
(function(){
  var h=document.getElementById('ct');if(!h)return;
  if(new URLSearchParams(location.search).get('visit')){h.textContent='Book a site visit';var f=document.getElementById('d');if(f)setTimeout(function(){f.focus({preventScroll:true})},900)}
})();
