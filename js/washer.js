/* ==========================================================================
   TJ FABRIC CARE - INTERACTIVE WASHING MACHINE DRUM SIMULATOR
   ========================================================================== */

const WasherSimulator = (function() {
  const cycles = {
    cotton: {
      name: 'Kenyan Cotton Eco-Cycle',
      temp: '40°C',
      baseRpm: 800,
      durationMinutes: 38,
      waterHeight: '48%',
      spinClass: 'spinning-fast',
      desc: 'Balanced cold-hot surge with botanical enzyme breakdown'
    },
    wool: {
      name: 'Artisan Safari Suit & Wool Form',
      temp: '30°C',
      baseRpm: 400,
      durationMinutes: 45,
      waterHeight: '35%',
      spinClass: 'spinning-slow',
      desc: 'Gentle continuous ripple bath preventing wool fiber shrinkage'
    },
    sneaker: {
      name: 'Sneaker Deep Ozone Sanitization',
      temp: '25°C',
      baseRpm: 500,
      durationMinutes: 52,
      waterHeight: '40%',
      spinClass: 'spinning-slow',
      desc: 'Ultrasonic micro-bubble pulse + UV-C bacteria neutralization'
    },
    duvet: {
      name: 'Heavy Duvet & King Linen Allergen Extraction',
      temp: '60°C',
      baseRpm: 1200,
      durationMinutes: 60,
      waterHeight: '62%',
      spinClass: 'spinning-ultra',
      desc: 'High-thermal dust mite eradication with high-loft air fluff'
    }
  };

  let activeCycleKey = 'cotton';
  let isRunning = false;
  let timerInterval = null;
  let remainingSeconds = 38 * 60;
  let currentRpm = 800;

  function init() {
    bindControls();
    updateDisplay();
  }

  function bindControls() {
    // Cycle preset buttons
    document.querySelectorAll('[data-washer-cycle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-washer-cycle');
        if (cycles[key]) {
          selectCycle(key);
        }
      });
    });

    // Start / Pause toggle
    const toggleBtn = document.getElementById('washer-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePlayPause);
    }

    // RPM slider
    const rpmSlider = document.getElementById('washer-rpm-slider');
    if (rpmSlider) {
      rpmSlider.addEventListener('input', (e) => {
        currentRpm = parseInt(e.target.value, 10);
        updateRpm(currentRpm);
      });
    }

    // Extra Suds button
    const sudsBtn = document.getElementById('washer-add-suds-btn');
    if (sudsBtn) {
      sudsBtn.addEventListener('click', addExtraSuds);
    }
  }

  function selectCycle(key) {
    activeCycleKey = key;
    const c = cycles[key];
    currentRpm = c.baseRpm;
    remainingSeconds = c.durationMinutes * 60;

    // Update active tab buttons
    document.querySelectorAll('[data-washer-cycle]').forEach(b => {
      if (b.getAttribute('data-washer-cycle') === key) {
        b.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
      } else {
        b.className = 'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all bg-white/10 hover:bg-white/20 text-slate-300';
      }
    });

    const rpmSlider = document.getElementById('washer-rpm-slider');
    if (rpmSlider) rpmSlider.value = currentRpm;

    updateDisplay();
    if (isRunning) {
      applyDrumSpin();
    }
    if (window.SoundEffects) window.SoundEffects.playSwitch();
  }

  function togglePlayPause() {
    isRunning = !isRunning;
    const toggleBtn = document.getElementById('washer-toggle-btn');
    const drum = document.getElementById('washer-drum-inner');
    const water = document.getElementById('washer-water-fill');
    const ledStatus = document.getElementById('washer-led-status');

    if (isRunning) {
      if (toggleBtn) {
        toggleBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> <span>Pause Wash Cycle</span>`;
        toggleBtn.className = 'w-full px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all';
      }
      if (water) {
        water.style.height = cycles[activeCycleKey].waterHeight;
      }
      if (ledStatus) {
        ledStatus.innerText = 'CYCLE ACTIVE • SLOSHING';
        ledStatus.className = 'text-[11px] font-mono font-bold text-emerald-400 animate-pulse';
      }

      applyDrumSpin();
      startTimer();
      if (window.SoundEffects) window.SoundEffects.playPop();
    } else {
      if (toggleBtn) {
        toggleBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>Start Washing Cycle</span>`;
        toggleBtn.className = 'w-full px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all';
      }
      if (drum) {
        drum.className = 'washer-drum-inner';
      }
      if (ledStatus) {
        ledStatus.innerText = 'PAUSED • STANDBY';
        ledStatus.className = 'text-[11px] font-mono font-bold text-amber-400';
      }
      clearInterval(timerInterval);
      if (window.SoundEffects) window.SoundEffects.playSwitch();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function applyDrumSpin() {
    const drum = document.getElementById('washer-drum-inner');
    if (!drum || !isRunning) return;

    if (currentRpm >= 1100) {
      drum.className = 'washer-drum-inner spinning-ultra';
    } else if (currentRpm >= 700) {
      drum.className = 'washer-drum-inner spinning-fast';
    } else {
      drum.className = 'washer-drum-inner spinning-slow';
    }
  }

  function updateRpm(val) {
    currentRpm = val;
    const rpmValEl = document.getElementById('washer-rpm-val');
    if (rpmValEl) rpmValEl.innerText = `${val} RPM`;

    if (isRunning) {
      applyDrumSpin();
    }
  }

  function addExtraSuds() {
    const water = document.getElementById('washer-water-fill');
    if (!water) return;

    // Add extra temporary foaming
    const currentHeight = parseInt(water.style.height || '45', 10);
    const boostedHeight = Math.min(75, currentHeight + 12);
    water.style.height = `${boostedHeight}%`;

    const foam = water.querySelector('.washer-foam-suds');
    if (foam) {
      foam.style.height = '48px';
    }

    showToast('🧴 Organic Botanical Enzymes added! Extra bubble suds generated.', 'success');
    if (window.SoundEffects) window.SoundEffects.playPop();

    setTimeout(() => {
      if (water && cycles[activeCycleKey]) {
        water.style.height = cycles[activeCycleKey].waterHeight;
      }
      if (foam) foam.style.height = '32px';
    }, 4500);
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        renderTimerDisplay();
      } else {
        cycleCompleted();
      }
    }, 1000);
  }

  function renderTimerDisplay() {
    const timerEl = document.getElementById('washer-led-timer');
    if (!timerEl) return;

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function cycleCompleted() {
    isRunning = false;
    clearInterval(timerInterval);
    const toggleBtn = document.getElementById('washer-toggle-btn');
    const ledStatus = document.getElementById('washer-led-status');
    const drum = document.getElementById('washer-drum-inner');
    const water = document.getElementById('washer-water-fill');

    if (drum) drum.className = 'washer-drum-inner';
    if (water) water.style.height = '0%';
    if (ledStatus) {
      ledStatus.innerText = 'CYCLE COMPLETE • DRAINED & FRESH';
      ledStatus.className = 'text-[11px] font-mono font-bold text-emerald-400';
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>Start Washing Cycle</span>`;
    }

    if (window.SoundEffects) window.SoundEffects.playSuccess();
    showToast('✨ Wash Cycle Complete! Zero chemicals, 100% ozone sanitized.', 'success');
    if (window.lucide) window.lucide.createIcons();
  }

  function updateDisplay() {
    const c = cycles[activeCycleKey];
    if (!c) return;

    const nameEl = document.getElementById('washer-cycle-name');
    const tempEl = document.getElementById('washer-temp-val');
    const rpmValEl = document.getElementById('washer-rpm-val');
    const descEl = document.getElementById('washer-cycle-desc');

    if (nameEl) nameEl.innerText = c.name;
    if (tempEl) tempEl.innerText = c.temp;
    if (rpmValEl) rpmValEl.innerText = `${currentRpm} RPM`;
    if (descEl) descEl.innerText = c.desc;

    renderTimerDisplay();
  }

  return {
    init,
    selectCycle,
    togglePlayPause,
    addExtraSuds
  };
})();

window.WasherSimulator = WasherSimulator;
