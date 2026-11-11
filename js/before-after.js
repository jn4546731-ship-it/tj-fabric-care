/* ==========================================================================
   TJ FABRIC CARE - INTERACTIVE BEFORE & AFTER REVIVAL SLIDER
   ========================================================================== */

const BeforeAfterSlider = (function() {
  const stories = {
    sneakers: {
      title: 'Triple-White Luxury Sneaker Restoration',
      tag: 'Footwear Spa & Oxidation Reversal',
      description: 'Midsole yellowing reversed via UV ozone bath, suede knap brushed, internal deodorization.',
      turnaround: '24 Hours',
      client: 'Marcus T. (Verified Client)',
      beforeImg: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80&sat=-60&con=30', // Muddy / worn style
      afterImg: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80', // Crisp clean style
      badge: 'Midsole Cleanse & Leather Condition'
    },
    trench: {
      title: 'Vintage Wool & Gabardine Trench Revival',
      tag: 'Artisan Wet Clean & Water-Repel',
      description: 'Decade-old collar oil ring dissolved, crease reset on high-pressure steam form, water shield restored.',
      turnaround: '36 Hours',
      client: 'Elena V. (Verified Client)',
      beforeImg: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80&sat=-70&bri=-20', // Distressed
      afterImg: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80', // Crisp pristine
      badge: 'Zero Chemical Odor • Hand Steamed'
    },
    silk: {
      title: 'Designer Silk Gown & Wine Spill Removal',
      tag: 'Delicate Fiber Extraction',
      description: 'Red wine spill lifted from delicate silk georgette without altering original botanical dye.',
      turnaround: '18 Hours (Rush Flight)',
      client: 'Chloe K. (Verified Client)',
      beforeImg: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80&sat=-40&con=50',
      afterImg: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      badge: '100% Pigment Lock Guaranteed'
    }
  };

  let activeStoryKey = 'sneakers';
  let isDragging = false;
  let currentPercentage = 50;

  function init() {
    renderTabs();
    setupSlider();
  }

  function renderTabs() {
    const tabBtns = document.querySelectorAll('[data-story-tab]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-story-tab');
        if (stories[key]) {
          activeStoryKey = key;
          tabBtns.forEach(b => {
            b.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-cyan-500', 'text-slate-950', 'font-black', 'shadow-lg', 'shadow-emerald-500/25');
            b.classList.add('bg-slate-900', 'text-slate-300', 'border', 'border-white/10');
          });
          btn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-cyan-500', 'text-slate-950', 'font-black', 'shadow-lg', 'shadow-emerald-500/25');
          btn.classList.remove('bg-slate-900', 'text-slate-300', 'border', 'border-white/10');
          loadStory(key);
          if (window.SoundEffects) window.SoundEffects.playPop();
        }
      });
    });
  }

  function loadStory(key) {
    const data = stories[key];
    if (!data) return;

    const beforeImg = document.getElementById('slider-before-img');
    const afterImg = document.getElementById('slider-after-img');
    const titleEl = document.getElementById('slider-story-title');
    const tagEl = document.getElementById('slider-story-tag');
    const descEl = document.getElementById('slider-story-desc');
    const timeEl = document.getElementById('slider-story-time');
    const clientEl = document.getElementById('slider-story-client');
    const badgeEl = document.getElementById('slider-story-badge');

    if (beforeImg) beforeImg.src = data.beforeImg;
    if (afterImg) afterImg.src = data.afterImg;
    if (titleEl) titleEl.innerText = data.title;
    if (tagEl) tagEl.innerText = data.tag;
    if (descEl) descEl.innerText = data.description;
    if (timeEl) timeEl.innerText = data.turnaround;
    if (clientEl) clientEl.innerText = data.client;
    if (badgeEl) badgeEl.innerText = data.badge;

    setSliderPosition(50);
  }

  function setupSlider() {
    const container = document.getElementById('before-after-box');
    const handle = document.getElementById('slider-drag-handle');
    if (!container || !handle) return;

    const updatePositionFromEvent = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let offsetX = clientX - rect.left;
      offsetX = Math.max(0, Math.min(offsetX, rect.width));
      const percentage = (offsetX / rect.width) * 100;
      setSliderPosition(percentage);
    };

    const startDrag = (e) => {
      isDragging = true;
      updatePositionFromEvent(e);
      document.body.style.userSelect = 'none';
    };

    const stopDrag = () => {
      isDragging = false;
      document.body.style.userSelect = '';
    };

    const onMove = (e) => {
      if (!isDragging) return;
      updatePositionFromEvent(e);
    };

    container.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mousemove', onMove);

    container.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchmove', onMove, { passive: true });

    // Sync image dimensions for proper clipping
    const resizeObserver = new ResizeObserver(() => {
      container.style.setProperty('--container-width', `${container.offsetWidth}px`);
    });
    resizeObserver.observe(container);

    setSliderPosition(50);
  }

  function setSliderPosition(percentage) {
    currentPercentage = percentage;
    const beforeWrap = document.getElementById('slider-before-wrap');
    const handleLine = document.getElementById('slider-handle-line');
    const container = document.getElementById('before-after-box');

    if (beforeWrap) {
      beforeWrap.style.width = `${percentage}%`;
    }
    if (handleLine) {
      handleLine.style.left = `${percentage}%`;
    }
    if (container) {
      container.style.setProperty('--container-width', `${container.offsetWidth}px`);
    }
  }

  return {
    init,
    loadStory
  };
})();

window.BeforeAfterSlider = BeforeAfterSlider;
