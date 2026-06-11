# DH | Dev — Portfolio

> Site profissional e painel administrativo para portfólio de desenvolvimento web.

![Preview do Hero](img/og-image.jpg)

## Funcionalidades

- Portfólio dinâmico com projetos carregados do **Firebase Firestore**
- Modal com **carrossel de imagens** por projeto
- Scroll reveal animado, contadores de stats e design responsivo
- **Admin panel** completo com login (Firebase Auth)
- CRUD de projetos com **upload múltiplo de imagens** (Cloudinary)
- Drag & drop para reordenar projetos (SortableJS)
- Publicar / despublicar projetos sem deploy

## Prints

| Tela | Preview |
|------|---------|
| Hero | `screenshots/hero-print.png` |
| Projetos com modal | `screenshots/produtos-print.png` |
| Admin — login | `screenshots/tela-login-print.png` |
| Admin — editor | `screenshots/tela-addprodutos-admin.png` |

## Stack

| Frontend | Backend / Infra |
|----------|----------------|
| HTML / CSS / JS (vanilla) | Firebase Firestore |
| Sora + JetBrains Mono | Firebase Auth |
| SortableJS (drag reorder) | Cloudinary (imagens) |

## Como rodar local

1. Clone o repositório
2. Abra o `index.html` direto no navegador (sem build, sem bundler)
3. Para o admin, acesse `/admin.html`

> ⚠️ Firestore precisa de um índice composto em `published` + `order`.  
> Crie em: Firebase Console → Firestore → Indexes

## Admin

1. Crie um usuário em Firebase Console → Authentication
2. Crie o upload preset `portifolio` (unsigned) em Cloudinary → Settings → Upload
3. Faça login em `/admin.html` e comece a adicionar projetos

## Deploy

O site está hospedado em: [dhdevcps.vercel.app](https://dhdevcps.vercel.app)
