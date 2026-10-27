/* ==========================================================================
   TJ FABRIC CARE - INTERACTIVE SOAP BUBBLES ENGINE
   ========================================================================== */

const SoapBubbleEngine = (function() {
  let container = null;
  let isActive = true;
  let spawnInterval = null;
  const maxBubbles = 15;

  function init(containerId = 'hero-bubbles-field') {
    container = document.getElementById(containerId);
    if (!container) return;

    start();
  }

  function start() {
    if (!container) return;
    isActive = true;

    // Initial batch
    for (let i = 0; i < 6; i++) {
      createBubble(Math.random() * 80 + 10);
    }

    // Ongoing spawn interval
    clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
      if (!isActive) return;
      const existing = container.querySelectorAll('.soap-bubble').length;
      if (existing < maxBubbles) {
        createBubble();
      }
    }, 1800);
  }

  function stop() {
    isActive = false;
    clearInterval(spawnInterval);
  }

  function createBubble(initialYPercent = null) {
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'soap-bubble';

    // Randomized attributes
    const size = Math.floor(Math.random() * 45) + 32; // 32px to 77px
    const leftPercent = Math.random() * 92 + 4; // 4% to 96%
    const duration = (Math.random() * 6 + 7).toFixed(1); // 7s to 13s

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPercent}%`;
    bubble.style.animationDuration = `${duration}s`;

    if (initialYPercent !== null) {
      bubble.style.bottom = `${initialYPercent}%`;
    } else {
      bubble.style.bottom = `-60px`;
    }

    // Interactive Pop on Click / Touch
    bubble.addEventListener('click', (e) => {
      popBubble(bubble, e);
    });

    bubble.addEventListener('touchstart', (e) => {
      popBubble(bubble, e.touches[0]);
    }, { passive: true });

    // Auto cleanup when animation ends
    bubble.addEventListener('animationend', () => {
      bubble.remove();
    });

    container.appendChild(bubble);
  }

  function popBubble(bubble, event) {
    if (bubble.classList.contains('popping')) return;
    bubble.classList.add('popping');

    // Play bubbly sound
    if (window.SoundEffects) {
      window.SoundEffects.playPop();
    }

    // Splash particle effect
    createSplashParticles(bubble);

    setTimeout(() => {
      bubble.remove();
    }, 160);
  }

  function createSplashParticles(bubble) {
    const rect = bubble.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 6; i++) {
      const drop = document.createElement('div');
      drop.className = 'absolute rounded-full pointer-events-none z-50';
      const dropSize = Math.random() * 6 + 3;
      drop.style.width = `${dropSize}px`;
      drop.style.height = `${dropSize}px`;
      drop.style.background = 'radial-gradient(circle, #38bdf8, #0ea5e9)';
      drop.style.left = `${centerX}px`;
      drop.style.top = `${centerY}px`;
      drop.style.boxShadow = '0 0 6px rgba(56, 189, 248, 0.8)';
      drop.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

      document.body.appendChild(drop);

      const angle = (i / 6) * Math.PI * 2;
      const distance = Math.random() * 30 + 15;
      const destX = centerX + Math.cos(angle) * distance;
      const destY = centerY + Math.sin(angle) * distance;

      requestAnimationFrame(() => {
        drop.style.transform = `translate(${destX - centerX}px, ${destY - centerY}px) scale(0)`;
        drop.style.opacity = '0';
      });

      setTimeout(() => drop.remove(), 400);
    }
  }

  return {
    init,
    start,
    stop
  };
})();

window.SoapBubbleEngine = SoapBubbleEngine;
