<div align="center">
  
  # Presente Especial

  *Um site interativo no estilo Spotify para o dia dos namorados*

  [![Vercel](https://img.shields.io/badge/deploy-vercel-black?style=flat-square&logo=vercel)](https://vercel.com) [![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat-square&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

  <br>
</div>

---

## Sobre

Single-page application temática do **Spotify** criada como presente romântico. Uma experiência imersiva que combina música, memórias e interatividade — tudo empacotado em uma estética elegante que qualquer casal vai amar.

### Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Player de Música** | Player completo no estilo Spotify: play/pause, like (pré-curtido), prev/next, barra de progresso com seek e gradiente dinâmico |
| **Contador de Tempo** | Contagem regressiva desde 27/02/2022 com animação 3D flip nos números |
| **Mensagem Especial** | Carta em tela cheia com fade effect, abre como página independente e salva a posição de scroll ao fechar |
| **Retrospectiva** | Série interativa de 5 telas comemorativas: animação de horas, cards de fotos com swipe, timeline em polaroid, constelação canvas e resumo com confete |
| **Tela Inicial Spotify** | Splash fake do Spotify com banner central e navegação inferior |
| **100% Responsivo** | Otimizado para iPhone com safe-area-insets, viewport-fit=cover e overscroll-behavior |

---

## Tecnologias

- **HTML5** — Estrutura semântica e acessível
- **CSS3** — Design system com variáveis, animações keyframe, flexbox/grid, gradientes
- **JavaScript (Vanilla)** — Toda a lógica sem frameworks: DOM, áudio API, canvas, temporizadores
- **Vercel** — Deploy contínuo como static site

---

## Design System

```css
--bg-primary:        #121212   /* Fundo escuro Spotify */
--bg-secondary:      #1e1e1e   /* Cards e containers */
--bg-card:           #282828   /* Cards elevados */
--spotify-green:     #1DB954   /* Verde icônico */
--text-primary:      #ffffff   /* Texto principal */
--text-secondary:    #b3b3b3   /* Texto secundário */
```

---

## Estrutura

```
├── index.html            # Página principal com todas as seções
├── vercel.json           # Configuração de deploy Vercel
├── README.md             # Você está aqui
├── assets/
│   ├── musica.mp3        # Música tema
│   └── images/
│       ├── foto-musica.jpg   # Capa do player
│       ├── foto-casal.jpg    # Foto do casal
│       └── foto1.jpg a foto5.jpg  # Fotos da retrospectiva
├── css/
│   └── styles.css        # Estilos completos
└── js/
    └── script.js         # Lógica completa do app
```

---

## Deploy

```bash
# 1. Clone
git clone https://github.com/ojuansoares/dia_dos_namorados.git

# 2. Adicione os assets (música e fotos) na pasta assets/
# 3. Personalize as mensagens em index.html
# 4. Faça deploy no Vercel (conecte o repositório)

# Ou deploy manual:
npx vercel --prod
```

> O projeto já inclui `vercel.json` configurado para static site com fallback de rotas.

---

## Em Andamento

- [ ] Adicionar funcionalidade de **compartilhar** via WhatsApp
- [ ] **Modo escuro** aprimorado com temas sazonais
- [ ] **Efeitos sonoros** ao navegar na retrospectiva
- [ ] **Modo presente** com data futura programável

---

Feito por [Juan Soares](https://github.com/ojuansoares)
