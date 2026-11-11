/* ==========================================================================
   TJ FABRIC CARE - 15-SECOND ANIMATED BOOKING WALKTHROUGH VIDEO ENGINE
   ========================================================================== */

const BookingVideoGuide = (function() {
  const DURATION = 15.0; // Exact 15-second video duration
  const VW = 960;        // Virtual 16:9 HD canvas width
  const VH = 540;        // Virtual 16:9 HD canvas height

  let canvas = null;
  let ctx = null;
  let rafId = null;
  let isPlaying = false;
  let currentTime = 0;
  let lastFrameTs = null;
  let isSoundEnabled = true;
  let lastChimeScene = -1;
  let userPaused = false;
  let particles = [];

  const scenes = [
    {
      index: 0,
      start: 0,
      end: 3.8,
      title: 'Step 1: Pick Service',
      caption: 'Tap "Schedule 60s" & pick Wash & Fold (KSh 850) or Dry Clean'
    },
    {
      index: 1,
      start: 3.8,
      end: 7.8,
      title: 'Step 2: M-Pesa & GPS Pin',
      caption: 'Enter Safaricom M-Pesa number & tap "Detect Live GPS Location"'
    },
    {
      index: 2,
      start: 7.8,
      end: 11.5,
      title: 'Step 3: Rider Dispatch',
      caption: 'Select pickup window — rider navigates straight to your gate pin'
    },
    {
      index: 3,
      start: 11.5,
      end: 15.0,
      title: 'Step 4: M-Pesa on Return',
      caption: 'Inspect fresh clothes on return & approve the M-Pesa STK prompt!'
    }
  ];

  function init() {
    canvas = document.getElementById('booking-video-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    setupCanvasDPI();
    bindControls();
    setupIntersectionAutoplay();
    renderFrame(0);
    updateUI();
  }

  function setupCanvasDPI() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * dpr;
    canvas.height = VH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bindControls() {
    const playBtn = document.getElementById('video-play-btn');
    const centerOverlay = document.getElementById('video-center-play');
    const restartBtn = document.getElementById('video-restart-btn');
    const soundBtn = document.getElementById('video-sound-btn');
    const progressWrap = document.getElementById('video-progress-track');
    const fullscreenBtn = document.getElementById('video-fullscreen-btn');
    const stageWrap = document.getElementById('video-player-shell');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        userPaused = isPlaying;
        togglePlay();
      });
    }

    if (centerOverlay) {
      centerOverlay.addEventListener('click', () => {
        userPaused = isPlaying;
        togglePlay();
      });
    }

    if (canvas) {
      canvas.addEventListener('click', () => {
        userPaused = isPlaying;
        togglePlay();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        seekTo(0);
        userPaused = false;
        if (!isPlaying) togglePlay(true);
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        updateSoundBtn();
        if (isSoundEnabled && window.SoundEffects) window.SoundEffects.playPop();
      });
    }

    if (progressWrap) {
      const handleScrub = (clientX) => {
        const rect = progressWrap.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        seekTo(ratio * DURATION);
      };

      progressWrap.addEventListener('click', (e) => handleScrub(e.clientX));
      progressWrap.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });
    }

    if (fullscreenBtn && stageWrap) {
      fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (stageWrap.requestFullscreen) {
          stageWrap.requestFullscreen().catch(() => {});
        }
      });
    }

    document.querySelectorAll('[data-video-chapter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = parseFloat(btn.getAttribute('data-video-chapter'));
        if (!isNaN(sec)) {
          seekTo(sec);
          userPaused = false;
          if (!isPlaying) togglePlay(true);
        }
      });
    });

    window.addEventListener('resize', () => {
      setupCanvasDPI();
      renderFrame(currentTime);
    });
  }

  function setupIntersectionAutoplay() {
    if (!('IntersectionObserver' in window) || !canvas) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !userPaused && !isPlaying) {
          togglePlay(true);
        } else if (!entry.isIntersecting && isPlaying) {
          togglePlay(false);
        }
      });
    }, { threshold: 0.45 });

    observer.observe(canvas);
  }

  function togglePlay(forceState = null) {
    isPlaying = forceState !== null ? forceState : !isPlaying;
    lastFrameTs = null;

    if (isPlaying) {
      if (currentTime >= DURATION - 0.05) {
        currentTime = 0;
        lastChimeScene = -1;
        particles = [];
      }
      rafId = requestAnimationFrame(tick);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    updateUI();
  }

  function seekTo(sec) {
    currentTime = Math.max(0, Math.min(DURATION, sec));
    lastChimeScene = getSceneIndex(currentTime);
    particles = [];
    renderFrame(currentTime);
    updateUI();
  }

  function tick(ts) {
    if (!isPlaying) return;
    if (lastFrameTs === null) lastFrameTs = ts;
    const dt = Math.min(0.1, (ts - lastFrameTs) / 1000);
    lastFrameTs = ts;

    currentTime += dt;
    if (currentTime >= DURATION) {
      currentTime = 0; // Seamless 15s loop
      lastChimeScene = -1;
      particles = [];
    }

    const activeIdx = getSceneIndex(currentTime);
    if (activeIdx !== lastChimeScene) {
      lastChimeScene = activeIdx;
      if (isSoundEnabled && window.SoundEffects && !userPaused) {
        if (activeIdx === 3) {
          window.SoundEffects.playSwitch();
        } else {
          window.SoundEffects.playPop();
        }
      }
    }

    renderFrame(currentTime);
    updateUI();
    rafId = requestAnimationFrame(tick);
  }

  function getSceneIndex(t) {
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (t >= scenes[i].start) return i;
    }
    return 0;
  }

  function updateUI() {
    const playBtn = document.getElementById('video-play-btn');
    const centerOverlay = document.getElementById('video-center-play');
    const timeLabel = document.getElementById('video-time-label');
    const progressBar = document.getElementById('video-progress-fill');
    const captionEl = document.getElementById('video-live-caption');

    if (playBtn) {
      playBtn.innerHTML = isPlaying
        ? `<i data-lucide="pause" class="w-4 h-4"></i>`
        : `<i data-lucide="play" class="w-4 h-4"></i>`;
    }

    if (centerOverlay) {
      centerOverlay.style.opacity = isPlaying ? '0' : '1';
      centerOverlay.style.pointerEvents = isPlaying ? 'none' : 'auto';
    }

    if (timeLabel) {
      const curSec = Math.floor(currentTime).toString().padStart(2, '0');
      timeLabel.innerText = `00:${curSec} / 00:15`;
    }

    if (progressBar) {
      progressBar.style.width = `${(currentTime / DURATION) * 100}%`;
    }

    const activeScene = scenes[getSceneIndex(currentTime)];
    if (captionEl && activeScene) {
      captionEl.innerText = activeScene.caption;
    }

    document.querySelectorAll('[data-video-chapter]').forEach((btn, idx) => {
      if (idx === activeScene.index) {
        btn.classList.add('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300');
        btn.classList.remove('border-white/10', 'bg-slate-900/70', 'text-slate-300');
      } else {
        btn.classList.remove('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300');
        btn.classList.add('border-white/10', 'bg-slate-900/70', 'text-slate-300');
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function updateSoundBtn() {
    const soundBtn = document.getElementById('video-sound-btn');
    if (!soundBtn) return;
    soundBtn.innerHTML = isSoundEnabled
      ? `<i data-lucide="volume-2" class="w-4 h-4 text-cyan-400"></i>`
      : `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  // Math Helpers
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function easeOutCubic(x) { return 1 - Math.pow(1 - clamp01(x), 3); }
  function lerp(a, b, t) { return a + (b - a) * clamp01(t); }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground(t) {
    // Deep Obsidian Base
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, VW, VH);

    // Subtle moving cyber-grid
    const offset = (t * 16) % 40;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
    ctx.lineWidth = 1;
    for (let x = offset; x < VW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VH);
      ctx.stroke();
    }
    for (let y = offset; y < VH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y);
      ctx.stroke();
    }

    // Radial glows
    const g1 = ctx.createRadialGradient(200, 120, 10, 200, 120, 340);
    g1.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, VW, VH);

    const g2 = ctx.createRadialGradient(780, 400, 10, 780, 400, 340);
    g2.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, VW, VH);
  }

  function drawTopHUD(t) {
    const activeIdx = getSceneIndex(t);

    // Brand Pill Top Left
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    roundRect(32, 24, 230, 38, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(54, 43, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TJ FABRIC CARE • 15s GUIDE', 68, 48);

    // 4-Step Indicator Top Right
    for (let i = 0; i < 4; i++) {
      const bx = VW - 32 - (4 - i) * 58 + 8;
      const isActive = i === activeIdx;
      const isDone = i < activeIdx;

      ctx.fillStyle = isActive
        ? 'rgba(16, 185, 129, 0.25)'
        : isDone
          ? 'rgba(34, 211, 238, 0.18)'
          : 'rgba(15, 23, 42, 0.8)';
      roundRect(bx, 24, 50, 32, 10);
      ctx.fill();

      ctx.strokeStyle = isActive
        ? '#10b981'
        : isDone
          ? '#22d3ee'
          : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#34d399' : isDone ? '#67e8f9' : '#64748b';
      ctx.font = '700 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isDone ? `✓ ${i + 1}` : `0${i + 1}`, bx + 25, 45);
    }
  }

  function drawPhoneFrame(x, y, w, h, titleText) {
    // Outer Glow
    ctx.shadowColor = 'rgba(6, 182, 212, 0.22)';
    ctx.shadowBlur = 35;

    ctx.fillStyle = '#0f172a';
    roundRect(x, y, w, h, 26);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header Bar inside UI Card
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    roundRect(x + 12, y + 12, w - 24, 46, 14);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = '700 12px "Plus Jakarta Sans", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(titleText, x + 28, y + 40);
  }

  function drawCursor(cx, cy, clicking = false) {
    ctx.save();
    ctx.translate(cx, cy);

    if (clicking) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(6, 17);
    ctx.lineTo(11, 26);
    ctx.lineTo(15, 24);
    ctx.lineTo(10, 15);
    ctx.lineTo(17, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawCaptionBar(title, subtitle) {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    roundRect(40, VH - 78, VW - 80, 56, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title.toUpperCase(), 62, VH - 53);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 62, VH - 33);
  }

  function renderFrame(t) {
    if (!ctx) return;
    drawBackground(t);
    drawTopHUD(t);

    if (t < 3.8) {
      drawScene1(t);
    } else if (t < 7.8) {
      drawScene2(t - 3.8);
    } else if (t < 11.5) {
      drawScene3(t - 7.8);
    } else {
      drawScene4(t - 11.5);
    }
  }

  // SCENE 1 (0 - 3.8s): Tap Schedule 60s & Choose Service
  function drawScene1(localT) {
    const enter = easeOutCubic(localT / 0.5);
    const py = lerp(120, 86, enter);
    drawPhoneFrame(110, py, 740, 355, 'STEP 01 / 04 • SELECT LAUNDRY SERVICE');

    // Hero CTA preview pill inside left
    const btnClicked = localT >= 1.1;
    const svcClicked = localT >= 2.3;

    // Right Service Tiles
    const services = [
      { title: 'Wash & Fold Everyday', price: 'KSh 850 / bag', sub: 'Whites & colors split + Cube Fold', selected: svcClicked },
      { title: 'Artisan Dry Clean & Press', price: 'From KSh 150', sub: 'Suits, Silk Gowns & Safari Coats', selected: false },
      { title: 'Sneaker & Footwear Spa', price: 'From KSh 500', sub: 'Sole scrub & UV-C ozone sanitize', selected: false }
    ];

    // Left hero prompt
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('The Laundry Day', 146, py + 115);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText('Solved in 60s.', 146, py + 145);

    // Animated CTA button
    const btnScale = (localT > 1.0 && localT < 1.25) ? 0.96 : 1;
    const bw = 210 * btnScale;
    const bh = 48 * btnScale;
    const grad = ctx.createLinearGradient(146, 0, 146 + bw, 0);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    roundRect(146, py + 178, bw, bh, 14);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Schedule 60s Pickup →', 166, py + 207);

    // Service cards on right side of modal frame
    services.forEach((svc, idx) => {
      const cy = py + 82 + idx * 84;
      ctx.fillStyle = svc.selected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(2, 6, 23, 0.72)';
      roundRect(410, cy, 410, 72, 16);
      ctx.fill();

      ctx.strokeStyle = svc.selected ? '#10b981' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = svc.selected ? 2.5 : 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(svc.title, 430, cy + 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(svc.sub, 430, cy + 49);

      ctx.fillStyle = svc.selected ? '#34d399' : '#22d3ee';
      ctx.font = '800 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(svc.selected ? `✓ ${svc.price}` : svc.price, 800, cy + 38);
    });

    // Animated Cursor path
    let curX = 240, curY = 360, clicking = false;
    if (localT < 1.2) {
      const p = easeOutCubic(localT / 1.0);
      curX = lerp(330, 250, p);
      curY = lerp(360, py + 202, p);
      clicking = localT > 1.0 && localT < 1.2;
    } else {
      const p = easeOutCubic((localT - 1.2) / 1.1);
      curX = lerp(250, 610, p);
      curY = lerp(py + 202, py + 118, p);
      clicking = localT > 2.25 && localT < 2.5;
    }
    drawCursor(curX, curY, clicking);

    drawCaptionBar('Step 1 of 4 • Service Selection', 'Tap "Schedule 60s Pickup" and choose Wash & Fold, Dry Clean, or Sneakers.');
  }

  // SCENE 2 (3.8 - 7.8s): Enter M-Pesa Credentials & Live GPS Pin
  function drawScene2(localT) {
    drawPhoneFrame(110, 86, 740, 355, 'STEP 02 / 04 • M-PESA NUMBER & LIVE GPS PIN');

    // Name Input
    const nameStr = 'Sarah Wanjiku';
    const nameChars = Math.floor(clamp01(localT / 0.8) * nameStr.length);
    const phoneStr = '0722 145 890';
    const phoneChars = Math.floor(clamp01((localT - 0.8) / 0.9) * phoneStr.length);

    // Input 1: Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CLIENT NAME', 146, 174);
    ctx.fillStyle = '#020617';
    roundRect(146, 182, 310, 44, 12);
    ctx.fill();
    ctx.strokeStyle = localT < 0.9 ? '#22d3ee' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(nameStr.slice(0, nameChars), 162, 209);

    // Input 2: Safaricom Phone
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SAFARICOM M-PESA NUMBER', 484, 174);
    ctx.fillStyle = '#020617';
    roundRect(484, 182, 330, 44, 12);
    ctx.fill();
    ctx.strokeStyle = (localT >= 0.8 && localT < 1.8) ? '#10b981' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.font = '700 14px monospace';
    ctx.fillText(`🇰🇪 ${phoneStr.slice(0, phoneChars)}`, 500, 209);

    // GPS Button & Radar Box
    const gpsClicked = localT >= 2.1;
    const gpsLocked = localT >= 2.6;

    ctx.fillStyle = gpsLocked ? 'rgba(16, 185, 129, 0.16)' : 'rgba(6, 182, 212, 0.12)';
    roundRect(146, 250, 668, 162, 18);
    ctx.fill();
    ctx.strokeStyle = gpsLocked ? '#10b981' : '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Detect GPS Action Pill
    ctx.fillStyle = gpsLocked ? '#10b981' : '#020617';
    roundRect(172, 272, 320, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = gpsLocked ? '#020617' : '#67e8f9';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      gpsLocked ? '✓ LIVE GPS PIN LOCKED (±4m)' : gpsClicked ? '📡 ACQUIRING SATELLITE LOCK...' : '📍 Detect My Live GPS Location',
      332,
      299
    );

    ctx.textAlign = 'left';
    ctx.fillStyle = gpsLocked ? '#34d399' : '#94a3b8';
    ctx.font = '600 13px monospace';
    ctx.fillText(
      gpsLocked ? 'PIN: -1.2675, 36.8042 • Westlands, Rhapta Rd' : 'Auto-fills Google Maps pin for zero-confusion pickup',
      172,
      348
    );

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Admin & Courier navigate directly to your gate with 1 click.', 172, 376);

    // GPS Radar Rings Right
    const rx = 710, ry = 330;
    const pulse = (localT * 1.5) % 1;
    ctx.strokeStyle = gpsLocked ? `rgba(16, 185, 129, ${1 - pulse})` : `rgba(34, 211, 238, ${1 - pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rx, ry, 14 + pulse * 44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = gpsLocked ? '#10b981' : '#22d3ee';
    ctx.beginPath();
    ctx.arc(rx, ry, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cursor moving to GPS button
    const curP = easeOutCubic((localT - 1.4) / 0.7);
    const curX = lerp(650, 330, curP);
    const curY = lerp(205, 294, curP);
    drawCursor(curX, curY, localT > 2.05 && localT < 2.25);

    drawCaptionBar('Step 2 of 4 • Credentials & GPS Pin', 'Enter your M-Pesa number & lock your exact Google Maps location pin.');
  }

  // SCENE 3 (7.8 - 11.5s): Pickup Slot & Electric Boda Dispatch
  function drawScene3(localT) {
    drawPhoneFrame(110, 86, 740, 355, 'STEP 03 / 04 • PICK WINDOW & LIVE RIDER DISPATCH');

    // Pickup slots Left
    const slotPicked = localT >= 0.9;
    const slots = [
      { label: 'Morning Wave', time: '7:00 AM – 9:00 AM', active: slotPicked },
      { label: 'Evening Rush', time: '6:00 PM – 8:00 PM', active: false }
    ];

    slots.forEach((s, idx) => {
      const sy = 166 + idx * 82;
      ctx.fillStyle = s.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 6, 23, 0.7)';
      roundRect(146, sy, 260, 68, 14);
      ctx.fill();
      ctx.strokeStyle = s.active ? '#10b981' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = s.active ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 14px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, 166, sy + 28);

      ctx.fillStyle = s.active ? '#34d399' : '#94a3b8';
      ctx.font = '600 12px monospace';
      ctx.fillText(s.time, 166, sy + 49);
    });

    // RFID Bag Tag badge
    ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
    roundRect(146, 338, 260, 72, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
    ctx.stroke();
    ctx.fillStyle = '#67e8f9';
    ctx.font = '700 12px monospace';
    ctx.fillText('RFID TAG: #TJ-8821', 166, 366);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('KSh 50,000 Zero-Loss Insured', 166, 390);

    // Live Nairobi Route Map Right
    ctx.fillStyle = '#020617';
    roundRect(435, 166, 380, 244, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.stroke();

    // Cyber road grid inside map
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(435 + i * 70, 166);
      ctx.lineTo(435 + i * 70, 410);
      ctx.stroke();
    }

    // Route path Hub -> Client
    const p1x = 490, p1y = 350;
    const p2x = 620, p2y = 265;
    const p3x = 760, p3y = 225;

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.stroke();

    // Animated active cyan-emerald path
    const driveP = easeOutCubic((localT - 0.9) / 2.4);
    let bikeX = p1x, bikeY = p1y;
    if (driveP < 0.5) {
      const k = driveP / 0.5;
      bikeX = lerp(p1x, p2x, k);
      bikeY = lerp(p1y, p2y, k);
    } else {
      const k = (driveP - 0.5) / 0.5;
      bikeX = lerp(p2x, p3x, k);
      bikeY = lerp(p2y, p3y, k);
    }

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    if (driveP < 0.5) {
      ctx.lineTo(bikeX, bikeY);
    } else {
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(bikeX, bikeY);
    }
    ctx.stroke();

    // Origin Hub Dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p1x, p1y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px monospace';
    ctx.fillText('TJ HUB', p1x - 16, p1y + 22);

    // Destination Pin
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p3x, p3y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.fillText('YOUR GATE 📍', p3x - 42, p3y - 16);

    // Rider Icon pill
    ctx.fillStyle = '#22d3ee';
    roundRect(bikeX - 24, bikeY - 14, 48, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏍️ BODA', bikeX, bikeY + 3);

    if (localT < 1.1) {
      drawCursor(lerp(330, 270, localT / 0.8), lerp(150, 200, localT / 0.8), localT > 0.8 && localT < 1.0);
    }

    drawCaptionBar('Step 3 of 4 • Pickup & RFID Tracking', 'Choose your time window — track your Electric Boda rider right to your door.');
  }

  // SCENE 4 (11.5 - 15.0s): Inspect Fresh Clothes & Approve M-Pesa STK Push
  function drawScene4(localT) {
    drawPhoneFrame(110, 86, 740, 355, 'STEP 04 / 04 • DELIVERED FRESH • M-PESA STK PUSH');

    // Left Summary Card: Clothes Back Fresh
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    roundRect(146, 166, 290, 240, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '800 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('✨ 24H RETURN COMPLETE', 170, 202);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillText('Crisp & Hotel-Folded', 170, 234);

    const checklist = [
      '✓ 14 Garments Inspected',
      '✓ Ozone Sanitized & Fresh',
      '✓ Zero-Upfront Payment'
    ];
    checklist.forEach((line, i) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(line, 170, 274 + i * 30);
    });

    ctx.fillStyle = '#10b981';
    ctx.font = '800 20px monospace';
    ctx.fillText('TOTAL: KSh 850', 170, 382);

    // Right M-Pesa Handset Prompt
    const paid = localT >= 2.2;
    ctx.fillStyle = paid ? 'rgba(16, 185, 129, 0.2)' : '#020617';
    roundRect(465, 166, 350, 240, 20);
    ctx.fill();
    ctx.strokeStyle = paid ? '#10b981' : '#00a651';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // M-Pesa Header Strip
    ctx.fillStyle = '#00a651';
    roundRect(465, 166, 350, 44, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAFARICOM M-PESA STK PROMPT', 640, 193);

    if (!paid) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Do you want to pay KSh 850.00', 640, 246);
      ctx.fillText('to TJ FABRIC CARE?', 640, 268);

      // PIN entry box
      ctx.fillStyle = '#0f172a';
      roundRect(535, 290, 210, 44, 10);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const dotsCount = Math.min(4, Math.floor(clamp01((localT - 0.8) / 1.0) * 5));
      const dotsText = '• '.repeat(dotsCount).trim() || 'Enter M-Pesa PIN';
      ctx.fillStyle = dotsCount > 0 ? '#34d399' : '#64748b';
      ctx.font = dotsCount > 0 ? '900 22px monospace' : '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(dotsText, 640, 319);

      ctx.fillStyle = '#34d399';
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Pay safely only after clothes arrive', 640, 376);
    } else {
      const pop = easeOutCubic((localT - 2.2) / 0.4);
      ctx.save();
      ctx.translate(640, 285);
      ctx.scale(lerp(0.6, 1, pop), lerp(0.6, 1, pop));

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, -18, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#020617';
      ctx.font = '900 26px sans-serif';
      ctx.fillText('✓', 0, -9);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 17px "Outfit", sans-serif';
      ctx.fillText('CONFIRMED • M-PESA PAID', 0, 35);

      ctx.fillStyle = '#67e8f9';
      ctx.font = '700 12px monospace';
      ctx.fillText('REF: QGH79XK21M • READY TO WEAR!', 0, 62);
      ctx.restore();
    }

    drawCaptionBar('Step 4 of 4 • Pay After Delivery', 'Inspect your crisp clothes at your gate, then approve the M-Pesa STK prompt!');
  }

  return {
    init,
    togglePlay,
    seekTo
  };
})();

window.BookingVideoGuide = BookingVideoGuide;
