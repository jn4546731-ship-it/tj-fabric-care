/* ==========================================================================
   TJ FABRIC CARE - CARE LABEL DECODER & FABRIC DOCTOR
   ========================================================================== */

const CareDecoder = (function() {
  const symbolCategories = {
    wash: [
      { id: 'wash-30', symbol: '🧼 30°', label: 'Machine Wash Cold (30°C / 85°F)', warning: 'High heat will shrink fibers and fade pigments.', solution: 'TJ Fabric Care uses cold ozone-infused cycles that sanitize deeply without thermal damage.' },
      { id: 'wash-40', symbol: '🧼 40°', label: 'Machine Wash Warm (40°C / 105°F)', warning: 'Standard cycle for cottons and blends. Avoid high spin for delicates.', solution: 'TJ Fabric Care adjusts dynamic spin RPMs based on load weight to avoid fabric stretching.' },
      { id: 'wash-hand', symbol: '🖐️ 🛁', label: 'Hand Wash Delicate Only', warning: 'Agitation in conventional home washers will fray seams and tear lace.', solution: 'Processed in our specialized continuous gentle ripple bath with zero drum abrasion.' },
      { id: 'wash-no', symbol: '🚫 🛁', label: 'Do Not Wash (Water Prohibited)', warning: 'Water will permanently misshape, dissolve sizing, or warp canvas linings.', solution: '100% Eco-Solvent or tension air-steam cycle only.' }
    ],
    bleach: [
      { id: 'bleach-no', symbol: '🚫 ⚠️', label: 'Do Not Bleach', warning: 'Chlorine bleach will dissolve synthetic elastic fibers and turn whites dingy yellow.', solution: 'We use color-safe oxygen-activated enzymes that brighten without chlorine.' },
      { id: 'bleach-non', symbol: '📐 🌿', label: 'Non-Chlorine Bleach When Needed', warning: 'Harsh chemicals will strip color fastness.', solution: 'Natural mineral percarbonate brightening baths.' }
    ],
    dry: [
      { id: 'dry-tumble-no', symbol: '🚫 🌀', label: 'Do Not Tumble Dry', warning: 'Centrifugal heat will felt wool and warp knit collars permanently.', solution: 'Static moisture extraction chambers with conditioned airflow.' },
      { id: 'dry-flat', symbol: '➖ 🧺', label: 'Dry Flat (Never Hang)', warning: 'Hanging heavy wet wool or cashmere pulls sweaters out of shape by up to 3 inches.', solution: 'Heated microfiber flat-bed drying stations.' }
    ],
    iron: [
      { id: 'iron-low', symbol: '🔥 110°', label: 'Cool Iron (Max 110°C / 230°F)', warning: 'Poly and silk will melt or glaze shiny if ironed directly.', solution: 'Teflon-shielded pressurized steam tables with zero hot plate contact.' },
      { id: 'iron-no', symbol: '🚫 👔', label: 'Do Not Iron', warning: 'High thermal contact will burn thermal bonded materials.', solution: 'Vertical air-mist relaxer chambers.' }
    ],
    dryclean: [
      { id: 'dc-only', symbol: '⭕ (P)', label: 'Dry Clean Only (Wet Cleaning Prohibited)', warning: 'Home washing creates irreversible shrinkage on tailored interlinings.', solution: 'Eco-pure closed-loop hydrocarbon wet-clean technology. Zero perchloroethylene odor.' },
      { id: 'dc-f', symbol: '⭕ (F)', label: 'Petroleum Solvent Only (Ultra-Delicate)', warning: 'Requires gentle hydrocarbon treatment without harsh chemical solvents.', solution: 'Our premium TJ Fabric Care Gold luxury solvent bath.' }
    ]
  };

  const emergencyStains = {
    'wine': {
      name: 'Red Wine & Sangria',
      icon: 'glass-water',
      urgency: 'Treat within 4 hours for 100% recovery',
      diyDo: 'Dab gently with clean cold water and paper towel. Sprinkle table salt or club soda if available.',
      diyDont: 'NEVER rub aggressively (drives tannins into core fibers) and NEVER apply hot water or an iron.',
      tjProtocol: 'Cold oxygenation bath + tannin-specific botanical enzyme pre-spotting under vacuum suction.'
    },
    'coffee': {
      name: 'Espresso & Latte',
      icon: 'coffee',
      urgency: 'Treat same day before heat sets tannins',
      diyDo: 'Rinse from the BACK of the fabric with cold water to push stain outwards.',
      diyDont: 'Do not use hand soap with moisturizers (binds grease to dairy proteins).',
      tjProtocol: 'Dual surfactant lipid emulsifier followed by steam-injected microfiber extraction.'
    },
    'oil': {
      name: 'Olive Oil, Butter & Salad Dressing',
      icon: 'droplet',
      urgency: 'Medium urgency (oil binds stubborn without lipids)',
      diyDo: 'Dust with cornstarch or baby powder to absorb excess liquid surface grease.',
      diyDont: 'Do not wash in standard washer and dry with heat — baked-in oil becomes permanent.',
      tjProtocol: 'Dry ultrasonic spotting board with bio-degreasing agent and zero residue rinse.'
    },
    'ink': {
      name: 'Ballpoint Ink & Marker',
      icon: 'edit-3',
      urgency: 'High urgency — solvent sensitive',
      diyDo: 'Place a dry paper towel behind the mark. Lightly dab with 70% rubbing alcohol.',
      diyDont: 'Do not apply hairspray (modern hairsprays contain sticky polymers).',
      tjProtocol: 'Micro-pipette targeted ink dissolving solvent with continuous vacuum extraction.'
    },
    'makeup': {
      name: 'Liquid Foundation & Lipstick',
      icon: 'sparkles',
      urgency: 'Treat before laundering',
      diyDo: 'Gently scrape away excess surface waxy residue with the edge of a credit card.',
      diyDont: 'Do not use water alone; wax repels water and spreads pigments.',
      tjProtocol: 'Cosmetic wax dissolution followed by pigment lifting micro-rinse.'
    }
  };

  let activeSymbol = symbolCategories.wash[0];
  let activeStain = 'wine';

  function init() {
    renderSymbolButtons();
    renderSymbolDetail();
    renderStainButtons();
    renderStainDetail();
  }

  function renderSymbolButtons() {
    const container = document.getElementById('care-symbol-grid');
    if (!container) return;

    const allSymbols = [
      ...symbolCategories.wash,
      ...symbolCategories.bleach,
      ...symbolCategories.dry,
      ...symbolCategories.iron,
      ...symbolCategories.dryclean
    ];

    container.innerHTML = allSymbols.map(s => `
      <button 
        onclick="CareDecoder.selectSymbol('${s.id}')"
        class="care-icon-btn p-3 rounded-2xl border text-center transition-all bg-slate-950/70 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-cyan-500/40 ${
          activeSymbol.id === s.id ? 'selected ring-2 ring-cyan-400/40 border-cyan-400 bg-cyan-500/15' : 'border-white/10 text-slate-300'
        }">
        <span class="text-xl sm:text-2xl">${s.symbol}</span>
        <span class="text-[10px] font-semibold tracking-tight text-slate-300 truncate max-w-full">${s.label.split('(')[0]}</span>
      </button>
    `).join('');
  }

  function selectSymbol(id) {
    const allSymbols = [
      ...symbolCategories.wash,
      ...symbolCategories.bleach,
      ...symbolCategories.dry,
      ...symbolCategories.iron,
      ...symbolCategories.dryclean
    ];
    const found = allSymbols.find(s => s.id === id);
    if (found) {
      activeSymbol = found;
      renderSymbolButtons();
      renderSymbolDetail();
      if (window.SoundEffects) window.SoundEffects.playPop();
    }
  }

  function renderSymbolDetail() {
    const container = document.getElementById('care-symbol-detail');
    if (!container || !activeSymbol) return;

    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-slate-900/85 border border-cyan-500/25 shadow-xl backdrop-blur-md">
        <div class="flex items-center gap-4 pb-4 border-b border-white/10">
          <div class="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/15 shrink-0">
            ${activeSymbol.symbol}
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">Care Label Diagnosis</span>
            <h4 class="text-lg sm:text-xl font-bold text-white font-heading mt-0.5">${activeSymbol.label}</h4>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
            <div>
              <strong class="font-semibold text-amber-300">The Risk at Home:</strong> ${activeSymbol.warning}
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 flex items-start gap-2.5">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <strong class="font-semibold text-emerald-300">The TJ Care Protocol:</strong> ${activeSymbol.solution}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function renderStainButtons() {
    const container = document.getElementById('stain-pills-list');
    if (!container) return;

    container.innerHTML = Object.keys(emergencyStains).map(key => {
      const item = emergencyStains[key];
      const isSelected = activeStain === key;
      return `
        <button 
          onclick="CareDecoder.selectStain('${key}')"
          class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            isSelected 
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-950/70 border border-white/10 text-slate-300 hover:border-cyan-500/40'
          }">
          <i data-lucide="${item.icon}" class="w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}"></i>
          <span>${item.name}</span>
        </button>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function selectStain(key) {
    if (emergencyStains[key]) {
      activeStain = key;
      renderStainButtons();
      renderStainDetail();
      if (window.SoundEffects) window.SoundEffects.playPop();
    }
  }

  function renderStainDetail() {
    const container = document.getElementById('stain-detail-card');
    if (!container) return;

    const data = emergencyStains[activeStain];
    if (!data) return;

    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-slate-900/85 border border-white/10 shadow-xl backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <i data-lucide="${data.icon}" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-bold text-white text-base font-heading">${data.name} Emergency Protocol</h4>
              <p class="text-xs text-rose-400 font-semibold">${data.urgency}</p>
            </div>
          </div>
          <button onclick="LaundryCalculator.loadPreset('executive')" class="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 self-start sm:self-auto">
            Book Spot Care <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">✅ DO THIS RIGHT NOW</span>
            <p class="text-xs sm:text-sm text-slate-300">${data.diyDo}</p>
          </div>

          <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
            <span class="text-xs font-bold text-rose-300 uppercase tracking-wider block mb-1">❌ NEVER DO THIS</span>
            <p class="text-xs sm:text-sm text-slate-300">${data.diyDont}</p>
          </div>

          <div class="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
            <span class="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-1">🔬 TJ LAB PROTOCOL</span>
            <p class="text-xs sm:text-sm text-slate-300">${data.tjProtocol || data.luminaProtocol}</p>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  return {
    init,
    selectSymbol,
    selectStain
  };
})();

window.CareDecoder = CareDecoder;
