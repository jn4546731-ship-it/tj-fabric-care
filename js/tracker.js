/* ==========================================================================
   TJ FABRIC CARE - REAL-TIME ORDER TRACKER SIMULATION (KENYA)
   ========================================================================== */

const OrderTracker = (function() {
  const mockOrders = {
    'TJ-8821': {
      id: 'TJ-8821',
      client: 'Sarah Wanjiku',
      location: 'Rhapta Road, Westlands, Nairobi',
      coords: { lat: -1.2675, lng: 36.8042 },
      mapsUrl: 'https://www.google.com/maps?q=-1.2675,36.8042',
      placedAt: 'Today, 8:15 AM',
      currentStageIndex: 4, // 0: Booked, 1: Picked Up, 2: Eco-Wash, 3: Steam & QC, 4: Out for Delivery, 5: Delivered
      eta: '18 mins away (Passing Sarit Centre)',
      driver: {
        name: 'Kevin Otieno',
        rating: '4.99 ★',
        vehicle: 'TJ Electric Boda #02 (Nairobi)',
        phone: '+254 700 882 100'
      },
      climateControl: {
        temp: '20.5°C',
        humidity: '42% RH (Anti-Wrinkle Garment Box Active)'
      },
      items: [
        { name: 'Poplin Dress Shirt (Crisp Collar)', tag: 'RFID-9921', status: 'Pressed & Hung' },
        { name: 'Italian Merino Wool Knit', tag: 'RFID-9922', status: 'Flat-dry & Conditioned' },
        { name: 'Wash & Fold Signature Bag (32 pcs)', tag: 'RFID-9923', status: 'Cube-Folded in Canvas' },
        { name: 'Nike Air Max 90 Revival', tag: 'RFID-9924', status: 'Cleaned, Deodorized & Boxed' }
      ]
    },
    'TJ-4492': {
      id: 'TJ-4492',
      client: 'Brian Kiprop',
      location: 'Dennis Pritt Road, Kilimani, Nairobi',
      coords: { lat: -1.2912, lng: 36.7924 },
      mapsUrl: 'https://www.google.com/maps?q=-1.2912,36.7924',
      placedAt: 'Yesterday, 6:30 PM',
      currentStageIndex: 3,
      eta: 'Estimated Delivery: Today at 4:30 PM',
      driver: {
        name: 'Elena Wambui (Master Presser)',
        rating: '5.0 ★',
        vehicle: 'Station 2B - Kilimani Artisan Pressing Hub',
        phone: '+254 700 882 100'
      },
      climateControl: {
        temp: '22.0°C',
        humidity: '40% RH'
      },
      items: [
        { name: 'Navy 2-Piece Wool Suit', tag: 'RFID-4411', status: 'Hand-Finished & Steamed' },
        { name: 'Silk Button-Down Blouse', tag: 'RFID-4412', status: 'Tension Formed' },
        { name: 'Trench Coat with Leather Trim', tag: 'RFID-4413', status: 'Water-Repel Seal Applied' }
      ]
    },
    'TJ-2104': {
      id: 'TJ-2104',
      client: 'Faith Mutua',
      location: 'Mbagathi Ridge, Karen, Nairobi',
      coords: { lat: -1.3321, lng: 36.7118 },
      mapsUrl: 'https://www.google.com/maps?q=-1.3321,36.7118',
      placedAt: 'Today, 7:00 AM',
      currentStageIndex: 2,
      eta: 'Estimated Delivery: Tomorrow at 10:00 AM',
      driver: {
        name: 'Chamber #4 - Eco-Enzyme Wash Hub',
        rating: 'Zero-Waste Cycle',
        vehicle: 'Water Recovery Unit 1 (Nairobi)',
        phone: '+254 700 882 100'
      },
      climateControl: {
        temp: '32.0°C',
        humidity: 'Delicate Wash'
      },
      items: [
        { name: 'Egyptian Cotton Bedding Set', tag: 'RFID-2101', status: 'Ozone Sanitizing Cycle' },
        { name: 'Standard Wash & Fold Bag', tag: 'RFID-2102', status: 'Enzyme Soak (Lavender Scent)' }
      ]
    }
  };

  const stages = [
    { title: 'Order Booked', desc: 'Pickup window reserved & dispatch notified', icon: 'calendar-check' },
    { title: 'Picked Up & Tagged', desc: 'Individual RFID security barcodes attached', icon: 'scan' },
    { title: 'Eco-Enzyme Wash & Ozone', desc: 'Fiber-safe treatment with zero toxic perc', icon: 'droplets' },
    { title: 'Steam Shaping & QC Check', desc: '12-point defect check & wrinkle-free finish', icon: 'sparkles' },
    { title: 'Out for Delivery', desc: 'Electric courier navigation en route to your pin', icon: 'truck' },
    { title: 'Delivered & M-Pesa Paid', desc: 'Handoff complete & M-Pesa PIN validated', icon: 'check-circle' }
  ];

  let currentOrder = mockOrders['TJ-8821'];

  function init() {
    bindEvents();
    renderTracker();
  }

  function bindEvents() {
    const searchForm = document.getElementById('tracker-search-form');
    const searchInput = document.getElementById('tracker-search-input');
    const presetBtns = document.querySelectorAll('[data-track-preset]');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = searchInput.value.trim().toUpperCase();
        lookupOrder(code);
      });
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-track-preset');
        if (searchInput) searchInput.value = code;
        lookupOrder(code);
      });
    });
  }

  function lookupOrder(code) {
    if (!code) {
      showToast('Please enter a tracking ID', 'warning');
      return;
    }

    if (mockOrders[code]) {
      currentOrder = mockOrders[code];
      showToast(`Tracking details loaded for ${code}`, 'success');
    } else {
      currentOrder = {
        id: code,
        client: 'Valued Client',
        location: 'Nairobi Delivery Radius',
        coords: { lat: -1.286389, lng: 36.817223 },
        mapsUrl: 'https://www.google.com/maps?q=-1.286389,36.817223',
        placedAt: 'Today, Recently',
        currentStageIndex: 3,
        eta: 'In Nairobi Facility • On Schedule for 24h delivery',
        driver: {
          name: 'TJ Nairobi Dispatch Concierge',
          rating: '4.99 ★',
          vehicle: 'Smart Routing Hub (Westlands)',
          phone: '+254 700 882 100'
        },
        climateControl: {
          temp: '21.0°C',
          humidity: '45% RH (Optimal Safe Environment)'
        },
        items: [
          { name: 'Custom Care Batch', tag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`, status: 'Quality Assured & Steamed' },
          { name: 'Zero-Waste Reusable Garment Tote', tag: 'RFID-TOTE', status: 'Sealed & Secured' }
        ]
      };
      showToast(`Simulating live status for order #${code}`, 'info');
    }

    if (window.SoundEffects) window.SoundEffects.playPop();
    renderTracker();
  }

  function renderTracker() {
    const trackerContainer = document.getElementById('tracker-display-card');
    if (!trackerContainer || !currentOrder) return;

    const mapsLink = currentOrder.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrder.location || 'Nairobi')}`;

    trackerContainer.innerHTML = `
      <div class="p-6 sm:p-8 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-cyan-500/25 shadow-2xl text-slate-100">
        <!-- Order Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 live-beacon">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                LIVE STATUS
              </span>
              <span class="text-xs text-slate-400 font-medium">${currentOrder.placedAt}</span>
            </div>
            <h3 class="text-2xl sm:text-3xl font-bold text-white mt-2 font-heading flex items-center gap-2">
              Order #${currentOrder.id}
            </h3>
            <p class="text-sm text-slate-400 mt-0.5">
              Client: <span class="font-bold text-white">${currentOrder.client}</span> • 
              <span class="text-slate-300">${currentOrder.location || 'Nairobi'}</span>
            </p>
          </div>
          <div class="text-left sm:text-right bg-cyan-500/10 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-cyan-500/20">
            <span class="text-xs font-medium uppercase tracking-wider text-cyan-400 block">Current Estimated Arrival</span>
            <div class="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-heading">${currentOrder.eta}</div>
            <span class="text-xs text-slate-400 mt-1 block">Zero-Delay Guarantee Active</span>
          </div>
        </div>

        <!-- Simulated Interactive Courier Banner with Google Maps Location -->
        ${currentOrder.currentStageIndex >= 4 ? `
          <div class="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-emerald-500/25 text-white flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="flex items-center gap-4 z-10 w-full md:w-auto">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg shadow-emerald-500/30 shrink-0">
                <i data-lucide="bike" class="w-7 h-7"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-white text-base">${currentOrder.driver.name}</h4>
                  <span class="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold px-2 py-0.5 rounded-md">${currentOrder.driver.rating}</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">${currentOrder.driver.vehicle}</p>
                <div class="flex items-center gap-3 mt-1.5 text-xs text-cyan-300 font-mono">
                  <span>🌡️ ${currentOrder.climateControl.temp}</span>
                  <span>💧 ${currentOrder.climateControl.humidity}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 w-full md:w-auto justify-end z-10">
              <a 
                href="${mapsLink}" 
                target="_blank" 
                class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                View Pin on Google Maps
              </a>
              <a 
                href="tel:0700882100" 
                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/15 flex items-center gap-2 transition-all">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-cyan-400"></i>
                Call Rider
              </a>
            </div>
          </div>
        ` : `
          <div class="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
              </div>
              <div>
                <h5 class="text-sm font-bold text-white">${currentOrder.driver.name}</h5>
                <p class="text-xs text-slate-400">Fabric protection & ozone sterilization strictly monitored</p>
              </div>
            </div>
            <a href="${mapsLink}" target="_blank" class="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Customer Destination Pin</span>
            </a>
          </div>
        `}

        <!-- 6-Stage Timeline -->
        <div class="mt-8">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Live Garment Journey</h4>
          <div class="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 relative">
            ${stages.map((stage, idx) => {
              const isPast = idx < currentOrder.currentStageIndex;
              const isCurrent = idx === currentOrder.currentStageIndex;

              return `
                <div class="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition-all ${
                  isCurrent 
                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-300/60 scale-105' 
                    : isPast 
                      ? 'bg-emerald-500/10 border border-emerald-500/35 text-slate-200' 
                      : 'bg-slate-950/70 border border-white/10 text-slate-500 opacity-60'
                }">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-sm font-bold ${
                    isCurrent 
                      ? 'bg-slate-950 text-cyan-400 shadow-md' 
                      : isPast 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-500'
                  }">
                    ${isPast ? '<i data-lucide="check" class="w-5 h-5"></i>' : idx + 1}
                  </div>
                  <h5 class="text-xs font-bold leading-tight ${isCurrent ? 'text-slate-950 font-black' : 'text-slate-200'}">${stage.title}</h5>
                  <p class="text-[10px] sm:text-[11px] mt-1 line-clamp-2 ${isCurrent ? 'text-slate-900 font-medium' : 'text-slate-400'}">${stage.desc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tagged Garment Inventory -->
        <div class="mt-8 pt-6 border-t border-white/10">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400"></i>
              <h4 class="text-sm font-bold text-white font-heading">Garment Security Manifest (${currentOrder.items.length} items logged)</h4>
            </div>
            <span class="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <i data-lucide="check" class="w-3 h-3"></i> 100% Zero-Loss Tracked
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${currentOrder.items.map(item => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/75 border border-white/10 text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span class="font-medium text-slate-200">${item.name}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">${item.tag}</span>
                  <span class="font-medium text-cyan-300 bg-cyan-500/15 border border-cyan-500/25 px-2 py-0.5 rounded-full text-[11px]">${item.status}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function registerNewOrder(orderData) {
    mockOrders[orderData.id] = orderData;
    currentOrder = orderData;
    renderTracker();
  }

  return {
    init,
    lookupOrder,
    registerNewOrder
  };
})();

window.OrderTracker = OrderTracker;
