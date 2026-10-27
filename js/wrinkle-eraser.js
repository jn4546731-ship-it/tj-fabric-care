/* ==========================================================================
   TJ FABRIC CARE - INTERACTIVE STEAM WRINKLE ERASER
   ========================================================================== */

const WrinkleEraser = (function() {
  let canvas = null;
  let ctx = null;
  let isErasing = false;
  let erasedPixelsCount = 0;
  let totalPixels = 1;
  let hasCompleted = false;

  function init() {
    canvas = document.getElementById('wrinkle-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    setupCanvas();
    bindEvents();
  }

  function setupCanvas() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    totalPixels = canvas.width * canvas.height;
    hasCompleted = false;
    erasedPixelsCount = 0;

    // Draw realistic wrinkled fabric overlay
    drawWrinkledFabric();
    updateCounter(0);
  }

  function drawWrinkledFabric() {
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';

    // Base crumpled cloth color
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw crinkled shadow folds and creases
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const numCreases = 24;
    for (let i = 0; i < numCreases; i++) {
      ctx.beginPath();
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      ctx.moveTo(startX, startY);

      let curX = startX;
      let curY = startY;
      for (let j = 0; j < 4; j++) {
        curX += (Math.random() - 0.5) * 80;
        curY += (Math.random() - 0.5) * 60;
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();

      // Highlight crease
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + 2, startY + 2);
      ctx.lineTo(curX + 2, curY + 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 3;
    }

    // Overlay text instruction
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💨 Drag Iron or Finger Across To Erase Wrinkles with Steam', canvas.width / 2, canvas.height / 2);
  }

  function bindEvents() {
    if (!canvas) return;

    const floatingIron = document.getElementById('floating-iron-cursor');

    const handlePointerMove = (x, y) => {
      eraseAt(x, y);

      if (floatingIron) {
        floatingIron.style.display = 'block';
        floatingIron.style.left = `${x}px`;
        floatingIron.style.top = `${y}px`;
      }

      spawnSteamParticle(x, y);
    };

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handlePointerMove(x, y);
    });

    canvas.addEventListener('mouseleave', () => {
      if (floatingIron) floatingIron.style.display = 'none';
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handlePointerMove(x, y);
    }, { passive: false });

    // Reset button
    const resetBtn = document.getElementById('wrinkle-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        setupCanvas();
        if (window.SoundEffects) window.SoundEffects.playPop();
      });
    }

    window.addEventListener('resize', () => {
      setupCanvas();
    });
  }

  function eraseAt(x, y) {
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();

    erasedPixelsCount += 40;
    const percent = Math.min(100, Math.round((erasedPixelsCount / (canvas.width * canvas.height * 0.4)) * 100));
    updateCounter(percent);

    if (percent >= 90 && !hasCompleted) {
      hasCompleted = true;
      if (window.confetti) {
        window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
      if (window.SoundEffects) window.SoundEffects.playSuccess();
      showToast('👔 100% Hotel-Crisp Steam Finish Achieved!', 'success');
    }
  }

  function spawnSteamParticle(x, y) {
    const container = document.getElementById('wrinkle-stage-box');
    if (!container || Math.random() > 0.4) return;

    const steam = document.createElement('div');
    steam.className = 'steam-wisp';
    steam.style.left = `${x + (Math.random() - 0.5) * 20}px`;
    steam.style.top = `${y + (Math.random() - 0.5) * 15}px`;

    container.appendChild(steam);
    setTimeout(() => steam.remove(), 2000);
  }

  function updateCounter(val) {
    const counterEl = document.getElementById('wrinkle-percent-display');
    const badgeEl = document.getElementById('wrinkle-status-badge');

    if (counterEl) counterEl.innerText = `${val}% Smoothed`;
    if (badgeEl) {
      if (val >= 90) {
        badgeEl.innerText = '✅ Hotel-Crisp Pressed';
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
      } else {
        badgeEl.innerText = '💨 Drag To Steam';
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300';
      }
    }
  }

  return {
    init,
    reset: setupCanvas
  };
})();

window.WrinkleEraser = WrinkleEraser;
