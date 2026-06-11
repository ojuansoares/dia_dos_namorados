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
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      timeCurrent.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>';
    albumArt.classList.remove('playing');
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
  } else {
    audio.play().catch(() => {});
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    albumArt.classList.add('playing');
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
  document.body.style.overflow = 'hidden';
}

btnCloseMessage.addEventListener('click', () => {
  messageFullscreen.style.display = 'none';
  mainContent.style.display = 'block';
  document.body.style.overflow = '';
  window.scrollTo(0, savedScrollY);
});

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

  retroOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset animations for re-entry
  hoursAnimDone = false;
  constellationInterval = null;
  setTimeout(() => {
    document.querySelectorAll('.hours-scroll-item, .star').forEach(el => el.remove());
    startHoursAnimation();
    initConstellation();
    initConfetti();
    createStars();
  }, 300);
});

function closeRetro() {
  retroOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // Stop confetti
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
  const confettiContainer = $('#confettiContainer');
  if (confettiContainer) confettiContainer.innerHTML = '';
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

  const colors = ['#1DB954', '#E13300', '#FFD700', '#FF69B4', '#00BFFF', '#9400D3', '#FF4500', '#00FF7F', '#FF1493', '#FFD700'];
  const bgColors = ['rgba(29,185,84,0.12)', 'rgba(225,51,0,0.12)', 'rgba(255,215,0,0.12)', 'rgba(255,105,180,0.12)', 'rgba(0,191,255,0.12)', 'rgba(148,0,211,0.12)', 'rgba(255,69,0,0.12)', 'rgba(0,255,127,0.12)', 'rgba(255,20,147,0.12)', 'rgba(255,215,0,0.12)'];
  const symbols = ['💚', '✨', '🌟', '💫', '⭐', '🔥', '💖', '🎵', '✨', '💚'];

  for (let i = 0; i < 10; i++) {
    const item = document.createElement('div');
    item.className = 'hours-scroll-item';
    const num = totalHours;
    item.innerHTML = `<span style="display:block;font-size:16px;margin-bottom:8px">${symbols[i % symbols.length]}</span>${formatNumber(num)}`;
    item.style.color = colors[i % colors.length];
    item.style.textShadow = `0 0 30px ${colors[i % colors.length]}`;
    item.style.background = bgColors[i % bgColors.length];
    item.style.padding = '16px 40px';
    item.style.borderRadius = '16px';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'center';
    item.style.fontSize = '64px';
    item.style.fontWeight = '900';
    item.style.animationDelay = (i * 0.6) + 's';
    scroll.appendChild(item);
  }

  setTimeout(() => {
    result.classList.add('show');
  }, 7000);
}

/* ========== CARDS CAROUSEL ========== */
const cardTrack = $('#cardTrack');
let cardIndex = 0;
let cardStartX = 0;
let cardIsDragging = false;
let cardTranslateX = 0;

if (cardTrack) {
  const cards = cardTrack.querySelectorAll('.photo-card');
  const totalCards = cards.length;

  function updateCards() {
    const cardWidth = cards[0]?.offsetWidth || 260;
    const gap = 12;
    cardTrack.style.transform = `translateX(${-cardIndex * (cardWidth + gap)}px)`;
    cards.forEach((card, i) => {
      card.classList.toggle('active-card', i === cardIndex);
    });
  }

  cardTrack.addEventListener('touchstart', (e) => {
    cardStartX = e.touches[0].clientX;
    cardIsDragging = true;
    const style = window.getComputedStyle(cardTrack);
    const match = style.transform.match(/translateX\(([-\d.]+)px\)/);
    cardTranslateX = match ? parseFloat(match[1]) : 0;
  }, { passive: true });

  cardTrack.addEventListener('touchmove', (e) => {
    if (!cardIsDragging) return;
    e.preventDefault();
    const diff = e.touches[0].clientX - cardStartX;
    const cardWidth = cards[0]?.offsetWidth || 260;
    const gap = 12;
    const maxTranslate = -(totalCards - 1) * (cardWidth + gap);
    let newTranslate = cardTranslateX + diff;
    newTranslate = Math.max(maxTranslate, Math.min(0, newTranslate));
    cardTrack.style.transform = `translateX(${newTranslate}px)`;
  }, { passive: false });

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
let constellationInterval = null;

function initConstellation() {
  const canvas = $('#constellationCanvas');
  if (!canvas) return;
  if (constellationInterval) {
    clearInterval(constellationInterval);
    constellationInterval = null;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const container = canvas.parentElement;
  const size = container.offsetWidth || 280;
  canvas.width = size;
  canvas.height = size;

  const stars = [];
  const numStars = 45;
  const constellations = [
    [0, 1, 2, 3],
    [4, 5, 6],
    [7, 8, 9, 10],
    [11, 12, 13],
    [14, 15, 16, 17],
    [18, 19, 20],
    [21, 22, 23],
    [24, 25, 26, 27],
  ];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw constellation lines
    ctx.strokeStyle = 'rgba(29, 185, 84, 0.25)';
    ctx.lineWidth = 1;
    constellations.forEach(group => {
      for (let i = 0; i < group.length - 1; i++) {
        const a = stars[group[i]];
        const b = stars[group[i + 1]];
        if (a && b) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    });

    // Draw connecting lines between close stars
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw stars
    const time = Date.now() / 1000;
    stars.forEach(star => {
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(time * star.speed + star.phase));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();

      // Glow
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 5);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }

  constellationInterval = setInterval(drawStars, 50);
  drawStars();
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

// Init countdown
updateCountdown();
setInterval(updateCountdown, 1000);
