/* ==========================================================================
   TJ FABRIC CARE - INTERACTIVE PRICE & LOAD CALCULATOR (KENYA KSH)
   ========================================================================== */

const LaundryCalculator = (function() {
  // Service Catalog with Kenyan Shillings (KSh)
  const catalog = {
    washFold: [
      { id: 'wf-standard', name: 'Standard Bag (~10-15kg / 35 items)', price: 850, unit: 'bag', icon: 'shopping-bag', desc: 'Everyday tees, jeans, socks, undergarments & gym wear' },
      { id: 'wf-jumbo', name: 'Mega Family Bag (~25kg / 70 items)', price: 1500, unit: 'bag', icon: 'package', desc: 'Best value for Kenyan households & weekly backlog' },
      { id: 'wf-towels', name: 'Luxe Towel & Linen Bundle (6 pcs)', price: 700, unit: 'set', icon: 'layers', desc: 'Plush bath sheets, hand towels & bath mats' }
    ],
    dryClean: [
      { id: 'dc-shirt', name: 'Executive Dress Shirt / Blouse', price: 150, unit: 'item', icon: 'shirt', desc: 'Hand-inspected, steam-shaped, crisp collar' },
      { id: 'dc-suit', name: '2-Piece Suit (Jacket + Trouser)', price: 650, unit: 'suit', icon: 'briefcase', desc: 'Hydrocarbon zero-odor gentle eco-wet clean' },
      { id: 'dc-dress', name: 'Silk / Evening Dress / Delicates', price: 600, unit: 'item', icon: 'sparkles', desc: 'Delicate fiber-lock cycle with tension finish' },
      { id: 'dc-coat', name: 'Wool Trench / Winter Overcoat', price: 850, unit: 'item', icon: 'shield', desc: 'Deep lint removal, water-repellent conditioning' },
      { id: 'dc-knit', name: 'Cashmere / Merino Wool Knit', price: 450, unit: 'item', icon: 'feather', desc: 'Zero-shrinkage flat dry & anti-pilling treatment' }
    ],
    footwear: [
      { id: 'sn-classic', name: 'Sneaker Deep Clean & Deodorize', price: 500, unit: 'pair', icon: 'footprints', desc: 'Sole scrubbing, lace soak & UV ozone de-bacteria' },
      { id: 'sn-luxury', name: 'Designer / Suede / Leather Revival', price: 950, unit: 'pair', icon: 'crown', desc: 'Midsole unyellowing, suede nap reset & weatherproofing' }
    ],
    bulky: [
      { id: 'bk-duvet', name: 'Down Comforter / King Duvet', price: 900, unit: 'item', icon: 'cloud', desc: 'High-loft ozone fluff & allergen extraction' },
      { id: 'bk-curtains', name: 'Heavy Drapes / Curtains (Pair)', price: 1100, unit: 'pair', icon: 'align-justify', desc: 'Dust-mite eradication & steam wrinkle elimination' }
    ]
  };

  // State
  const state = {
    activeCategory: 'washFold',
    items: {},
    scent: 'lavender',
    stainTreatment: 'standard',
    speed: 'standard',
    folding: 'cube',
    promoCode: '',
    discount: 0
  };

  // Scent & Upgrade Add-ons (KSh)
  const upgrades = {
    scent: {
      lavender: { name: 'French Lavender & Bergamot', price: 0 },
      nordic: { name: 'Nordic Crisp Birch (Pure Clean)', price: 0 },
      pure: { name: 'Zero Fragrance (Hypoallergenic)', price: 0 },
      luxury: { name: 'Amber & Santal Eau de Linge', price: 150 }
    },
    stain: {
      standard: { name: 'Standard Fiber Safe Wash', price: 0 },
      targeted: { name: 'Targeted Spot Care (Wine/Oil/Coffee)', price: 200 },
      intensive: { name: 'Intensive Enzyme Bath Protocol', price: 450 }
    },
    speed: {
      standard: { name: 'Eco-Pace (24 - 36 Hours)', price: 0 },
      express: { name: 'Express Flight (< 12 Hours)', price: 350 }
    }
  };

  function init() {
    renderCategoryTabs();
    renderCatalogItems();
    bindOptionControls();
    updateSummary();
  }

  function changeCategory(catKey) {
    state.activeCategory = catKey;
    renderCategoryTabs();
    renderCatalogItems();
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function renderCategoryTabs() {
    const tabsContainer = document.getElementById('calc-category-tabs');
    if (!tabsContainer) return;

    const categories = [
      { key: 'washFold', label: 'Wash & Fold', icon: 'layers' },
      { key: 'dryClean', label: 'Dry Clean & Press', icon: 'shirt' },
      { key: 'footwear', label: 'Sneakers & Shoes', icon: 'footprints' },
      { key: 'bulky', label: 'Bedding & Bulky', icon: 'cloud' }
    ];

    tabsContainer.innerHTML = categories.map(cat => `
      <button 
        onclick="LaundryCalculator.changeCategory('${cat.key}')"
        class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
          state.activeCategory === cat.key 
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25' 
            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
        }">
        <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
        <span>${cat.label}</span>
      </button>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function renderCatalogItems() {
    const listContainer = document.getElementById('calc-items-list');
    if (!listContainer) return;

    const currentList = catalog[state.activeCategory] || [];

    listContainer.innerHTML = currentList.map(item => {
      const qty = state.items[item.id] || 0;
      return `
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <i data-lucide="${item.icon}" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="font-bold text-white text-base font-heading">${item.name}</h4>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">KSh ${item.price.toLocaleString()} / ${item.unit}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-400 mt-1">${item.desc}</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 shrink-0">
            <button 
              onclick="LaundryCalculator.updateItemQty('${item.id}', -1)"
              class="stepper-btn w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-slate-300 bg-slate-950 font-bold"
              ${qty === 0 ? 'disabled style="opacity: 0.35; cursor: not-allowed;"' : ''}>
              <i data-lucide="minus" class="w-4 h-4"></i>
            </button>
            <span class="w-8 text-center font-bold text-white font-mono text-base">${qty}</span>
            <button 
              onclick="LaundryCalculator.updateItemQty('${item.id}', 1)"
              class="stepper-btn w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-slate-300 bg-slate-950 font-bold">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function updateItemQty(itemId, delta) {
    const current = state.items[itemId] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      delete state.items[itemId];
    } else {
      state.items[itemId] = next;
    }
    renderCatalogItems();
    updateSummary();
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function bindOptionControls() {
    // Scent options
    document.querySelectorAll('[data-scent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scentKey = btn.getAttribute('data-scent');
        state.scent = scentKey;
        document.querySelectorAll('[data-scent]').forEach(b => {
          b.classList.remove('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
          b.classList.add('border-white/10', 'bg-slate-950/70');
        });
        btn.classList.add('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
        btn.classList.remove('border-white/10', 'bg-slate-950/70');
        updateSummary();
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // Stain options
    document.querySelectorAll('[data-stain]').forEach(btn => {
      btn.addEventListener('click', () => {
        const stainKey = btn.getAttribute('data-stain');
        state.stainTreatment = stainKey;
        document.querySelectorAll('[data-stain]').forEach(b => {
          b.classList.remove('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
          b.classList.add('border-white/10', 'bg-slate-950/70');
        });
        btn.classList.add('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
        btn.classList.remove('border-white/10', 'bg-slate-950/70');
        updateSummary();
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // Speed options
    document.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const speedKey = btn.getAttribute('data-speed');
        state.speed = speedKey;
        document.querySelectorAll('[data-speed]').forEach(b => {
          b.classList.remove('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
          b.classList.add('border-white/10', 'bg-slate-950/70');
        });
        btn.classList.add('border-emerald-400', 'bg-emerald-500/15', 'text-emerald-300', 'ring-2', 'ring-emerald-500/30');
        btn.classList.remove('border-white/10', 'bg-slate-950/70');
        updateSummary();
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // Promo Code button
    const promoBtn = document.getElementById('calc-apply-promo');
    const promoInput = document.getElementById('calc-promo-input');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const val = promoInput.value.trim().toUpperCase();
        if (val === 'FRESHFIRST') {
          state.promoCode = val;
          state.discount = 500;
          showToast('Promo code FRESHFIRST applied! -KSh 500 discount activated', 'success');
          if (window.SoundEffects) window.SoundEffects.playSuccess();
        } else if (val === 'SOCKMASTER500') {
          state.promoCode = val;
          state.discount = 500;
          showToast('🧦 Sock Matcher Winner code SOCKMASTER500 applied! -KSh 500 discount activated', 'success');
          if (window.SoundEffects) window.SoundEffects.playSuccess();
        } else if (val === 'ECO10') {
          state.promoCode = val;
          state.discount = 300;
          showToast('Promo code ECO10 applied! -KSh 300 discount activated', 'success');
          if (window.SoundEffects) window.SoundEffects.playSuccess();
        } else if (val === '') {
          showToast('Please enter a promo code like FRESHFIRST', 'warning');
        } else {
          showToast('Invalid promo code. Try "FRESHFIRST" for KSh 500 off!', 'warning');
        }
        updateSummary();
      });
    }
  }

  function calculateTotals() {
    let itemsSubtotal = 0;
    let totalItemCount = 0;
    const selectedItemList = [];

    const allItems = [
      ...catalog.washFold,
      ...catalog.dryClean,
      ...catalog.footwear,
      ...catalog.bulky
    ];

    Object.keys(state.items).forEach(id => {
      const qty = state.items[id];
      if (qty > 0) {
        const found = allItems.find(i => i.id === id);
        if (found) {
          const lineTotal = found.price * qty;
          itemsSubtotal += lineTotal;
          totalItemCount += qty;
          selectedItemList.push({
            ...found,
            quantity: qty,
            lineTotal: lineTotal
          });
        }
      }
    });

    const scentFee = totalItemCount > 0 ? (upgrades.scent[state.scent]?.price || 0) : 0;
    const stainFee = totalItemCount > 0 ? (upgrades.stain[state.stainTreatment]?.price || 0) : 0;
    const speedFee = totalItemCount > 0 ? (upgrades.speed[state.speed]?.price || 0) : 0;

    const rawTotal = itemsSubtotal + scentFee + stainFee + speedFee;
    const discount = Math.min(rawTotal, state.discount);
    const finalTotal = Math.max(0, rawTotal - discount);

    return {
      subtotal: itemsSubtotal,
      itemCount: totalItemCount,
      selectedItemList,
      scentFee,
      stainFee,
      speedFee,
      discount,
      finalTotal
    };
  }

  function updateSummary() {
    const data = calculateTotals();

    const countEl = document.getElementById('calc-summary-count');
    const itemsListEl = document.getElementById('calc-summary-items');
    const subtotalEl = document.getElementById('calc-summary-subtotal');
    const addOnsEl = document.getElementById('calc-summary-addons');
    const discountRowEl = document.getElementById('calc-summary-discount-row');
    const discountValEl = document.getElementById('calc-summary-discount-val');
    const grandTotalEl = document.getElementById('calc-summary-total');
    const bookBtn = document.getElementById('calc-book-btn');
    const floatTotalEl = document.getElementById('calc-float-total');

    if (countEl) countEl.innerText = `${data.itemCount} items`;
    if (subtotalEl) subtotalEl.innerText = `KSh ${data.subtotal.toLocaleString()}`;

    const addOnTotal = data.scentFee + data.stainFee + data.speedFee;
    if (addOnsEl) {
      if (addOnTotal > 0) {
        addOnsEl.innerHTML = `
          <div class="flex justify-between text-xs text-slate-400">
            <span>Specialty Add-ons:</span>
            <span class="text-cyan-400 font-semibold font-mono">+KSh ${addOnTotal.toLocaleString()}</span>
          </div>
        `;
      } else {
        addOnsEl.innerHTML = '';
      }
    }

    if (discountRowEl && discountValEl) {
      if (data.discount > 0) {
        discountRowEl.classList.remove('hidden');
        discountValEl.innerText = `-KSh ${data.discount.toLocaleString()}`;
      } else {
        discountRowEl.classList.add('hidden');
      }
    }

    if (grandTotalEl) grandTotalEl.innerText = `KSh ${data.finalTotal.toLocaleString()}`;
    if (floatTotalEl) floatTotalEl.innerText = `KSh ${data.finalTotal.toLocaleString()}`;

    if (itemsListEl) {
      if (data.selectedItemList.length === 0) {
        itemsListEl.innerHTML = `
          <div class="py-8 text-center text-slate-400 text-sm">
            <i data-lucide="shopping-bag" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
            Your care basket is empty.<br>Select items on the left to build your load.
          </div>
        `;
      } else {
        itemsListEl.innerHTML = data.selectedItemList.map(item => `
          <div class="flex items-center justify-between py-1.5 text-xs text-slate-300 border-b border-white/10 last:border-0">
            <span class="truncate max-w-[170px]">${item.quantity}x ${item.name.split('(')[0]}</span>
            <span class="font-semibold text-emerald-300 font-mono">KSh ${item.lineTotal.toLocaleString()}</span>
          </div>
        `).join('');
      }
    }

    if (bookBtn) {
      if (data.itemCount === 0) {
        bookBtn.disabled = true;
        bookBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        bookBtn.disabled = false;
        bookBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function getCalculatedData() {
    return {
      state,
      data: calculateTotals()
    };
  }

  function loadPreset(bundleType) {
    state.items = {};
    if (bundleType === 'student') {
      state.items['wf-standard'] = 1;
      state.items['dc-shirt'] = 2;
    } else if (bundleType === 'executive') {
      state.items['wf-standard'] = 1;
      state.items['dc-suit'] = 2;
      state.items['dc-shirt'] = 5;
      state.stainTreatment = 'targeted';
    } else if (bundleType === 'family') {
      state.items['wf-jumbo'] = 1;
      state.items['wf-towels'] = 1;
      state.items['bk-duvet'] = 1;
    }
    renderCatalogItems();
    updateSummary();
    if (window.SoundEffects) window.SoundEffects.playPop();

    const calcSection = document.getElementById('pricing-calculator');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return {
    init,
    changeCategory,
    updateItemQty,
    calculateTotals,
    getCalculatedData,
    loadPreset
  };
})();

window.LaundryCalculator = LaundryCalculator;
