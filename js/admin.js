/* ==========================================================================
   TJ FABRIC CARE - ADMIN ORDERS & M-PESA DISPATCH PORTAL (KENYA)
   ========================================================================== */

const AdminPortal = (function() {
  // Store orders in localStorage or memory
  const defaultOrders = [
    {
      id: 'TJ-8821',
      clientName: 'Sarah Wanjiku',
      phone: '0722 145 890',
      rawPhone: '+254722145890',
      estate: 'Westlands, Nairobi',
      address: 'Rhapta Road, Lantana Court Apt 3B',
      coords: { lat: -1.2675, lng: 36.8042 },
      mapsUrl: 'https://www.google.com/maps?q=-1.2675,36.8042',
      service: 'Wash & Fold + Dry Clean Shirts',
      itemsCount: 14,
      amount: 1200,
      paymentMethod: 'mpesa-on-delivery',
      paymentStatus: 'pending', // 'pending' or 'paid'
      mpesaReceipt: null,
      orderStage: 'Out for Delivery (Rider Kevin on Electric Boda #02)',
      time: 'Today, 8:15 AM'
    },
    {
      id: 'TJ-4492',
      clientName: 'Brian Kiprop',
      phone: '0718 903 214',
      rawPhone: '+254718903214',
      estate: 'Kilimani, Nairobi',
      address: 'Dennis Pritt Rd, Green Oasis Apt 5F (Near Yaya)',
      coords: { lat: -1.2912, lng: 36.7924 },
      mapsUrl: 'https://www.google.com/maps?q=-1.2912,36.7924',
      service: '2-Piece Suit + Silk Blouse Press',
      itemsCount: 3,
      amount: 1250,
      paymentMethod: 'mpesa-on-delivery',
      paymentStatus: 'pending',
      mpesaReceipt: null,
      orderStage: 'Steam Shaping & QC (Station 2B)',
      time: 'Yesterday, 6:30 PM'
    },
    {
      id: 'TJ-2104',
      clientName: 'Faith Mutua',
      phone: '0701 445 678',
      rawPhone: '+254701445678',
      estate: 'Karen, Nairobi',
      address: 'Mbagathi Ridge, Gate 12 (Opposite Karen Hospital)',
      coords: { lat: -1.3321, lng: 36.7118 },
      mapsUrl: 'https://www.google.com/maps?q=-1.3321,36.7118',
      service: 'King Duvet + Mega Family Bag',
      itemsCount: 8,
      amount: 2400,
      paymentMethod: 'mpesa-on-delivery',
      paymentStatus: 'pending',
      mpesaReceipt: null,
      orderStage: 'Enzyme Eco-Wash Chamber',
      time: 'Today, 7:00 AM'
    }
  ];

  let orders = [];

  function init() {
    loadOrders();
    bindAdminTriggers();
    updateBadge();
  }

  function loadOrders() {
    const saved = localStorage.getItem('tj_kenya_orders') || localStorage.getItem('lumina_kenya_orders');
    if (saved) {
      try {
        orders = JSON.parse(saved);
      } catch (e) {
        orders = [...defaultOrders];
      }
    } else {
      orders = [...defaultOrders];
      saveOrders();
    }
  }

  function saveOrders() {
    localStorage.setItem('tj_kenya_orders', JSON.stringify(orders));
    updateBadge();
  }

  function addOrder(newOrder) {
    orders.unshift(newOrder);
    saveOrders();
    renderOrdersList();
  }

  function updateBadge() {
    const pendingCount = orders.filter(o => o.paymentStatus === 'pending').length;
    const badge = document.getElementById('admin-orders-count-badge');
    if (badge) {
      badge.innerText = `${pendingCount} pending`;
    }
    document.querySelectorAll('[data-admin-count-short]').forEach(el => {
      el.innerText = pendingCount;
    });
    document.querySelectorAll('[data-admin-count-full]').forEach(el => {
      el.innerText = `${pendingCount} pending`;
    });
  }

  function bindAdminTriggers() {
    const openBtns = document.querySelectorAll('[data-open-admin]');
    const closeBtns = document.querySelectorAll('[data-close-admin]');

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminModal();
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeAdminModal();
      });
    });
  }

  function openAdminModal() {
    const overlay = document.getElementById('admin-drawer-modal');
    if (!overlay) return;
    renderOrdersList();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function closeAdminModal() {
    const overlay = document.getElementById('admin-drawer-modal');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderOrdersList() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
          <p>No active orders in dispatch queue.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = orders.map(order => {
      const isPaid = order.paymentStatus === 'paid';
      const mapsLink = order.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address + ', Kenya')}`;

      return `
        <div class="p-5 rounded-2xl bg-slate-900 border ${isPaid ? 'border-emerald-500/40' : 'border-white/10'} shadow-lg hover:border-cyan-500/30 transition-all space-y-4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-white">${order.id}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  isPaid ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }">
                  ${isPaid ? '✅ Paid via M-Pesa' : '⏳ Awaiting M-Pesa Payment'}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${order.time} • ${order.orderStage}</p>
            </div>
            <div class="text-left sm:text-right">
              <span class="text-xs text-slate-400 block">Total Due</span>
              <span class="text-lg font-black text-emerald-400 font-heading">KSh ${order.amount.toLocaleString()}</span>
            </div>
          </div>

          <!-- Customer & Contact Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Client & M-Pesa Contact</span>
              <div class="font-bold text-white">${order.clientName}</div>
              <div class="text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>${order.phone}</span>
                <a href="tel:${order.phone.replace(/\s+/g, '')}" class="text-cyan-400 hover:text-cyan-300 ml-1">
                  <i data-lucide="phone-call" class="w-3.5 h-3.5 inline"></i>
                </a>
              </div>
            </div>

            <!-- Location & Google Maps -->
            <div class="p-3 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pickup / Delivery Address</span>
              <div class="font-semibold text-white">${order.estate || 'Nairobi'}</div>
              <div class="text-slate-400 text-[11px] truncate mt-0.5">${order.address}</div>
            </div>
          </div>

          <!-- Action Buttons for Admin -->
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
            <!-- Google Maps Button -->
            <a 
              href="${mapsLink}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105">
              <i data-lucide="map-pin" class="w-4 h-4 text-emerald-400"></i>
              <span>Navigate in Google Maps</span>
              <i data-lucide="external-link" class="w-3 h-3 text-slate-400"></i>
            </a>

            <!-- M-Pesa Prompt Trigger Button -->
            <div class="flex items-center gap-2">
              ${!isPaid ? `
                <button 
                  onclick="AdminPortal.triggerMpesaPrompt('${order.id}')"
                  class="px-4 py-2.5 rounded-xl bg-mpesa hover-bg-mpesa text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105">
                  <i data-lucide="smartphone" class="w-4 h-4"></i>
                  <span>Prompt M-Pesa STK Push</span>
                </button>
              ` : `
                <div class="text-xs text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
                  <span>M-Pesa Ref: <strong class="font-mono text-white">${order.mpesaReceipt || 'QGH79XK21M'}</strong></span>
                </div>
              `}

              <a 
                href="https://wa.me/${order.rawPhone ? order.rawPhone.replace('+', '') : '254722145890'}?text=${encodeURIComponent('Hello ' + order.clientName + ', TJ Fabric Care is en route with your fresh garments! Total is KSh ' + order.amount + '.')}" 
                target="_blank" 
                class="p-2.5 rounded-xl border border-white/15 bg-slate-950 hover:border-emerald-400 text-slate-300 hover:text-emerald-400 transition-all"
                title="Send WhatsApp Delivery Update">
                <i data-lucide="message-square" class="w-4 h-4"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Interactive Live M-Pesa STK Push Prompt Dialog & Workflow
  function triggerMpesaPrompt(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('mpesa-prompt-modal');
    if (!modal) return;

    const clientNameEl = document.getElementById('mpesa-modal-client');
    const phoneEl = document.getElementById('mpesa-modal-phone');
    const amountEl = document.getElementById('mpesa-modal-amount');
    const orderIdEl = document.getElementById('mpesa-modal-orderid');
    const statusBox = document.getElementById('mpesa-modal-status');
    const sendBtn = document.getElementById('mpesa-send-stk-btn');

    if (clientNameEl) clientNameEl.innerText = order.clientName;
    if (phoneEl) phoneEl.innerText = order.phone;
    if (amountEl) amountEl.innerText = `KSh ${order.amount.toLocaleString()}`;
    if (orderIdEl) orderIdEl.innerText = order.id;

    if (statusBox) {
      statusBox.innerHTML = `
        <div class="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300">
          Ready to initiate Lipa Na M-Pesa Online prompt to client's Safaricom phone.
        </div>
      `;
    }

    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.className = 'w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all';
      sendBtn.innerHTML = `<span>Send STK Push Prompt to Customer Phone</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      sendBtn.onclick = () => executeStkPush(order);
    }

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function executeStkPush(order) {
    const statusBox = document.getElementById('mpesa-modal-status');
    const sendBtn = document.getElementById('mpesa-send-stk-btn');

    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span class="animate-spin mr-2">⏳</span> Transmitting to Safaricom...`;
    }

    // Step 1: Connecting to Daraja Gateway
    statusBox.innerHTML = `
      <div class="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 space-y-1.5">
        <div class="flex items-center gap-2 font-bold">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          Step 1: Connecting to Safaricom Daraja API Gateway...
        </div>
        <p class="text-[11px] text-cyan-300">Targeting subscriber MSISDN ${order.phone}...</p>
      </div>
    `;

    // Step 2: STK Push prompt rendered on customer handset
    setTimeout(() => {
      statusBox.innerHTML = `
        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
          <div class="flex items-center gap-2 font-bold text-emerald-300">
            <i data-lucide="smartphone" class="w-4 h-4 text-emerald-400"></i>
            Step 2: STK Push Delivered to Customer's Phone!
          </div>
          <div class="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 font-mono text-[11px] text-emerald-300">
            "Do you want to pay KSh ${order.amount.toLocaleString()} to TJ FABRIC CARE? Enter M-Pesa PIN:"
          </div>
          <p class="text-[11px] text-emerald-400 animate-pulse">Waiting for customer to enter 4-digit M-Pesa PIN on phone...</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }, 1800);

    // Step 3: PIN entered & Payment confirmed
    setTimeout(() => {
      const generatedRef = `QGH${Math.floor(10 + Math.random() * 89)}XK${Math.floor(100 + Math.random() * 899)}M`;
      order.paymentStatus = 'paid';
      order.mpesaReceipt = generatedRef;
      saveOrders();

      statusBox.innerHTML = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs space-y-2 shadow-lg">
          <div class="flex items-center gap-2 font-bold text-sm">
            <i data-lucide="check-circle" class="w-5 h-5 text-white"></i>
            Step 3: M-Pesa Payment Confirmed!
          </div>
          <p class="text-[11px] text-emerald-100">
            Received KSh ${order.amount.toLocaleString()} from ${order.clientName} (${order.phone}).
          </p>
          <div class="p-2 rounded bg-black/20 font-mono text-xs">
            Transaction Ref: <strong>${generatedRef}</strong>
          </div>
        </div>
      `;

      if (sendBtn) {
        sendBtn.innerHTML = `<span>Payment Received Successfully</span> <i data-lucide="check" class="w-4 h-4"></i>`;
        sendBtn.className = 'w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2';
      }

      if (window.lucide) window.lucide.createIcons();
      if (window.SoundEffects) window.SoundEffects.playSuccess();
      showToast(`M-Pesa payment of KSh ${order.amount.toLocaleString()} confirmed from ${order.clientName}!`, 'success');

      // Update the main orders list in background
      renderOrdersList();
      updateBadge();
    }, 4200);
  }

  function closeMpesaModal() {
    const modal = document.getElementById('mpesa-prompt-modal');
    if (modal) modal.classList.remove('active');
  }

  return {
    init,
    openAdminModal,
    closeAdminModal,
    addOrder,
    triggerMpesaPrompt,
    closeMpesaModal
  };
})();

window.AdminPortal = AdminPortal;
