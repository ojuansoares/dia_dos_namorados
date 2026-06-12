/* ========== CONSTANTS ========== */
const START_DATE = new Date(2022, 1, 27, 13, 0, 0); // 27/02/2022 13:00 (month is 0-indexed)

/* ========== DOM REFS ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ========== GLOBALS ========== */
const mainContent = $('#main-content');

/* ========== AUDIO ========== */
let audio = null;
let isPlaying = false;
let isLiked = true;

const btnPlay = $('#btnPlay');
const btnLike = $('#btnLike');
const progressBar = $('#progressBar');
const progressFill = $('#progressFill');
const progressThumb = $('#progressThumb');
const timeCurrent = $('#timeCurrent');
const timeTotal = $('#timeTotal');
const albumArt = $('#albumArt');

function initAudio() {
  audio = new Audio();
  audio.src = 'assets/musica.mp3';

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
    if (msgTimeTotal) msgTimeTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      timeCurrent.textContent = formatTime(audio.currentTime);
      if (msgProgressFill) msgProgressFill.style.width = pct + '%';
      if (msgProgressThumb) msgProgressThumb.style.left = pct + '%';
      if (msgTimeCurrent) msgTimeCurrent.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>';
    albumArt.classList.remove('playing');
    if (msgBtnPlay) msgBtnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M8 5v14l11-7z"/></svg>';
  });

  audio.loop = false;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function togglePlay() {
  if (!audio) return;
  if (!audio.src || audio.src.endsWith('/')) {
    audio.src = 'assets/musica.mp3';
  }
  if (isPlaying) {
    audio.pause();
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>';
    albumArt.classList.remove('playing');
    if (msgBtnPlay) msgBtnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M8 5v14l11-7z"/></svg>';
  } else {
    audio.play().catch(() => {});
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    albumArt.classList.add('playing');
    if (msgBtnPlay) msgBtnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  }
  isPlaying = !isPlaying;
}

btnPlay.addEventListener('click', togglePlay);

btnLike.addEventListener('click', () => {
  isLiked = !isLiked;
  btnLike.classList.toggle('active');
});

// Progress bar seek
let isDragging = false;

progressBar.addEventListener('mousedown', startSeek);
progressBar.addEventListener('touchstart', startSeek, { passive: true });
document.addEventListener('mousemove', moveSeek);
document.addEventListener('touchmove', moveSeek, { passive: true });
document.addEventListener('mouseup', endSeek);
document.addEventListener('touchend', endSeek);

function startSeek(e) {
  isDragging = true;
  updateSeek(e);
}

function moveSeek(e) {
  if (isDragging) updateSeek(e);
}

function endSeek() {
  isDragging = false;
}

function updateSeek(e) {
  if (!audio || !audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.max(0, Math.min(1, pct));
  audio.currentTime = pct * audio.duration;
  progressFill.style.width = (pct * 100) + '%';
  progressThumb.style.left = (pct * 100) + '%';
  timeCurrent.textContent = formatTime(audio.currentTime);
}

/* ========== NAVIGATION ========== */
const heroOverlay = $('#hero-overlay');

$('#btnVerPresente').addEventListener('click', () => {
  heroOverlay.style.display = 'none';
  mainContent.style.display = 'block';
  if (!audio) initAudio();
  requestAnimationFrame(() => {
    const playerSection = document.getElementById('player-section');
    if (playerSection) playerSection.scrollIntoView({ behavior: 'smooth' });
  });
  if (audio && audio.src && !audio.src.endsWith('/')) {
    audio.play().catch(() => {});
    isPlaying = true;
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    albumArt.classList.add('playing');
  }
});

/* ========== COUNTDOWN ========== */
const countEls = {
  years: $('#countYears'),
  months: $('#countMonths'),
  days: $('#countDays'),
  hours: $('#countHours'),
  minutes: $('#countMinutes'),
  seconds: $('#countSeconds'),
};

let prevCount = { years: -1, months: -1, days: -1, hours: -1, minutes: -1, seconds: -1 };

function animateCountEl(el) {
  if (!el) return;
  el.classList.remove('count-flip');
  void el.offsetWidth;
  el.classList.add('count-flip');
}

function updateCountdown() {
  const now = new Date();
  let diff = now - START_DATE;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);

  let years = now.getFullYear() - START_DATE.getFullYear();
  let months = now.getMonth() - START_DATE.getMonth();
  let days = now.getDate() - START_DATE.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const vals = { years, months, days, hours, minutes, seconds };

  for (const key of Object.keys(vals)) {
    const el = countEls[key];
    const str = String(vals[key]).padStart(2, '0');
    if (el && el.textContent !== str) {
      el.textContent = str;
      animateCountEl(el);
    }
    prevCount[key] = vals[key];
  }

  // Update summary too
  const sumDays = $('#sumDays');
  if (sumDays) sumDays.textContent = formatNumber(totalDays);

  const sumDateSpecial = $('#sumDateSpecial');
  if (sumDateSpecial) sumDateSpecial.textContent = '27/02/2022';

  // Calculate seasons
  const seasonNames = ['Verão', 'Outono', 'Inverno', 'Primavera'];
  const startSeason = getSeason(START_DATE);
  const totalMonths = years * 12 + months;
  const seasonsCount = Math.floor(totalMonths / 3);
  const sumSeasons = $('#sumSeasons');
  if (sumSeasons) sumSeasons.textContent = seasonsCount + (seasonsCount === 1 ? ' estação' : ' estações');

  // Hours for retrospectiva
  const totalHoursAll = totalDays * 24 + hours;
  const hoursBig = $('#hoursBig');
  if (hoursBig) hoursBig.textContent = formatNumber(totalHoursAll);

  // Summary days
  if (sumDays) sumDays.textContent = formatNumber(totalDays);
}

