# DH | Dev — Memória do Projeto

## Stack
- HTML/CSS/JS puro (sem build tools)
- Firebase Firestore (dados dos projetos) + Auth (admin)
- Cloudinary (upload e armazenamento de imagens)
- SortableJS (drag reorder no admin)
- Google Fonts: Sora + JetBrains Mono

## Estrutura
```
/
├── index.html          # Landing page principal
├── admin.html          # Painel administrativo
├── css/
│   ├── style.css       # Estilos do site
│   └── admin.css       # Estilos do admin
├── js/
│   ├── script.js       # Lógica do site (modal, carrossel, lightbox, typewriter, partículas, Firebase)
│   ├── admin.js        # CRUD, auth, upload, drag-reorder
│   └── firebase-config.js  # Config do Firebase
├── img/                # Imagens locais (hero photo, logo, og-image)
├── robots.txt
├── sitemap.xml
└── README.md
```

## Firebase
- **Projeto**: `meuportifolio-81a22`
- **Firestore collection**: `projects`
  - Campos: `title`, `description`, `tags` (array), `images` (array de URLs), `imageUrl` (primeira imagem), `stack` (array), `link`, `published` (bool), `order` (number), `createdAt`, `updatedAt`
- **Auth**: Email/senha (admin)
- **Índice composto necessário**: `published` ASC + `order` ASC

## Cloudinary
- **Cloud name**: `dycwp4ds9`
- **Upload preset**: `portifolio` (unsigned)
- **Pasta**: `portifolio`

## Funcionalidades do Site
- Hero com partículas (canvas) + typewriter + foto com float animation
- Seções: Sobre, Serviços, Projetos, CTA
- Projetos carregados dinamicamente do Firestore
- Skeleton loading (3 cards placeholder) → blur placeholder nas thumbs → stagger fade-up
- Modal com carrossel (setas azuis SVG, dots, navegação por teclado ← →, focus trap)
- Lightbox com zoom e navegação entre imagens (setas + teclado)
- Scroll reveal (IntersectionObserver)
- Contagem animada dos stats
- Smooth scroll com `scroll-margin-top: 24px` (ajustado para não cortar o conteúdo pela nav sticky)
- Descrições com quebra de linha preservada (`white-space: pre-line` nos cards e modal)
- Botão back-to-top + WhatsApp flutuante
- Responsivo: 3 col (>1100px), 2 col (600-1100px), 1 col (<600px)

## Funcionalidades do Admin
- Login com email/senha (Firebase Auth)
- CRUD completo com modal
- Multi-upload de imagens (drag-reorder com SortableJS, cover star, preview)
- Publicar/arquivar toggle
- Ordenação por drag
- Toast notifications (success/error/info)

## Textos Padronizados
- Nav: Início, Sobre, Serviços, Projetos, Contato
- Hero typewriter: `Full-Stack | Web Developer.`
- Stats: Projetos Entregues, Clientes Satisfeitos, Anos de Experiência
- Subtítulo Sobre: "Transformando ideias em produtos digitais de alto impacto"
- Footer: `<feito com ❤️ e código />`
- Alt de imagens: "Imagem N de M" (português, sem anglicismos)

## Observações
- Não usa Firebase Storage — só Cloudinary
- Não usa build tools — Firebase compat SDK via CDN
- Admin é página separada em `/admin.html`
- Usuário admin precisa ser criado manualmente no Firebase Console
- Índice composto do Firestore precisa ser criado manualmente (link do erro no console)
- Site está configurado para domínio `dhdevcps.vercel.app` (OG images, canonical, sitemap)
