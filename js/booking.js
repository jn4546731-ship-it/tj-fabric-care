/* ==========================================================================
   TJ FABRIC CARE - 60-SECOND BOOKING WIZARD & M-PESA CHECKOUT (KENYA)
   ========================================================================== */

const BookingWizard = (function() {
  let currentStep = 1;
  const totalSteps = 4;

  const bookingState = {
    serviceType: 'wash-fold',
    clientName: 'Brian Kiprop',
    phone: '0712 345 678',
    estate: 'Westlands, Nairobi',
    address: 'Rhapta Road, Lantana Court Apt 3B',
    coords: { lat: -1.2675, lng: 36.8042 }, // Default Nairobi Coords
    mapsUrl: 'https://www.google.com/maps?q=-1.2675,36.8042',
    handoff: 'doorstep',
    pickupDate: 'tomorrow',
    pickupSlot: 'morning',
    paymentMode: 'mpesa-on-delivery',
    speed: 'standard',
    scent: 'French Lavender & Bergamot',
    specialNotes: '',
    confirmedOrder: null
  };

  function init() {
    bindModalTriggers();
    bindStepButtons();
    bindSelectionCards();
    bindGpsLocator();
  }

  function bindModalTriggers() {
    const openBtns = document.querySelectorAll('[data-open-booking]');
    const closeBtns = document.querySelectorAll('[data-close-booking]');
    const modal = document.getElementById('booking-modal');

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    // Check if user has items in calculator
    if (window.LaundryCalculator) {
      const calcData = window.LaundryCalculator.getCalculatedData();
      if (calcData && calcData.data && calcData.data.itemCount > 0) {
        bookingState.customCart = calcData.data;
        const banner = document.getElementById('booking-cart-detected');
        if (banner) {
          banner.classList.remove('hidden');
          banner.innerHTML = `
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <span class="font-medium">Using ${calcData.data.itemCount} items from your Price Calculator (KSh ${calcData.data.finalTotal.toLocaleString()})</span>
              <span class="font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Synced</span>
            </div>
          `;
        }
      }
    }

    currentStep = 1;
    renderStep();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function closeModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function bindSelectionCards() {
    // Service selection
    document.querySelectorAll('[data-book-service]').forEach(card => {
      card.addEventListener('click', () => {
        bookingState.serviceType = card.getAttribute('data-book-service');
        document.querySelectorAll('[data-book-service]').forEach(c => {
          c.classList.remove('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
          c.classList.add('border-slate-200');
        });
        card.classList.add('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
        card.classList.remove('border-slate-200');
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // Handoff type
    document.querySelectorAll('[data-book-handoff]').forEach(card => {
      card.addEventListener('click', () => {
        bookingState.handoff = card.getAttribute('data-book-handoff');
        document.querySelectorAll('[data-book-handoff]').forEach(c => {
          c.classList.remove('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
          c.classList.add('border-slate-200');
        });
        card.classList.add('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
        card.classList.remove('border-slate-200');
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // Time slot
    document.querySelectorAll('[data-book-slot]').forEach(card => {
      card.addEventListener('click', () => {
        bookingState.pickupSlot = card.getAttribute('data-book-slot');
        document.querySelectorAll('[data-book-slot]').forEach(c => {
          c.classList.remove('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
          c.classList.add('border-slate-200');
        });
        card.classList.add('border-sky-500', 'bg-sky-50/70', 'ring-2', 'ring-sky-200');
        card.classList.remove('border-slate-200');
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });

    // M-Pesa Payment Mode
    document.querySelectorAll('[data-book-payment]').forEach(card => {
      card.addEventListener('click', () => {
        bookingState.paymentMode = card.getAttribute('data-book-payment');
        document.querySelectorAll('[data-book-payment]').forEach(c => {
          c.classList.remove('border-mpesa', 'bg-emerald-50/70', 'ring-2', 'ring-emerald-200');
          c.classList.add('border-slate-200');
        });
        card.classList.add('border-mpesa', 'bg-emerald-50/70', 'ring-2', 'ring-emerald-200');
        card.classList.remove('border-slate-200');
        if (window.SoundEffects) window.SoundEffects.playSwitch();
      });
    });
  }

  // Live Location & GPS Detection via HTML5 Geolocation API
  function bindGpsLocator() {
    const gpsBtn = document.getElementById('booking-detect-gps-btn');
    if (!gpsBtn) return;

    gpsBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'warning');
        return;
      }

      gpsBtn.disabled = true;
      gpsBtn.innerHTML = `<span class="animate-spin mr-1">📍</span> Acquiring live GPS satellite lock...`;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          bookingState.coords = { lat, lng };
          bookingState.mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          gpsBtn.disabled = false;
          gpsBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> <span>Live GPS Location Locked (±${accuracy}m)</span>`;
          gpsBtn.className = 'w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2';

          // Update Location Badge & Google Maps Link
          const gpsStatusBadge = document.getElementById('booking-gps-badge');
          if (gpsStatusBadge) {
            gpsStatusBadge.classList.remove('hidden');
            gpsStatusBadge.innerHTML = `
              <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 gps-pulse"></span>
                  <span>Coordinates: <strong>${lat.toFixed(4)}, ${lng.toFixed(4)}</strong></span>
                </div>
                <a href="${bookingState.mapsUrl}" target="_blank" class="text-sky-600 font-bold hover:underline flex items-center gap-1">
                  Preview in Maps <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
              </div>
            `;
          }

          const addrInput = document.getElementById('booking-address-input');
          if (addrInput && !addrInput.value.includes('GPS')) {
            addrInput.value = `Live GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)}) - ` + (addrInput.value || 'Nairobi Gate / Apt');
          }

          if (window.lucide) window.lucide.createIcons();
          if (window.SoundEffects) window.SoundEffects.playSuccess();
          showToast(`Exact GPS Location Locked! Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
        },
        (error) => {
          gpsBtn.disabled = false;
          gpsBtn.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4 text-sky-600"></i> <span>Detect My Live GPS Location</span>`;
          showToast('GPS permission denied or timeout. Please type your estate / road below.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  function bindStepButtons() {
    const nextBtn = document.getElementById('booking-next-btn');
    const prevBtn = document.getElementById('booking-prev-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          // Validation Step 2: Customer Contact & M-Pesa Info
          if (currentStep === 2) {
            const nameInput = document.getElementById('booking-name-input');
            const phoneInput = document.getElementById('booking-phone-input');
            const estateSelect = document.getElementById('booking-estate-select');
            const addrInput = document.getElementById('booking-address-input');

            if (nameInput && !nameInput.value.trim()) {
              showToast('Please enter your full name', 'warning');
              nameInput.focus();
              return;
            }
            if (phoneInput && (!phoneInput.value.trim() || phoneInput.value.trim().length < 9)) {
              showToast('Please enter a valid Kenyan Safaricom M-Pesa phone number (e.g. 0712 345 678)', 'warning');
              phoneInput.focus();
              return;
            }
            if (addrInput && !addrInput.value.trim()) {
              showToast('Please provide your specific apartment or gate address', 'warning');
              addrInput.focus();
              return;
            }

            bookingState.clientName = nameInput ? nameInput.value.trim() : 'Valued Client';
            bookingState.phone = phoneInput ? phoneInput.value.trim() : '0722 000 000';
            bookingState.estate = estateSelect ? estateSelect.value : 'Nairobi';
            bookingState.address = addrInput ? addrInput.value.trim() : 'Nairobi';
            if (!bookingState.mapsUrl) {
              bookingState.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingState.address + ', ' + bookingState.estate + ', Kenya')}`;
            }
          }

          currentStep++;
          renderStep();
          if (window.SoundEffects) window.SoundEffects.playPop();
        } else if (currentStep === totalSteps) {
          completeBooking();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          renderStep();
          if (window.SoundEffects) window.SoundEffects.playPop();
        }
      });
    }
  }

  function renderStep() {
    for (let i = 1; i <= totalSteps; i++) {
      const panel = document.getElementById(`booking-step-${i}`);
      if (panel) panel.classList.add('hidden');
    }

    const currentPanel = document.getElementById(`booking-step-${currentStep}`);
    if (currentPanel) currentPanel.classList.remove('hidden');

    for (let i = 1; i <= totalSteps; i++) {
      const dot = document.getElementById(`step-indicator-${i}`);
      if (dot) {
        if (i === currentStep) {
          dot.className = 'w-8 h-2.5 rounded-full bg-sky-600 transition-all';
        } else if (i < currentStep) {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 transition-all';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-200 transition-all';
        }
      }
    }

    const stepLabel = document.getElementById('booking-step-label');
    if (stepLabel) stepLabel.innerText = `Step ${currentStep} of ${totalSteps}`;

    const prevBtn = document.getElementById('booking-prev-btn');
    const nextBtn = document.getElementById('booking-next-btn');

    if (prevBtn) {
      if (currentStep === 1) {
        prevBtn.classList.add('invisible');
      } else {
        prevBtn.classList.remove('invisible');
      }
    }

    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.innerHTML = `<span>Confirm & Reserve with M-Pesa</span> <i data-lucide="sparkles" class="w-4 h-4"></i>`;
        nextBtn.className = 'px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:opacity-95 flex items-center gap-2';
      } else {
        nextBtn.innerHTML = `<span>Continue</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
        nextBtn.className = 'px-6 py-3 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 flex items-center gap-2';
      }
    }

    if (currentStep === 4) {
      renderConfirmationReview();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderConfirmationReview() {
    const reviewBox = document.getElementById('booking-review-summary');
    if (!reviewBox) return;

    const specialInput = document.getElementById('booking-notes-input');
    if (specialInput) {
      bookingState.specialNotes = specialInput.value.trim();
    }

    const slotNames = {
      'morning': 'Morning Wave (7:00 AM – 9:00 AM)',
      'lunch': 'Lunch Express (12:00 PM – 2:00 PM)',
      'evening': 'Evening Rush (6:00 PM – 8:00 PM)',
      'night': 'Night Owl (8:00 PM – 10:00 PM)'
    };

    const handoffNames = {
      'doorstep': 'Doorstep Drop (TJ Safe-Lock Bag provided)',
      'doorman': 'Front Desk / Security Gate Concierge',
      'inperson': 'Direct In-Person Handoff to Courier'
    };

    let estPrice = 'KSh 850';
    let numericAmount = 850;
    if (bookingState.customCart && bookingState.customCart.finalTotal) {
      numericAmount = bookingState.customCart.finalTotal;
      estPrice = `KSh ${numericAmount.toLocaleString()}`;
    }

    bookingState.calculatedPrice = numericAmount;

    reviewBox.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">Client Name:</span>
          <span class="font-bold text-slate-900">${bookingState.clientName}</span>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">M-Pesa Safaricom Number:</span>
          <span class="font-mono font-bold text-emerald-700">${bookingState.phone}</span>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">Location & Area:</span>
          <span class="font-semibold text-slate-900 text-right">${bookingState.estate} • ${bookingState.address}</span>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">Google Maps Pin:</span>
          <a href="${bookingState.mapsUrl}" target="_blank" class="font-bold text-sky-600 hover:underline flex items-center gap-1">
            Open Pin <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">Pickup Window:</span>
          <span class="font-semibold text-slate-900">${slotNames[bookingState.pickupSlot] || 'Morning Wave'}</span>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-200">
          <span class="text-slate-500">Payment Channel:</span>
          <span class="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            M-Pesa STK Push on Delivery
          </span>
        </div>
        <div class="flex justify-between pt-1">
          <span class="text-slate-500">Total Due (Payable on Return):</span>
          <span class="font-black text-emerald-700 text-base font-heading">${estPrice}</span>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function completeBooking() {
    const randomCode = `TJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = bookingState.calculatedPrice || 850;

    const orderData = {
      id: randomCode,
      clientName: bookingState.clientName,
      phone: bookingState.phone,
      rawPhone: bookingState.phone.startsWith('0') ? '+254' + bookingState.phone.substring(1).replace(/\s+/g, '') : bookingState.phone,
      estate: bookingState.estate,
      address: bookingState.address,
      coords: bookingState.coords,
      mapsUrl: bookingState.mapsUrl,
      service: bookingState.serviceType.replace('-', ' ').toUpperCase(),
      itemsCount: (bookingState.customCart ? bookingState.customCart.itemCount : 1),
      amount: totalCost,
      paymentMethod: bookingState.paymentMode,
      paymentStatus: 'pending',
      mpesaReceipt: null,
      orderStage: 'Pickup Confirmed • Electric Boda / Van Assigned',
      time: 'Just Now'
    };

    // Push into Admin Orders & Dispatch Portal!
    if (window.AdminPortal) {
      window.AdminPortal.addOrder(orderData);
    }

    // Push into live Order Tracker Radar
    if (window.OrderTracker) {
      const trackerOrder = {
        id: randomCode,
        client: bookingState.clientName,
        placedAt: 'Just Now',
        currentStageIndex: 0,
        eta: 'Electric Boda Dispatched Tomorrow 7:30 AM',
        driver: {
          name: 'Assigned Courier: Kevin Otieno',
          rating: '4.99 ★',
          vehicle: 'TJ Eco-Boda #08 (Nairobi)',
          phone: '+254 700 882 100'
        },
        climateControl: {
          temp: '20.5°C',
          humidity: '42% RH'
        },
        items: [
          { name: 'Your Fresh Care Batch', tag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`, status: 'Lock-Bag Dispatched' },
          { name: 'Complimentary TJ Organic Canvas Hamper', tag: 'RFID-GIFT', status: 'Gift Included' }
        ]
      };
      window.OrderTracker.registerNewOrder(trackerOrder);
    }

    if (window.SoundEffects) window.SoundEffects.playSuccess();
    if (window.confetti) {
      window.confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }

    // Render receipt with direct Google Maps link & M-Pesa details
    const modalBody = document.getElementById('booking-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="text-center py-6">
          <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i data-lucide="check" class="w-10 h-10"></i>
          </div>
          <span class="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Pickup Confirmed • M-Pesa Integrated
          </span>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-heading">
            Asante, ${bookingState.clientName}!
          </h3>
          <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Your tracking ID is <span class="font-bold text-sky-600 font-mono text-base">${randomCode}</span>. Our courier will navigate straight to your GPS pin.
          </p>

          <div class="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-sm mx-auto text-xs space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="text-slate-500">M-Pesa Phone:</span>
              <span class="font-mono font-bold text-emerald-700">${bookingState.phone}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Amount Due on Return:</span>
              <span class="font-bold text-slate-900 font-mono text-sm">KSh ${totalCost.toLocaleString()}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Location Pin:</span>
              <a href="${bookingState.mapsUrl}" target="_blank" class="font-bold text-sky-600 hover:underline flex items-center gap-1">
                View in Google Maps <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">M-Pesa Mode:</span>
              <span class="font-semibold text-emerald-700">Admin Prompts PIN upon delivery</span>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onclick="BookingWizard.goToTracker('${randomCode}')"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:bg-sky-500 flex items-center justify-center gap-2">
              <i data-lucide="navigation" class="w-4 h-4"></i>
              Track Live Order
            </button>
            <button 
              onclick="BookingWizard.closeModal(); AdminPortal.openAdminModal();"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2">
              <i data-lucide="shield" class="w-4 h-4 text-emerald-400"></i>
              View in Admin Dispatch
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function goToTracker(trackingCode) {
    closeModal();
    const trackerSection = document.getElementById('order-tracker');
    if (trackerSection) {
      trackerSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (window.OrderTracker) {
      window.OrderTracker.lookupOrder(trackingCode);
    }
  }

  return {
    init,
    openModal,
    closeModal,
    goToTracker
  };
})();

window.BookingWizard = BookingWizard;