function getSeason(date) {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return 0; // Verão (Brazil)
  if (m >= 5 && m <= 7) return 1; // Outono
  if (m >= 8 && m <= 10) return 2; // Inverno
  return 3; // Primavera
}

function formatNumber(n) {
  return n.toLocaleString('pt-BR');
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ========== MESSAGE - TELA SEPARADA ========== */
const messagePreview = $('#messagePreview');
const messageFullscreen = $('#messageFullscreen');
const btnShowMessage = $('#btnShowMessage');
const btnCloseMessage = $('#btnCloseMessage');
let savedScrollY = 0;

btnShowMessage.addEventListener('click', openMessage);
messagePreview.addEventListener('click', openMessage);

function openMessage() {
  savedScrollY = window.scrollY;
  mainContent.style.display = 'none';
  messageFullscreen.style.display = 'block';
  messageFullscreen.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

btnCloseMessage.addEventListener('click', () => {
  messageFullscreen.style.display = 'none';
  mainContent.style.display = 'block';
  document.body.style.overflow = '';
  window.scrollTo(0, savedScrollY);
});

/* ========== MESSAGE FULLSCREEN PLAYER MIRROR ========== */
const msgBtnPlay = $('#msgBtnPlay');
const msgProgressBar = $('#msgProgressBar');
const msgProgressFill = $('#msgProgressFill');
const msgProgressThumb = $('#msgProgressThumb');
const msgTimeCurrent = $('#msgTimeCurrent');
const msgTimeTotal = $('#msgTimeTotal');

msgBtnPlay.addEventListener('click', togglePlay);

// Seek on msg progress bar
let msgIsDragging = false;
msgProgressBar.addEventListener('mousedown', startMsgSeek);
msgProgressBar.addEventListener('touchstart', startMsgSeek, { passive: true });
document.addEventListener('mousemove', moveMsgSeek);
document.addEventListener('touchmove', moveMsgSeek, { passive: true });
document.addEventListener('mouseup', endMsgSeek);
document.addEventListener('touchend', endMsgSeek);

function startMsgSeek(e) {
  msgIsDragging = true;
  updateMsgSeek(e);
}
function moveMsgSeek(e) {
  if (msgIsDragging) updateMsgSeek(e);
}
function endMsgSeek() {
  msgIsDragging = false;
}
function updateMsgSeek(e) {
  if (!audio || !audio.duration) return;
  const rect = msgProgressBar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.max(0, Math.min(1, pct));
  audio.currentTime = pct * audio.duration;
  progressFill.style.width = (pct * 100) + '%';
  progressThumb.style.left = (pct * 100) + '%';
  timeCurrent.textContent = formatTime(audio.currentTime);
  msgProgressFill.style.width = (pct * 100) + '%';
  msgProgressThumb.style.left = (pct * 100) + '%';
  msgTimeCurrent.textContent = formatTime(audio.currentTime);
}

function openMessage() {
  savedScrollY = window.scrollY;
  mainContent.style.display = 'none';
  messageFullscreen.style.display = 'block';
  messageFullscreen.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  if (msgBtnPlay) {
    msgBtnPlay.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M8 5v14l11-7z"/></svg>';
  }
  if (audio && audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    msgProgressFill.style.width = pct + '%';
    msgProgressThumb.style.left = pct + '%';
    msgTimeCurrent.textContent = formatTime(audio.currentTime);
    msgTimeTotal.textContent = formatTime(audio.duration);
  }
}

/* ========== RETROSPECTIVA ========== */
const retroOverlay = $('#retroOverlay');
const btnOpenRetro = $('#btnOpenRetro');
const btnCloseRetro = $('#btnCloseRetro');
const btnCloseRetroX = $('#btnCloseRetroX');
const retroScreen = $('#retroScreen');

btnOpenRetro.addEventListener('click', () => {
  // Reset all pages to first
  $$('.retro-page').forEach(p => p.classList.remove('active'));
  const firstPage = $('#retroPage1');
  if (firstPage) firstPage.classList.add('active');

  // Reset hours screen
  hoursAnimDone = false;
  const hr = $('#hoursResult');
  if (hr) hr.classList.remove('show');
  const hs = $('#hoursScroll');
  if (hs) hs.innerHTML = '';
  const nav1 = $('#navPage1');
  if (nav1) nav1.classList.add('hidden');

  // Reset cards
  cardIndex = 0;
  const nav3 = $('#navPage3');
  if (nav3) nav3.classList.add('hidden');
  // updateCards will be called after DOM is ready

  retroOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Stop any previous constellation animation
  if (constellationRAF) {
    cancelAnimationFrame(constellationRAF);
    constellationRAF = null;
  }
  const prevCanvas = $('#constellationCanvas');
  if (prevCanvas && prevCanvas._stopConstellation) prevCanvas._stopConstellation();

  constellationInterval = null;
  // Clean up previous confetti
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
  const confettiContainer = $('#confettiContainer');
  if (confettiContainer) confettiContainer.innerHTML = '';
  if (hoursConfettiInterval) {
    clearInterval(hoursConfettiInterval);
    hoursConfettiInterval = null;
  }
  const hoursConfetti = $('#hoursConfetti');
  if (hoursConfetti) hoursConfetti.innerHTML = '';

  setTimeout(() => {
    document.querySelectorAll('.hours-scroll-item, .star').forEach(el => el.remove());
    startHoursAnimation();
    initConstellation();
    initConfetti();
    createStars();
    if (typeof updateCards === 'function') updateCards();
  }, 300);
});

function closeRetro() {
  retroOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // Hide navs that use overlay
  const nav1 = $('#navPage1');
  if (nav1) nav1.classList.add('hidden');
  const nav3 = $('#navPage3');
  if (nav3) nav3.classList.add('hidden');
  // Stop constellation RAF
  if (constellationRAF) {
    cancelAnimationFrame(constellationRAF);
    constellationRAF = null;
  }
  const cvs = $('#constellationCanvas');
  if (cvs && cvs._stopConstellation) cvs._stopConstellation();
  // Stop confetti
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
  const confettiContainer = $('#confettiContainer');
  if (confettiContainer) confettiContainer.innerHTML = '';
  if (hoursConfettiInterval) {
    clearInterval(hoursConfettiInterval);
    hoursConfettiInterval = null;
  }
  const hoursConfetti = $('#hoursConfetti');
  if (hoursConfetti) hoursConfetti.innerHTML = '';
}

btnCloseRetro.addEventListener('click', closeRetro);
btnCloseRetroX.addEventListener('click', closeRetro);

// Page navigation
$$('.btn-next-session').forEach(btn => {
  btn.addEventListener('click', () => {
    const nextId = btn.dataset.next;
    const current = btn.closest('.retro-page');
    const next = $('#' + nextId);
    if (next) {
      current.classList.remove('active');
      next.classList.add('active');
      next.scrollTop = 0;
    }
  });
});

/* ========== HOURS ANIMATION ========== */
let hoursAnimDone = false;

function startHoursAnimation() {
  if (hoursAnimDone) return;
  hoursAnimDone = true;

  const scroll = $('#hoursScroll');
  const result = $('#hoursResult');
  const hoursBig = $('#hoursBig');
  const totalHours = parseInt(hoursBig.textContent.replace(/\D/g, '')) || 0;

  const colors = [
    { bg: '#1DB954', text: '#000' },
    { bg: '#E13300', text: '#fff' },
    { bg: '#FFD700', text: '#000' },
    { bg: '#FF69B4', text: '#000' },
    { bg: '#00BFFF', text: '#000' },
    { bg: '#9400D3', text: '#fff' },
    { bg: '#FF4500', text: '#fff' },
    { bg: '#00FF7F', text: '#000' },
    { bg: '#FF1493', text: '#fff' },
    { bg: '#FFA500', text: '#000' },
    { bg: '#7B68EE', text: '#fff' },
    { bg: '#00FA9A', text: '#000' },
    { bg: '#DC143C', text: '#fff' },
    { bg: '#F0E68C', text: '#000' },
    { bg: '#00CED1', text: '#000' },
    { bg: '#FF6347', text: '#fff' },
  ];

  const inner = document.createElement('div');
  inner.className = 'hours-scroll-inner';

  const count = 15;
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'hours-scroll-item';
    item.textContent = formatNumber(totalHours);
    const c = colors[i % colors.length];
    item.style.background = c.bg;
    item.style.color = c.text;
    inner.appendChild(item);
  }

  scroll.innerHTML = '';
  scroll.appendChild(inner);

  setTimeout(() => {
    result.classList.add('show');
    const nav1 = $('#navPage1');
    if (nav1) nav1.classList.remove('hidden');
    triggerHoursConfetti();
  }, 7000);
}

/* ========== CARDS CAROUSEL ========== */
const cardTrack = $('#cardTrack');
const cardTitle = $('#cardTitle');
const cardDesc = $('#cardDesc');
let cardIndex = 0;
let cardStartX = 0;
let cardIsDragging = false;
let cardTranslateX = 0;

const cardTexts = [
  { title: 'Nosso começo', desc: 'O dia em que tudo começou' },
  { title: 'Momentos especiais', desc: 'Cada instante guardado no coração' },
  { title: 'Aventuras juntos', desc: 'Histórias que só nós temos' },
  { title: 'Nosso amor', desc: 'Crescendo a cada dia' },
  { title: 'Para sempre', desc: 'E que venham muitos mais' },
];

if (cardTrack) {
  const cards = cardTrack.querySelectorAll('.photo-card');
  const totalCards = cards.length;

  function updateCardText() {
    if (cardTitle && cardDesc && cardTexts[cardIndex]) {
      cardTitle.classList.add('card-text-exit');
      cardDesc.classList.add('card-text-exit');
      setTimeout(() => {
        cardTitle.textContent = cardTexts[cardIndex].title;
        cardDesc.textContent = cardTexts[cardIndex].desc;
        cardTitle.classList.remove('card-text-exit');
        cardDesc.classList.remove('card-text-exit');
      }, 200);
    }
  }

  function updateCards() {
    cards.forEach((card, i) => {
      const dist = i - cardIndex;
      const isActive = dist === 0;
      const absDist = Math.abs(dist);

      card.style.zIndex = isActive ? 10 : 10 - absDist;
      card.style.transform = isActive
        ? 'scale(1) translateY(0) rotate(0deg)'
        : `scale(0.9) translateX(${dist * 10}px) translateY(${absDist * 6}px) rotate(${dist * 1.5}deg)`;
      card.style.opacity = isActive ? 1 : 0.5 - absDist * 0.12;
      card.classList.toggle('active-card', isActive);
      card.style.pointerEvents = isActive ? 'auto' : 'none';
    });
    updateCardText();
    const nav3 = $('#navPage3');
    if (nav3) {
      nav3.classList.toggle('hidden', cardIndex < totalCards - 1);
    }
  }

  cardTrack.addEventListener('touchstart', (e) => {
    cardIsDragging = true;
    cardStartX = e.touches[0].clientX;
  }, { passive: true });

  cardTrack.addEventListener('touchmove', (e) => {
    if (!cardIsDragging) return;
  }, { passive: true });

  cardTrack.addEventListener('touchend', (e) => {
    cardIsDragging = false;
    const diff = e.changedTouches[0].clientX - cardStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0 && cardIndex < totalCards - 1) cardIndex++;
      else if (diff > 0 && cardIndex > 0) cardIndex--;
    }
    updateCards();
  }, { passive: true });

  updateCards();
}

