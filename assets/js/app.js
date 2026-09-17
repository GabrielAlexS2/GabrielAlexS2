(() => {
  'use strict';

  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => [...c.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const hexToRgb = (hex) => {
    const raw = String(hex || '#b7ff3c').replace('#', '').trim();
    const value = raw.length === 3 ? raw.split('').map(x => x + x).join('') : raw.padEnd(6, '0').slice(0, 6);
    const n = parseInt(value, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  function setAccent(hex) {
    if (!hex) return;
    const [r,g,b] = hexToRgb(hex);
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`);
  }

  function initLoader() {
    const loader = qs('.loader');
    if (!loader) return;
    const bar = qs('.loader-bar', loader);
    const counter = qs('[data-loader-count]', loader);
    const hasSeen = sessionStorage.getItem('gabriel-portfolio-loaded') === '1';

    if (hasSeen || reducedMotion || !window.gsap) {
      loader.remove();
      document.documentElement.classList.add('is-ready');
      return;
    }

    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(97, value + Math.ceil(Math.random() * 11));
      if (counter) counter.textContent = String(value).padStart(2,'0');
    }, 60);

    gsap.timeline({
      onComplete: () => {
        clearInterval(timer);
        sessionStorage.setItem('gabriel-portfolio-loaded', '1');
        loader.remove();
        document.documentElement.classList.add('is-ready');
      }
    })
    .to(bar, {scaleX: 1, duration: .85, ease:'power2.inOut'})
    .call(() => { if (counter) counter.textContent = '100'; }, null, '-=.18')
    .to('.loader-word', {y:-18, opacity:0, duration:.35, ease:'power2.in'}, '-=.1')
    .to(loader, {clipPath:'inset(0 0 100% 0)', duration:.72, ease:'power4.inOut'});
  }

  function initPageTransitions() {
    if (!window.gsap || reducedMotion) return;
    const panels = qsa('.transition-panel');
    const label = qs('.transition-label');
    if (!panels.length) return;

    gsap.set(panels, {scaleY:1, transformOrigin:'top'});
    gsap.to(panels, {scaleY:0, duration:.74, stagger:.055, ease:'power4.inOut', transformOrigin:'top', delay:.12});

    const internalLinks = qsa('a[href]').filter(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
      if (a.target === '_blank' || a.hasAttribute('download')) return false;
      try {
        const url = new URL(a.href, window.location.href);
        return url.origin === window.location.origin && (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || !url.pathname.split('/').pop().includes('.'));
      } catch { return false; }
    });

    internalLinks.forEach(link => link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const targetUrl = link.href;
      if (targetUrl === window.location.href) return;
      e.preventDefault();
      const title = link.dataset.transitionLabel || link.textContent.trim() || 'Navegando';
      if (label) label.textContent = title;
      const tl = gsap.timeline({onComplete:() => window.location.href = targetUrl});
      tl.set(panels, {scaleY:0, transformOrigin:'bottom'})
        .to(panels, {scaleY:1, duration:.62, stagger:.045, ease:'power4.inOut'})
        .to(label, {opacity:1, duration:.18}, '-=.28');
    }));

    window.addEventListener('pageshow', () => {
      gsap.set(label, {opacity:0});
      gsap.to(panels, {scaleY:0, duration:.45, stagger:.035, transformOrigin:'top', ease:'power3.out'});
    });
  }

  function initMenu() {
    const btn = qs('.menu-toggle');
    const menu = qs('.mobile-menu');
    if (!btn || !menu || !window.gsap) return;
    const links = qsa('a', menu);
    let open = false;

    const setOpen = (next) => {
      open = next;
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      if (open) {
        gsap.set(menu, {autoAlpha:1});
        gsap.fromTo(links, {y:36, opacity:0}, {y:0, opacity:1, duration:.55, stagger:.05, ease:'power3.out'});
      } else {
        gsap.to(menu, {autoAlpha:0, duration:.35, ease:'power2.inOut'});
      }
    };
    btn.addEventListener('click', () => setOpen(!open));
    links.forEach(a => a.addEventListener('click', () => setOpen(false)));
  }

  function initCursor() {
    if (reducedMotion || isTouch || !window.gsap) return;
    const dot = qs('.cursor-dot');
    const ring = qs('.cursor-ring');
    const glow = qs('.cursor-glow');
    if (!dot || !ring) return;

    const xDot = gsap.quickTo(dot, 'x', {duration:.14, ease:'power3'});
    const yDot = gsap.quickTo(dot, 'y', {duration:.14, ease:'power3'});
    const xRing = gsap.quickTo(ring, 'x', {duration:.42, ease:'power3'});
    const yRing = gsap.quickTo(ring, 'y', {duration:.42, ease:'power3'});
    const xGlow = glow ? gsap.quickTo(glow, 'x', {duration:.8, ease:'power3'}) : null;
    const yGlow = glow ? gsap.quickTo(glow, 'y', {duration:.8, ease:'power3'}) : null;

    window.addEventListener('pointermove', (e) => {
      xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY);
      if (xGlow) { xGlow(e.clientX); yGlow(e.clientY); }
    }, {passive:true});

    qsa('a,button,input,textarea,select,[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add(el.dataset.cursor === 'view' ? 'is-view' : 'is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active','is-view'));
    });
  }

  function initMagnetic() {
    if (reducedMotion || isTouch || !window.gsap) return;
    qsa('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width/2);
        const y = e.clientY - (r.top + r.height/2);
        gsap.to(el, {x:x*.18, y:y*.18, duration:.35, ease:'power2.out'});
      });
      el.addEventListener('mouseleave', () => gsap.to(el, {x:0,y:0,duration:.6,ease:'elastic.out(1,.45)'}));
    });
  }

  function initTilt() {
    if (reducedMotion || isTouch || !window.gsap) return;
    qsa('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX-r.left)/r.width - .5;
        const py = (e.clientY-r.top)/r.height - .5;
        gsap.to(card, {rotateY:px*5, rotateX:py*-4, transformPerspective:1200, duration:.45, ease:'power2.out'});
      });
      card.addEventListener('pointerleave', () => gsap.to(card,{rotateX:0,rotateY:0,duration:.7,ease:'power3.out'}));
    });
  }

  function initScrollAnimations() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    qsa('[data-reveal]').forEach((el, i) => {
      gsap.to(el, {
        opacity:1, y:0, duration:.9, ease:'power3.out',
        delay: Math.min((i%3)*.05,.1),
        scrollTrigger:{trigger:el,start:'top 86%',once:true}
      });
    });

    qsa('[data-parallax]').forEach(el => {
      const speed = Number(el.dataset.parallax || .15);
      gsap.fromTo(el,{yPercent:-speed*20},{
        yPercent:speed*20, ease:'none',
        scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}
      });
    });

    qsa('[data-scale-scroll]').forEach(el => {
      gsap.fromTo(el,{scale:.93},{scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top 90%',end:'top 30%',scrub:true}});
    });

    const progress = qs('.scroll-progress');
    if (progress) gsap.to(progress,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});

    const heroPortrait = qs('.hero-portrait');
    if (heroPortrait) gsap.to(heroPortrait,{yPercent:10,rotateY:-2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    qsa('.project-card .project-media img').forEach(img => {
      gsap.fromTo(img,{yPercent:-4,scale:1.06},{yPercent:4,scale:1.06,ease:'none',scrollTrigger:{trigger:img.parentElement.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }

  function initSectionAccents(webgl) {
    const sections = qsa('[data-scene]');
    if (!sections.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const accent = entry.target.dataset.accent;
        setAccent(accent);
        webgl?.setScene(Number(entry.target.dataset.scene || 0), accent);
      });
    }, {threshold:.42, rootMargin:'-12% 0px -12% 0px'});
    sections.forEach(section => observer.observe(section));
  }

  function initWebGL() {
    if (reducedMotion || !window.THREE) {
      document.body.classList.add('no-webgl');
      return null;
    }
    const canvas = qs('.webgl-canvas');
    if (!canvas) return null;

    try {
      const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.35 : 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, window.innerWidth/window.innerHeight,.1,100);
      camera.position.z = 6.8;

      const geometry = new THREE.IcosahedronGeometry(1.72, window.innerWidth < 768 ? 3 : 4);
      const uniforms = {
        uTime:{value:0},
        uMouse:{value:new THREE.Vector2(0,0)},
        uAccent:{value:new THREE.Color('#b7ff3c')},
        uScene:{value:0},
        uEnergy:{value:.6}
      };
      const material = new THREE.ShaderMaterial({
        transparent:true,
        side:THREE.DoubleSide,
        uniforms,
        vertexShader:`
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uScene;
          uniform float uEnergy;
          varying vec3 vPos;
          varying vec3 vNormal;
          varying float vPulse;
          void main(){
            vec3 p = position;
            float sceneMix = 1.0 + uScene * 0.21;
            float w1 = sin((p.y * (3.4 + uScene*.7)) + uTime * (1.0 + uScene*.13));
            float w2 = cos((p.x * (4.2 - min(uScene,2.0)*.35)) - uTime * .72 + uMouse.x*1.6);
            float w3 = sin((p.z * 3.1) + uTime*.55 + uMouse.y*1.9);
            float disp = (w1*w2*.10 + w3*.055) * sceneMix * uEnergy;
            p += normal * disp;
            p.x += sin(p.y*2.6 + uTime*.45) * .045 * uScene;
            vPos = p;
            vNormal = normalize(normalMatrix * normal);
            vPulse = disp;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
          }
        `,
        fragmentShader:`
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec3 uAccent;
          uniform float uScene;
          varying vec3 vPos;
          varying vec3 vNormal;
          varying float vPulse;
          void main(){
            vec3 viewDir = normalize(vec3(0.0,0.0,1.0));
            float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.25);
            float bands = .5 + .5*sin(vPos.y*7.0 + vPos.x*2.0 + uTime*1.2 + uScene*.8);
            vec3 base = mix(vec3(.035,.035,.04), uAccent*.72, fresnel*.84 + bands*.1);
            base += vec3(.18,.20,.22) * max(vPulse,0.0) * 1.8;
            float alpha = .18 + fresnel*.58;
            gl_FragColor = vec4(base, alpha);
          }
        `
      });
      const mesh = new THREE.Mesh(geometry,material);
      mesh.position.set(window.innerWidth > 900 ? 2.45 : .9, .15, 0);
      mesh.rotation.set(.35,-.55,.2);
      scene.add(mesh);

      const wireMaterial = new THREE.MeshBasicMaterial({color:'#ffffff',wireframe:true,transparent:true,opacity:.06});
      const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.02,2),wireMaterial);
      wire.position.copy(mesh.position);
      scene.add(wire);

      const haloMat = new THREE.MeshBasicMaterial({color:'#b7ff3c',wireframe:true,transparent:true,opacity:.10});
      const halo = new THREE.Mesh(new THREE.TorusKnotGeometry(2.15,.012,180,18,2,3),haloMat);
      halo.position.copy(mesh.position);
      halo.rotation.set(.3,.4,.1);
      scene.add(halo);

      const count = window.innerWidth < 768 ? 700 : 1400;
      const pos = new Float32Array(count*3);
      for(let i=0;i<count;i++){
        pos[i*3] = (Math.random()-.5)*13;
        pos[i*3+1] = (Math.random()-.5)*9;
        pos[i*3+2] = (Math.random()-.5)*6 - 1;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const pMat = new THREE.PointsMaterial({color:'#ffffff',size:.009,transparent:true,opacity:.22,sizeAttenuation:true});
      const particles = new THREE.Points(pGeo,pMat);
      scene.add(particles);

      const pointer = {x:0,y:0,tx:0,ty:0};
      window.addEventListener('pointermove', e => {
        pointer.tx = (e.clientX/window.innerWidth)*2-1;
        pointer.ty = -(e.clientY/window.innerHeight)*2+1;
      }, {passive:true});

      let targetScene = 0;
      let targetAccent = new THREE.Color('#b7ff3c');
      let currentScene = 0;
      const clock = new THREE.Clock();

      const setScene = (n=0, accent='#b7ff3c') => {
        targetScene = n;
        targetAccent = new THREE.Color(accent || '#b7ff3c');
      };

      function tick(){
        const t = clock.getElapsedTime();
        pointer.x += (pointer.tx-pointer.x)*.055;
        pointer.y += (pointer.ty-pointer.y)*.055;
        currentScene += (targetScene-currentScene)*.035;
        uniforms.uTime.value = t;
        uniforms.uMouse.value.set(pointer.x,pointer.y);
        uniforms.uScene.value = currentScene;
        uniforms.uEnergy.value = .62 + Math.sin(t*.5)*.08;
        uniforms.uAccent.value.lerp(targetAccent,.035);
        haloMat.color.lerp(targetAccent,.035);

        const mobile = window.innerWidth < 820;
        const baseX = mobile ? .95 : 2.4;
        mesh.position.x += ((baseX + pointer.x*.18) - mesh.position.x)*.035;
        mesh.position.y += ((.15 + pointer.y*.15) - mesh.position.y)*.035;
        wire.position.copy(mesh.position); halo.position.copy(mesh.position);
        mesh.rotation.y = -.55 + t*.065 + pointer.x*.14 + currentScene*.09;
        mesh.rotation.x = .28 + Math.sin(t*.24)*.12 + pointer.y*.12;
        mesh.scale.setScalar(1 + Math.sin(currentScene*1.4)*.045);
        wire.rotation.y = t*-.032 + currentScene*.08;
        wire.rotation.x = t*.021;
        halo.rotation.z = t*.05;
        halo.rotation.y = t*.035;
        particles.rotation.y = t*.006;
        camera.position.x += (pointer.x*.15-camera.position.x)*.025;
        camera.position.y += (pointer.y*.08-camera.position.y)*.025;
        camera.lookAt(0,0,0);
        renderer.render(scene,camera);
        requestAnimationFrame(tick);
      }
      tick();

      const resize = () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w/h; camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 768 ? 1.35 : 1.8));
        renderer.setSize(w,h,false);
      };
      window.addEventListener('resize', resize, {passive:true});
      return {setScene};
    } catch (err) {
      console.warn('WebGL indisponível:', err);
      document.body.classList.add('no-webgl');
      return null;
    }
  }

  function initCertificateModal() {
    const modal = qs('.cert-modal');
    if (!modal || !window.gsap) return;
    const img = qs('.cert-modal-media img',modal);
    const title = qs('[data-modal-title]',modal);
    const meta = qs('[data-modal-meta]',modal);
    const close = qs('.modal-close',modal);
    const dialog = qs('.cert-modal-dialog',modal);

    const open = (card) => {
      img.src = card.dataset.full || qs('img',card)?.src || '';
      img.alt = card.dataset.title || 'Certificado';
      title.textContent = card.dataset.title || 'Certificado';
      meta.textContent = card.dataset.meta || '';
      modal.style.visibility='visible';
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      gsap.timeline().to(modal,{opacity:1,duration:.28}).to(dialog,{y:0,scale:1,duration:.5,ease:'power3.out'},'-=.12');
      close?.focus();
    };
    const hide = () => {
      gsap.timeline({onComplete:()=>{
        modal.style.visibility='hidden'; modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
      }}).to(dialog,{y:18,scale:.985,duration:.25}).to(modal,{opacity:0,duration:.25},'-=.1');
    };
    qsa('.certificate-card').forEach(card => {
      card.addEventListener('click',()=>open(card));
      card.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(card); } });
    });
    close?.addEventListener('click',hide);
    modal.addEventListener('click',e=>{if(e.target===modal) hide();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && modal.getAttribute('aria-hidden')==='false') hide();});
  }

  function initContactForm() {
    const form = qs('#contact-form');
    if (!form) return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data = new FormData(form);
      const nome = String(data.get('name')||'').trim();
      const email = String(data.get('email')||'').trim();
      const assunto = String(data.get('subject')||'Novo contato').trim();
      const mensagem = String(data.get('message')||'').trim();
      const text = `Olá, Gabriel! Me chamo ${nome}.\nE-mail: ${email}\nAssunto: ${assunto}\n\n${mensagem}`;
      window.open(`https://wa.me/5585992693144?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');
    });
  }

  function initYear() {
    qsa('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initPageTransitions();
    initMenu();
    initCursor();
    initMagnetic();
    initTilt();
    const webgl = initWebGL();
    initSectionAccents(webgl);
    initScrollAnimations();
    initCertificateModal();
    initContactForm();
    initYear();
  });
})();
