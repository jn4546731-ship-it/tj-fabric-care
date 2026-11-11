/* ==========================================================================
   TJ FABRIC CARE - APPLICATION CONTROLLER & SYNTH AUDIO ENGINE
   ========================================================================== */

// Web Audio API Synthesizer (Zero external audio assets required)
const SoundEffects = (function() {
  let audioCtx = null;
  let isMuted = (localStorage.getItem('tj_sound_muted') || localStorage.getItem('lumina_sound_muted')) === 'true';

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPop() {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  function playSwitch() {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  function playSuccess() {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('tj_sound_muted', isMuted);
    updateAudioBtn();
    if (!isMuted) playPop();
  }

  function updateAudioBtn() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    if (isMuted) {
      btn.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i>`;
      btn.title = "Unmute UI Sound Effects";
      btn.classList.remove('sound-toggle-active');
    } else {
      btn.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>`;
      btn.title = "Mute UI Sound Effects";
      btn.classList.add('sound-toggle-active');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  return {
    playPop,
    playSwitch,
    playSuccess,
    toggleMute,
    updateAudioBtn
  };
})();

window.SoundEffects = SoundEffects;

// Toast Notification Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-900/90 text-white border-emerald-500/50 shadow-emerald-500/20',
    warning: 'bg-amber-900/90 text-white border-amber-500/50 shadow-amber-500/20',
    info: 'bg-slate-900/90 text-white border-sky-500/50 shadow-sky-500/20'
  };

  const icons = {
    success: 'check-circle-2',
    warning: 'alert-circle',
    info: 'info'
  };

  toast.className = `flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl text-xs sm:text-sm font-semibold transition-all transform translate-y-4 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 shrink-0 text-cyan-400"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Init Audio Button
  const audioBtn = document.getElementById('sound-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', SoundEffects.toggleMute);
    SoundEffects.updateAudioBtn();
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-nav-drawer');
  const closeMobileMenuBtn = document.getElementById('mobile-nav-close');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      if (window.SoundEffects) window.SoundEffects.playPop();
    });
  }

  if (closeMobileMenuBtn && mobileMenu) {
    closeMobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }

  // Close mobile drawer on link click
  document.querySelectorAll('#mobile-nav-drawer a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });

  // Zip Code Coverage Checker
  const zipForm = document.getElementById('coverage-form');
  const zipInput = document.getElementById('coverage-zip-input');
  const zipResult = document.getElementById('coverage-result');

  if (zipForm && zipInput && zipResult) {
    zipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = zipInput.value.trim();
      if (!val || val.length < 3) {
        showToast('Please enter a valid postal or zip code', 'warning');
        return;
      }

      zipResult.classList.remove('hidden');
      zipResult.innerHTML = `
        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <i data-lucide="check" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="text-xs sm:text-sm font-bold text-emerald-200">TJ Prime Active in Area ${val}!</h5>
            <p class="text-[11px] sm:text-xs text-emerald-300/80 mt-0.5">30-minute pickup windows and 24h standard turnaround are active today.</p>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      if (window.SoundEffects) window.SoundEffects.playSuccess();
    });
  }

  // Pricing Plan Billing Toggle (Monthly vs Annual in KSh)
  const billingToggle = document.getElementById('billing-toggle');
  if (billingToggle) {
    billingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      const soloPrice = document.getElementById('plan-price-solo');
      const couplePrice = document.getElementById('plan-price-couple');
      const execPrice = document.getElementById('plan-price-exec');

      if (isAnnual) {
        if (soloPrice) soloPrice.innerHTML = `KSh 2,240 <span class="text-xs font-normal text-slate-400 font-sans">/mo (billed annually)</span>`;
        if (couplePrice) couplePrice.innerHTML = `KSh 4,160 <span class="text-xs font-normal text-slate-400 font-sans">/mo (billed annually)</span>`;
        if (execPrice) execPrice.innerHTML = `KSh 6,800 <span class="text-xs font-normal text-slate-400 font-sans">/mo (billed annually)</span>`;
        showToast('Annual billing selected: 20% savings applied!', 'success');
      } else {
        if (soloPrice) soloPrice.innerHTML = `KSh 2,800 <span class="text-xs font-normal text-slate-400 font-sans">/mo</span>`;
        if (couplePrice) couplePrice.innerHTML = `KSh 5,200 <span class="text-xs font-normal text-slate-400 font-sans">/mo</span>`;
        if (execPrice) execPrice.innerHTML = `KSh 8,500 <span class="text-xs font-normal text-slate-400 font-sans">/mo</span>`;
      }
      if (window.SoundEffects) window.SoundEffects.playSwitch();
    });
  }

  // FAQ Accordions
  document.querySelectorAll('[data-faq-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('[data-faq-icon]');
      const isOpen = !content.classList.contains('hidden');

      // Close all
      document.querySelectorAll('[data-faq-btn]').forEach(b => {
        b.nextElementSibling.classList.add('hidden');
        const ic = b.querySelector('[data-faq-icon]');
        if (ic) ic.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
      if (window.SoundEffects) window.SoundEffects.playPop();
    });
  });

  // Initialize all modular components
  if (window.SoapBubbleEngine) window.SoapBubbleEngine.init('hero-bubbles-field');
  if (window.WasherSimulator) window.WasherSimulator.init();
  if (window.WrinkleEraser) window.WrinkleEraser.init();
  if (window.SockGame) window.SockGame.init();
  if (window.LaundryCalculator) window.LaundryCalculator.init();
  if (window.OrderTracker) window.OrderTracker.init();
  if (window.CareDecoder) window.CareDecoder.init();
  if (window.BeforeAfterSlider) window.BeforeAfterSlider.init();
  if (window.EcoCalculator) window.EcoCalculator.init();
  if (window.BookingWizard) window.BookingWizard.init();
  if (window.AdminPortal) window.AdminPortal.init();

  // Create Lucide Icons
  if (window.lucide) window.lucide.createIcons();
});
