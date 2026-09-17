# Gabriel Marques — Portfolio 2026

Portfólio web multi-page com foco em motion design, WebGL e experiência interativa.

## Tecnologias

- HTML5 + CSS responsivo
- JavaScript vanilla
- Three.js / WebGL
- Shader customizado com `THREE.ShaderMaterial`
- GSAP + ScrollTrigger
- Transições de página com painéis GSAP
- Cursor customizado, magnetic buttons, tilt 3D e parallax

## Estrutura

- `index.html` — Home e showcase principal
- `perfil.html` — Perfil, trajetória e stack
- `projetos.html` — Projetos selecionados
- `certificados.html` — Galeria com modal de certificados
- `contato.html` — Contato e formulário para WhatsApp
- `assets/css/style.css` — Design system e responsividade
- `assets/js/app.js` — Three.js, shaders, animações e interações
- `assets/img/` — Foto, projetos e certificados

## Rodar localmente

Por usar bibliotecas CDN e transições entre páginas, execute com servidor HTTP local:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

Também pode ser publicado diretamente no GitHub Pages, Netlify ou Vercel sem build.