/* ========== TIMELINE STARS ========== */
function createStars() {
  const starsBg = $('#starsBg');
  if (!starsBg || starsBg.querySelector('.star')) return;
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    star.style.animationDelay = Math.random() * 5 + 's';
    starsBg.appendChild(star);
  }
}

/* ========== CONSTELLATION ========== */
let constellationRAF = null;
let constellationInterval = null; // kept for reset compat

function initConstellation() {
  const canvas = $('#constellationCanvas');
  if (!canvas) return;

  // Cancel any previous animation frame
  if (constellationRAF) {
    cancelAnimationFrame(constellationRAF);
    constellationRAF = null;
  }

  const container = canvas.parentElement;

  // Wait for DOM layout so offsetWidth is correct
  requestAnimationFrame(() => {
    const size = Math.min(container.offsetWidth || 300, container.offsetHeight || 300);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // ---- STAR DEFINITIONS ----
    // Avoid placing stars in margins — keep within 8%-92% of canvas
    const margin = size * 0.08;
    const area = size - margin * 2;

    function rng(min, max) { return Math.random() * (max - min) + min; }

    const stars = [];
    const numStars = 70;
    for (let i = 0; i < numStars; i++) {
      const isBig = Math.random() < 0.18; // ~18% are bigger/brighter
      stars.push({
        x: margin + Math.random() * area,
        y: margin + Math.random() * area,
        r: isBig ? rng(2.2, 3.8) : rng(0.6, 2.0),
        baseAlpha: isBig ? rng(0.7, 1.0) : rng(0.3, 0.75),
        twinkleSpeed: rng(0.4, 1.6),
        twinklePhase: rng(0, Math.PI * 2),
        color: (() => {
          const r = Math.random();
          if (r < 0.7) return { r: 255, g: 255, b: 255 };        // white
          if (r < 0.82) return { r: 200, g: 220, b: 255 };       // cold blue
          if (r < 0.92) return { r: 255, g: 235, b: 200 };       // warm yellow
          return { r: 220, g: 200, b: 255 };                      // soft purple
        })(),
      });
    }

    // ---- CONSTELLATION DEFINITION ----
    // Groups of star indices that form connected lines
    // Carefully hand-placed to look like real simple constellations
    // We'll use 3 separate constellations spread across the canvas
    const constellations = [
      // Orion-ish (left side)
      [2, 8, 15, 22, 30, 38],
      // Big Dipper-ish (right/top area)
      [5, 12, 20, 28, 35],
      // Southern Cross-ish (bottom)
      [10, 18, 25, 33],
      // Small triangle accent
      [45, 52, 60, 45],
    ];

    // ---- ANIMATION STATE ----
    const DELAY_BEFORE_LINES = 1200;   // ms before lines start appearing
    const SEG_DURATION = 900;          // ms to draw each line segment
    let startTime = null;
    let running = true;

    // Precompute all segments in order
    const segments = [];
    constellations.forEach(group => {
      for (let i = 0; i < group.length - 1; i++) {
        const a = stars[group[i] % numStars];
        const b = stars[group[i + 1] % numStars];
        if (a && b) segments.push({ a, b });
      }
    });
    const totalSegDuration = segments.length * SEG_DURATION;

    function drawFrame(timestamp) {
      if (!running) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, size, size);

      const now = timestamp / 1000;

      // ---- DRAW STARS ----
      stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseAlpha * (0.55 + 0.45 * twinkle);
        const { r, g, b } = star.color;

        // Glow halo
        const glowR = star.r * 4.5;
        const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowR);
        grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.35})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Crosshair sparkle for bigger stars
        if (star.r > 2) {
          const sparkLen = star.r * 3.5 * (0.7 + 0.3 * twinkle);
          ctx.save();
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x - sparkLen, star.y);
          ctx.lineTo(star.x + sparkLen, star.y);
          ctx.moveTo(star.x, star.y - sparkLen);
          ctx.lineTo(star.x, star.y + sparkLen);
          ctx.stroke();
          ctx.restore();
        }
      });

      // ---- DRAW CONSTELLATION LINES (sequential) ----
      const linesElapsed = elapsed - DELAY_BEFORE_LINES;
      if (linesElapsed > 0) {
        segments.forEach((seg, idx) => {
          const segStart = idx * SEG_DURATION;
          const segEnd = segStart + SEG_DURATION;
          if (linesElapsed < segStart) return; // not yet

          // Progress of this specific segment [0..1]
          let segProgress = Math.min(1, (linesElapsed - segStart) / SEG_DURATION);
          // Eased
          segProgress = segProgress < 0.5
            ? 2 * segProgress * segProgress
            : -1 + (4 - 2 * segProgress) * segProgress;

          // Fade-in alpha: full opacity once drawn, slight glow
          const lineAlpha = Math.min(0.55, 0.3 + segProgress * 0.25);

          // Draw partial line from a → b
          const tx = seg.a.x + (seg.b.x - seg.a.x) * segProgress;
          const ty = seg.a.y + (seg.b.y - seg.a.y) * segProgress;

          ctx.save();
          ctx.globalAlpha = lineAlpha;
          ctx.strokeStyle = 'rgba(180, 210, 255, 1)';
          ctx.lineWidth = 0.9;
          ctx.setLineDash([3, 5]);
          ctx.lineDashOffset = -elapsed * 0.02; // subtle drift
          ctx.beginPath();
          ctx.moveTo(seg.a.x, seg.a.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // Small dot at the leading edge
          if (segProgress < 1) {
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 225, 255, 0.9)';
            ctx.fill();
          }
          ctx.restore();
        });
      }

      constellationRAF = requestAnimationFrame(drawFrame);
    }

    constellationRAF = requestAnimationFrame(drawFrame);

    // Store a stop function
    canvas._stopConstellation = () => {
      running = false;
      if (constellationRAF) {
        cancelAnimationFrame(constellationRAF);
        constellationRAF = null;
      }
    };
  });
}

