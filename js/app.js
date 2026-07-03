(() => {
  'use strict';

  const CONFIG = {
    totalChapters: 8,
    puzzleSize: 3,
    storageKey: 'proyectoAurora.chapter',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    introLines: [
      'Hay personas que pasan por nuestra vida...',
      'y hay personas que nos dan la vida...',
      'Esta sorpresa fue hecha con todo mi corazón...',
      'Para la mujer más especial de mi vida.'
    ],
    letter: 'Ma, hoy quiero regalarte algo distinto, algo hecho con tiempo, con cariño y con todo mi corazón.\n\nGracias por darme la vida, por cuidarme, por enseñarme a levantarme y por estar presente incluso cuando las palabras no alcanzaban. Gracias por cada sacrificio silencioso, por cada consejo, por cada abrazo y por ese amor que siempre fue refugio para nuestra familia.\n\nEsta pequeña experiencia no alcanza para devolver todo lo que hiciste, pero sí quiere recordarte algo: sos una mujer inmensa, fuerte, especial y profundamente amada. Hoy celebro tu vida, porque tu vida hizo posible la mía. Feliz cumpleaños, Señora. Te amo muchísimo.',
    finalLines: [
      'Gracias por darme la vida.',
      'Gracias por enseñarme a levantarme.',
      'Gracias por ser mi mamá.',
      'Siempre serás la mujer más especial de mi vida.',
      'Feliz cumpleaños.',
      'Te amo muchísimo.'
    ],
    hiddenMessages: [
      'Gracias por cada abrazo.',
      'Siempre estuviste para mí.',
      'Te quiero muchísimo.',
      'Gracias por enseñarme a levantarme.',
      'Tu amor siempre fue mi refugio.'
    ],
    galleryFallback: [
          {
                "src": "imagenes/galeria/foto-1.jpg",
                "titulo": "Un recuerdo especial",
                "mensaje": "Gracias por cada momento compartido."
          },
          {
                "src": "imagenes/galeria/foto-2.jpg",
                "titulo": "Familia",
                "mensaje": "Nuestra historia está llena de amor."
          },
          {
                "src": "imagenes/galeria/foto-3.jpg",
                "titulo": "Sonrisas que abrazan",
                "mensaje": "Hay momentos que siguen iluminando el corazón."
          },
          {
                "src": "imagenes/galeria/foto-4.jpg",
                "titulo": "Siempre juntos",
                "mensaje": "Lo más valioso siempre fue estar cerca."
          },
          {
                "src": "imagenes/galeria/foto-5.jpg",
                "titulo": "Un abrazo para Ma",
                "mensaje": "Hay abrazos que dicen más que mil palabras."
          },
          {
                "src": "imagenes/galeria/foto-6.jpg",
                "titulo": "Ternura de familia",
                "mensaje": "Cada recuerdo guarda un pedacito de amor."
          },
          {
                "src": "imagenes/galeria/foto-7.jpg",
                "titulo": "Momentos únicos",
                "mensaje": "La vida se vuelve más bonita cuando la compartimos."
          },
          {
                "src": "imagenes/galeria/foto-8.jpg",
                "titulo": "Nuestro tesoro",
                "mensaje": "La familia es el regalo que siempre vuelve al corazón."
          },
          {
                "src": "imagenes/galeria/foto-9.jpg",
                "titulo": "Feliz cumpleaños",
                "mensaje": "Que este día quede guardado como una luz hermosa."
          }
    ],
    giftsFallback: [
          {
                "titulo": "Primer regalo",
                "tipo": "mensaje",
                "contenido": "Gracias por tu amor incondicional, por cuidar de todos y por estar incluso cuando nadie lo veía.",
                "imagen": "imagenes/galeria/foto-5.jpg"
          },
          {
                "titulo": "Segundo regalo",
                "tipo": "recuerdo",
                "contenido": "Este recuerdo vive para siempre en mi corazón, porque habla de familia, ternura y unión.",
                "imagen": "imagenes/galeria/foto-6.jpg"
          },
          {
                "titulo": "Tercer regalo",
                "tipo": "promesa",
                "contenido": "Prometo valorar cada consejo, cada sacrificio y cada enseñanza que me regalaste.",
                "imagen": "imagenes/galeria/foto-7.jpg"
          },
          {
                "titulo": "Cuarto regalo",
                "tipo": "abrazo",
                "contenido": "Este abrazo digital guarda todo lo que a veces no sé decir con palabras.",
                "imagen": "imagenes/galeria/foto-8.jpg"
          },
          {
                "titulo": "Quinto regalo",
                "tipo": "amor",
                "contenido": "Sos y siempre vas a ser la mujer más especial de mi vida. Feliz cumpleaños, Ma.",
                "imagen": "imagenes/galeria/foto-9.jpg"
          }
    ]
  };

  const state = {
    currentChapter: 0,
    gallery: [],
    gifts: [],
    galleryIndex: 0,
    puzzlePieces: [],
    selectedPiece: null,
    draggedPiece: null,
    candlesOut: 0,
    birthdayAudio: null,
    instrumentalAudio: null,
    currentAudio: null,
    audioReady: false,
    finalPlayed: false,
    particles: [],
    rafId: null,
    micStream: null,
    micContext: null,
    micAnimation: null
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    setupAudio();
    setupParticles();
    createAmbientFloaters();
    bindGlobalEvents();

    state.gallery = await readJSON('data/imagenes.json', CONFIG.galleryFallback);
    state.gifts = await readJSON('data/regalos.json', CONFIG.giftsFallback);

    renderGallery();
    renderGifts();
    buildPuzzle();
    runIntro();

    const saved = Number(localStorage.getItem(CONFIG.storageKey));
    if (Number.isInteger(saved) && saved > 0 && saved < CONFIG.totalChapters) {
      showToast('Tu progreso estaba guardado. Podés reiniciar la experiencia al final.');
      goToChapter(saved, { silent: true, fromStorage: true });
    }
  }

  async function readJSON(path, fallback) {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
      const data = await response.json();
      return Array.isArray(data) && data.length ? data : fallback;
    } catch (error) {
      console.info(`[AURORA] Usando datos internos porque ${path} no está disponible por fetch.`, error);
      return fallback;
    }
  }

  function setupAudio() {
    state.birthdayAudio = createAudio('audio/cumpleanos.mp3');
    state.instrumentalAudio = createAudio('audio/instrumental.mp3');
    state.currentAudio = state.birthdayAudio;

    const audioToggle = $('#audioToggle');
    const volumeRange = $('#volumeRange');

    audioToggle.addEventListener('click', () => {
      unlockAudio();
      toggleAudio();
    });

    volumeRange.addEventListener('input', () => {
      [state.birthdayAudio, state.instrumentalAudio].forEach((audio) => {
        audio.volume = Number(volumeRange.value);
      });
    });
  }

  function createAudio(src) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = Number($('#volumeRange')?.value || 0.55);
    audio.addEventListener('error', () => {
      console.info(`[AURORA] Audio opcional no disponible: ${src}`);
    });
    return audio;
  }

  function unlockAudio() {
    state.audioReady = true;
  }

  function toggleAudio() {
    if (!state.currentAudio) return;
    if (state.currentAudio.paused) {
      playAudio(state.currentAudio);
    } else {
      pauseAudio(state.currentAudio);
    }
  }

  function playAudio(audio) {
    if (!audio || !state.audioReady) return;
    audio.play()
      .then(() => $('#audioToggle')?.classList.add('is-playing'))
      .catch(() => {
        $('#audioToggle')?.classList.remove('is-playing');
        showToast('El navegador bloqueó la música automática. Podés activarla con el botón ♫.');
      });
  }

  function pauseAudio(audio) {
    if (!audio) return;
    audio.pause();
    $('#audioToggle')?.classList.remove('is-playing');
  }

  function switchToInstrumental() {
    const wasPlaying = state.currentAudio && !state.currentAudio.paused;
    pauseAudio(state.birthdayAudio);
    state.currentAudio = state.instrumentalAudio;
    if (wasPlaying || state.audioReady) playAudio(state.instrumentalAudio);
  }

  function bindGlobalEvents() {
    document.addEventListener('pointerdown', unlockAudio, { once: true });

    $('#startGiftButton').addEventListener('click', () => goToChapter(1));
    $('#giftBox').addEventListener('click', openGift);
    $('#giftNext').addEventListener('click', () => goToChapter(2));

    $$('[data-next]').forEach((button) => {
      button.addEventListener('click', () => goToChapter(state.currentChapter + 1));
    });

    $$('.secret-chip').forEach((chip) => {
      chip.addEventListener('click', () => revealSecret(chip.dataset.secret));
    });

    $('#galleryPrev').addEventListener('click', () => moveGallery(-1));
    $('#galleryNext').addEventListener('click', () => moveGallery(1));
    $('#galleryTrack').addEventListener('keydown', handleGalleryKeys);
    setupSwipe($('#galleryTrack'), (direction) => moveGallery(direction === 'left' ? 1 : -1));

    $('#shufflePuzzle').addEventListener('click', () => buildPuzzle(true));
    $('#hintPuzzle').addEventListener('click', showPuzzleHint);
    $('#puzzleNext').addEventListener('click', () => goToChapter(6));

    $('#micButton').addEventListener('click', startMicBlowDetection);
    $('#blowButton').addEventListener('click', blowCandle);
    $('#cakeNext').addEventListener('click', () => goToChapter(7));

    $('#restartExperience').addEventListener('click', restartExperience);
    $('#replayFinal').addEventListener('click', playFinalMessages);

    window.addEventListener('resize', () => {
      resizeCanvas();
      renderGallery();
    });
  }

  function goToChapter(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(CONFIG.totalChapters - 1, index));
    state.currentChapter = nextIndex;

    $$('.chapter').forEach((chapter) => {
      const isActive = Number(chapter.dataset.chapter) === nextIndex;
      chapter.classList.toggle('chapter--active', isActive);
      chapter.setAttribute('aria-hidden', String(!isActive));
    });

    $('#app').dataset.currentChapter = String(nextIndex);
    if (!options.silent) localStorage.setItem(CONFIG.storageKey, String(nextIndex));

    if (nextIndex === 2 && !$('#typedLetter').dataset.done) typeLetter();
    if (nextIndex === 7) {
      switchToInstrumental();
      playFinalMessages();
    }

    if (!options.fromStorage) burst({ emojis: ['✦', '✨', '🌸'], count: 10 });
    $('#main').focus({ preventScroll: true });
  }

  function runIntro() {
    const container = $('#introLines');
    const button = $('#startGiftButton');

    if (!container || !button) return;

    const lines = Array.isArray(CONFIG.introLines) && CONFIG.introLines.length
      ? CONFIG.introLines
      : ['Esta sorpresa fue hecha con todo mi corazón.'];

    container.innerHTML = '';
    button.classList.remove('hidden');
    let index = 0;

    // Seguridad: el botón queda visible desde el inicio para que nunca se quede bloqueado.

    const showNext = () => {
      container.innerHTML = '';
      const line = document.createElement('div');
      line.className = 'intro-line';
      line.textContent = lines[index];
      container.appendChild(line);
      index += 1;

      if (index < lines.length) {
        setTimeout(showNext, CONFIG.reducedMotion ? 250 : 2400);
      } else {
        setTimeout(() => button.classList.remove('hidden'), CONFIG.reducedMotion ? 250 : 1700);
      }
    };

    showNext();
  }

  function openGift() {
    const giftBox = $('#giftBox');
    const reveal = $('#giftReveal');
    const next = $('#giftNext');

    if (giftBox.classList.contains('is-open')) return;

    unlockAudio();
    playAudio(state.birthdayAudio);
    giftBox.classList.add('is-open');
    giftBox.setAttribute('aria-label', 'Caja de regalo abierta');
    reveal.textContent = 'Feliz cumpleaños, Ma. Esta sorpresa es para vos.';
    next.classList.remove('hidden');
    burst({ emojis: ['🎈', '🦋', '✨', '🌸', '💛'], count: 34 });
  }

  function typeLetter() {
    const target = $('#typedLetter');
    const cursor = $('#typingCursor');
    target.textContent = '';
    target.dataset.done = 'true';

    if (CONFIG.reducedMotion) {
      target.textContent = CONFIG.letter;
      cursor.classList.add('hidden');
      return;
    }

    let i = 0;
    const speed = 22;
    const write = () => {
      target.textContent += CONFIG.letter.charAt(i);
      i += 1;
      if (i < CONFIG.letter.length) {
        const char = CONFIG.letter.charAt(i);
        setTimeout(write, char === '\n' ? 120 : speed);
      } else {
        cursor.classList.add('hidden');
      }
    };
    write();
  }

  function revealSecret(message) {
    $('#secretMessage').textContent = message;
    showToast(message);
    burst({ emojis: ['✨', '💛', '🌷'], count: 12 });
  }

  function renderGallery() {
    const track = $('#galleryTrack');
    track.innerHTML = '';
    const total = state.gallery.length;

    state.gallery.forEach((item, index) => {
      const relative = getCircularDistance(index, state.galleryIndex, total);
      const abs = Math.abs(relative);
      const card = document.createElement('article');
      card.className = 'gallery-card';
      card.style.setProperty('--offset-x', `${relative * 47}%`);
      card.style.setProperty('--scale', `${Math.max(0.72, 1 - abs * 0.12)}`);
      card.style.setProperty('--rotate', `${relative * -10}deg`);
      card.style.setProperty('--opacity', abs > 2 ? '0' : String(Math.max(0.18, 1 - abs * 0.28)));
      card.style.setProperty('--z', String(10 - abs));
      card.style.setProperty('--events', abs === 0 ? 'auto' : 'none');
      card.setAttribute('aria-hidden', String(abs !== 0));

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.titulo || 'Recuerdo familiar';
      img.loading = index === state.galleryIndex ? 'eager' : 'lazy';
      img.addEventListener('error', () => replaceWithPlaceholder(img, item.titulo || 'Recuerdo'));

      const overlay = document.createElement('div');
      overlay.className = 'gallery-card__overlay';
      overlay.innerHTML = `<strong>${escapeHTML(item.titulo || 'Recuerdo')}</strong><span>${escapeHTML(item.mensaje || 'Un momento guardado con cariño.')}</span>`;

      card.append(img, overlay);
      track.appendChild(card);
    });

    updateGalleryCaption();
  }

  function moveGallery(direction) {
    state.galleryIndex = (state.galleryIndex + direction + state.gallery.length) % state.gallery.length;
    renderGallery();
  }

  function updateGalleryCaption() {
    const item = state.gallery[state.galleryIndex];
    $('#galleryCaption').innerHTML = `<strong>${escapeHTML(item?.titulo || 'Recuerdo especial')}</strong><br>${escapeHTML(item?.mensaje || 'Gracias por cada momento compartido.')}`;
  }

  function handleGalleryKeys(event) {
    if (event.key === 'ArrowRight') moveGallery(1);
    if (event.key === 'ArrowLeft') moveGallery(-1);
  }

  function setupSwipe(element, callback) {
    let startX = 0;
    let startY = 0;

    element.addEventListener('touchstart', (event) => {
      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        callback(dx < 0 ? 'left' : 'right');
      }
    }, { passive: true });
  }

  function getCircularDistance(index, active, total) {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }

  function renderGifts() {
    const grid = $('#surpriseGrid');
    grid.innerHTML = '';

    state.gifts.slice(0, 5).forEach((gift, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'surprise-card';
      card.setAttribute('aria-label', `Abrir ${gift.titulo || `regalo ${index + 1}`}`);
      card.innerHTML = `
        <span class="surprise-card__front">
          <span class="surprise-card__icon" aria-hidden="true">🎁</span>
          <strong>${escapeHTML(gift.titulo || `Regalo ${index + 1}`)}</strong>
          <small>Tocar para revelar</small>
        </span>
        <span class="surprise-card__inside">
          <img src="${escapeHTML(gift.imagen || 'imagenes/galeria/foto-1.jpg')}" alt="${escapeHTML(gift.titulo || 'Regalo abierto')}" loading="lazy" />
          <h3>${escapeHTML(gift.titulo || 'Regalo')}</h3>
          <p>${escapeHTML(gift.contenido || 'Un detalle guardado con mucho amor.')}</p>
        </span>
      `;
      $('img', card).addEventListener('error', (event) => replaceWithPlaceholder(event.currentTarget, gift.titulo || 'Regalo'));
      card.addEventListener('click', () => {
        if (!card.classList.contains('is-open')) {
          card.classList.add('is-open');
          card.setAttribute('aria-label', `${gift.titulo || 'Regalo'} abierto`);
          burst({ emojis: ['✨', '💛', '🌸'], count: 10 });
        }
      });
      grid.appendChild(card);
    });
  }

  function buildPuzzle(forceShuffle = false) {
    const board = $('#puzzleBoard');
    const size = CONFIG.puzzleSize;
    const total = size * size;
    board.style.setProperty('--size', size);
    board.innerHTML = '';
    board.classList.remove('is-complete');
    $('#puzzleNext').classList.add('hidden');
    $('#puzzleStatus').textContent = forceShuffle ? 'Rompecabezas reiniciado. Volvé a ordenar las piezas.' : 'Ordená las piezas para completar la imagen.';
    state.selectedPiece = null;

    state.puzzlePieces = Array.from({ length: total }, (_, position) => ({ position, correct: position }));
    shuffleArray(state.puzzlePieces);
    if (isSolved()) shuffleArray(state.puzzlePieces);

    state.puzzlePieces.forEach((piece, displayIndex) => {
      board.appendChild(createPuzzlePiece(piece, displayIndex));
    });
  }

  function createPuzzlePiece(piece, displayIndex) {
    const size = CONFIG.puzzleSize;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'puzzle-piece';
    button.draggable = true;
    button.dataset.correct = piece.correct;
    button.dataset.display = displayIndex;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `Pieza ${displayIndex + 1}`);

    const col = piece.correct % size;
    const row = Math.floor(piece.correct / size);
    button.style.backgroundImage = `url('imagenes/puzzle/familia.jpg'), linear-gradient(135deg, #fff0c9, #f5aec2)`;
    button.style.backgroundPosition = `${size === 1 ? 0 : (col / (size - 1)) * 100}% ${size === 1 ? 0 : (row / (size - 1)) * 100}%`;

    button.addEventListener('click', () => selectOrSwap(button));
    button.addEventListener('dragstart', () => {
      state.draggedPiece = button;
      button.classList.add('is-selected');
    });
    button.addEventListener('dragend', () => {
      button.classList.remove('is-selected');
      state.draggedPiece = null;
    });
    button.addEventListener('dragover', (event) => event.preventDefault());
    button.addEventListener('drop', (event) => {
      event.preventDefault();
      if (state.draggedPiece && state.draggedPiece !== button) {
        swapPieces(state.draggedPiece, button);
      }
    });

    return button;
  }

  function selectOrSwap(piece) {
    if (!state.selectedPiece) {
      state.selectedPiece = piece;
      piece.classList.add('is-selected');
      return;
    }

    if (state.selectedPiece === piece) {
      piece.classList.remove('is-selected');
      state.selectedPiece = null;
      return;
    }

    swapPieces(state.selectedPiece, piece);
    state.selectedPiece.classList.remove('is-selected');
    state.selectedPiece = null;
  }

  function swapPieces(first, second) {
    const firstCorrect = first.dataset.correct;
    const firstBg = first.style.backgroundPosition;
    first.dataset.correct = second.dataset.correct;
    first.style.backgroundPosition = second.style.backgroundPosition;
    second.dataset.correct = firstCorrect;
    second.style.backgroundPosition = firstBg;
    checkPuzzle();
  }

  function checkPuzzle() {
    const solved = $$('.puzzle-piece', $('#puzzleBoard')).every((piece, index) => Number(piece.dataset.correct) === index);
    if (solved) {
      $('#puzzleBoard').classList.add('is-complete');
      $('#puzzleStatus').textContent = 'Nuestra familia, nuestro mayor tesoro.';
      $('#puzzleNext').classList.remove('hidden');
      burst({ emojis: ['💛', '✨', '🌸', '🦋'], count: 32 });
    }
  }

  function isSolved() {
    return state.puzzlePieces.every((piece, index) => piece.correct === index);
  }

  function showPuzzleHint() {
    const preview = $('.puzzle-preview');
    preview.classList.add('is-strong');
    showToast('Mirá la imagen de referencia y seguí armando pieza por pieza.');
    setTimeout(() => preview.classList.remove('is-strong'), 2600);
  }

  async function startMicBlowDetection() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Este navegador no permite usar micrófono aquí. Usá el botón Soplar.');
      $('#micStatus').textContent = 'Micrófono no disponible. El botón Soplar funciona sin permiso.';
      return;
    }

    try {
      $('#micStatus').textContent = 'Solicitando permiso de micrófono...';
      state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.micContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = state.micContext.createMediaStreamSource(state.micStream);
      const analyser = state.micContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      $('#micStatus').textContent = 'Micrófono activo. Soplá cerca del teléfono para apagar las velas.';

      const detect = () => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        if (average > 38) blowCandle();
        if (state.candlesOut < $$('.candle').length) {
          state.micAnimation = requestAnimationFrame(detect);
        }
      };
      detect();
    } catch (error) {
      console.info('[AURORA] Permiso de micrófono rechazado o no disponible.', error);
      $('#micStatus').textContent = 'No se pudo usar el micrófono. Podés usar el botón Soplar.';
      showToast('No pasa nada: el botón Soplar apaga las velitas sin micrófono.');
    }
  }

  function blowCandle() {
    const candles = $$('.candle:not(.is-out)');
    if (!candles.length) return;

    const candle = candles[0];
    candle.classList.add('is-out');
    state.candlesOut += 1;
    burst({ emojis: ['✨'], count: 5 });

    if (state.candlesOut >= $$('.candle').length) {
      $('#micStatus').textContent = 'Las velitas se apagaron. Que todos tus deseos se cumplan, Ma.';
      $('#cakeNext').classList.remove('hidden');
      if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
      burst({ emojis: ['🎆', '✨', '💛', '🌸'], count: 46 });
      stopMic();
      switchToInstrumental();
    }
  }

  function stopMic() {
    if (state.micAnimation) cancelAnimationFrame(state.micAnimation);
    if (state.micStream) state.micStream.getTracks().forEach((track) => track.stop());
    if (state.micContext) state.micContext.close().catch(() => {});
    state.micAnimation = null;
    state.micStream = null;
    state.micContext = null;
  }

  function playFinalMessages() {
    const container = $('#finalMessages');
    container.innerHTML = '';
    state.finalPlayed = true;

    CONFIG.finalLines.forEach((line, index) => {
      setTimeout(() => {
        const p = document.createElement('p');
        p.className = 'final-message';
        p.textContent = line;
        p.style.animationDelay = '0ms';
        container.appendChild(p);
        if (index === CONFIG.finalLines.length - 1) {
          burst({ emojis: ['🦋', '✨', '💛', '🌸'], count: 28 });
        }
      }, CONFIG.reducedMotion ? 50 * index : 1050 * index);
    });
  }

  function restartExperience() {
    localStorage.removeItem(CONFIG.storageKey);
    stopMic();
    state.candlesOut = 0;
    $$('.candle').forEach((candle) => candle.classList.remove('is-out'));
    $('#cakeNext').classList.add('hidden');
    $('#giftBox').classList.remove('is-open');
    $('#giftReveal').textContent = '';
    $('#giftNext').classList.add('hidden');
    $('#typedLetter').textContent = '';
    $('#typedLetter').removeAttribute('data-done');
    $('#typingCursor').classList.remove('hidden');
    $('#secretMessage').textContent = '';
    state.galleryIndex = 0;
    state.candlesOut = 0;
    renderGallery();
    renderGifts();
    buildPuzzle();
    goToChapter(0, { silent: true });
    runIntro();
    showToast('Experiencia reiniciada desde el inicio.');
  }

  function setupParticles() {
    const canvas = $('#particleCanvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas();

    if (CONFIG.reducedMotion) return;

    const count = Math.min(90, Math.floor(window.innerWidth / 18));
    state.particles = Array.from({ length: count }, () => createParticle());

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      state.particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(Date.now() / 900 + particle.phase) * 0.22;
        if (particle.y < -20) Object.assign(particle, createParticle(canvas.height + 20));

        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      state.rafId = requestAnimationFrame(render);
    };
    render();
  }

  function resizeCanvas() {
    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticle(y = Math.random() * window.innerHeight) {
    return {
      x: Math.random() * window.innerWidth,
      y,
      radius: 1 + Math.random() * 2.5,
      speed: 0.18 + Math.random() * 0.52,
      alpha: 0.25 + Math.random() * 0.55,
      phase: Math.random() * 10,
      color: Math.random() > 0.5 ? '#d9b46a' : '#f6b6c9'
    };
  }

  function createAmbientFloaters() {
    if (CONFIG.reducedMotion) return;
    const layer = $('#ambientLayer');
    const symbols = ['🦋', '🌸', '✨', '🎈', '⭐'];
    const amount = Math.min(15, Math.max(8, Math.floor(window.innerWidth / 95)));

    for (let i = 0; i < amount; i += 1) {
      const floater = document.createElement('button');
      floater.type = 'button';
      floater.className = 'floater';
      floater.textContent = symbols[i % symbols.length];
      floater.style.setProperty('--x', `${Math.random() * 94}vw`);
      floater.style.setProperty('--drift', `${-12 + Math.random() * 24}vw`);
      floater.style.setProperty('--duration', `${14 + Math.random() * 14}s`);
      floater.style.animationDelay = `${Math.random() * -18}s`;
      floater.setAttribute('aria-label', 'Mensaje oculto');
      floater.addEventListener('click', () => {
        const message = CONFIG.hiddenMessages[Math.floor(Math.random() * CONFIG.hiddenMessages.length)];
        showToast(message);
        burst({ emojis: ['✨', '💛'], count: 7, x: window.innerWidth / 2, y: window.innerHeight / 2 });
      });
      layer.appendChild(floater);
    }
  }

  function burst({ emojis = ['✨'], count = 18, x = window.innerWidth / 2, y = window.innerHeight / 2 } = {}) {
    if (CONFIG.reducedMotion) return;
    for (let i = 0; i < count; i += 1) {
      const item = document.createElement('span');
      item.className = 'burst-item';
      item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.setProperty('--dx', `${-180 + Math.random() * 360}px`);
      item.style.setProperty('--dy', `${-240 + Math.random() * 260}px`);
      item.style.setProperty('--rot', `${-180 + Math.random() * 360}deg`);
      document.body.appendChild(item);
      setTimeout(() => item.remove(), 1500);
    }
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  }

  function replaceWithPlaceholder(img, label = 'Recuerdo') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#fff4cc"/>
            <stop offset="0.55" stop-color="#ffddea"/>
            <stop offset="1" stop-color="#f4a8bd"/>
          </linearGradient>
          <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#8f3e5c" flood-opacity="0.18"/>
          </filter>
        </defs>
        <rect width="900" height="700" fill="url(#g)"/>
        <circle cx="164" cy="130" r="88" fill="#fff" opacity="0.35"/>
        <circle cx="760" cy="590" r="130" fill="#fff" opacity="0.28"/>
        <g filter="url(#s)">
          <rect x="180" y="205" width="540" height="290" rx="42" fill="#ffffff" opacity="0.74"/>
          <text x="450" y="330" text-anchor="middle" font-size="48" font-family="Arial, sans-serif">✨</text>
          <text x="450" y="396" text-anchor="middle" font-size="34" font-weight="700" fill="#8f3e5c" font-family="Arial, sans-serif">${escapeHTML(label)}</text>
          <text x="450" y="438" text-anchor="middle" font-size="22" fill="#765866" font-family="Arial, sans-serif">Agregá tu foto en la carpeta indicada</text>
        </g>
      </svg>`;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
