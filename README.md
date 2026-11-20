# Alurea — hotels & stays

Landing page da Alurea, codificada a partir do Figma "Alurea-Page", com copy idêntica ao design (ver `COPY.md`).

## Stack
- **React 18 + Vite**: front-end
- **Node.js + Express**: serve o build e a API `/api/content` e `/api/health`
- **Three.js**: cena WebGL do hero (shader com grading noturno, janelas acendendo, poeira dourada), carrossel 3D curvo dos parceiros e partículas do CTA
- **GSAP + ScrollTrigger + Lenis**: entrada orquestrada, reveals no scroll, contadores, rotas do mapa traçadas com o scroll, parallax e scroll suave

## Como rodar
```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # build de produção em dist/
npm start          # servidor Node em http://localhost:3001
```

`npm run optimize-images` converte as imagens exportadas do Figma para WebP.

## Estrutura
```
server/index.js        servidor Express
src/content.js         textos da página (fonte: COPY.md)
src/sections/          uma seção por arquivo (Hero, Sobre, Hoteis, Beneficios, ...)
src/three/             cenas WebGL (HeroScene, PartnersCarousel, DustField)
src/lib/               motion (GSAP/Lenis), hooks de GSAP e WebGL
src/styles/            tokens, base, components, sections
public/img/            imagens e ícones do Figma
```

## Acessibilidade e movimento
- `prefers-reduced-motion`: desliga deslocamentos, parallax, scroll suave e loops; contadores mostram o valor final.
- As cenas WebGL só animam enquanto estão visíveis. Sem WebGL, aparece um fallback em imagem.