/* ========== CONFETTI ========== */
let confettiInterval = null;

function initConfetti() {
  const container = $('#confettiContainer');
  if (!container) return;
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
  container.innerHTML = '';

  const colors = ['#1DB954', '#FFD700', '#FF69B4', '#00BFFF', '#FF4500', '#9400D3', '#FF1493', '#00FF7F'];

  function createConfetti() {
    for (let i = 0; i < 3; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.background = color;
      piece.style.left = Math.random() * 100 + '%';
      piece.style.width = (Math.random() * 6 + 4) + 'px';
      piece.style.height = (Math.random() * 6 + 4) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
      piece.style.animationDelay = '0s';
      container.appendChild(piece);

      setTimeout(() => piece.remove(), 5000);
    }
  }

  confettiInterval = setInterval(createConfetti, 200);
  for (let i = 0; i < 10; i++) setTimeout(createConfetti, i * 100);

  // Para o confete depois de 5 segundos
  setTimeout(() => {
    if (confettiInterval) {
      clearInterval(confettiInterval);
      confettiInterval = null;
    }
  }, 5000);
}

let hoursConfettiInterval = null;

function triggerHoursConfetti() {
  const container = document.getElementById('hoursConfetti');
  if (!container) return;
  if (hoursConfettiInterval) {
    clearInterval(hoursConfettiInterval);
    hoursConfettiInterval = null;
  }
  container.innerHTML = '';

  const colors = ['#1DB954', '#FFD700', '#FF69B4', '#00BFFF', '#FF4500', '#9400D3', '#FF1493', '#00FF7F'];

  function createPiece() {
    for (let i = 0; i < 3; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = Math.random() * 100 + '%';
      piece.style.width = (Math.random() * 6 + 4) + 'px';
      piece.style.height = (Math.random() * 6 + 4) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  }

  hoursConfettiInterval = setInterval(createPiece, 200);
  for (let i = 0; i < 10; i++) setTimeout(createPiece, i * 100);

  setTimeout(() => {
    if (hoursConfettiInterval) {
      clearInterval(hoursConfettiInterval);
      hoursConfettiInterval = null;
    }
  }, 5000);
}

// Init countdown
updateCountdown();
setInterval(updateCountdown, 1000);
