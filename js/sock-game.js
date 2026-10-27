/* ==========================================================================
   TJ FABRIC CARE - "THE LOST SOCK MATCHER" MINI-GAME
   ========================================================================== */

const SockGame = (function() {
  const pairsData = [
    { id: 1, name: 'Safaricom Argyle', icon: '🧦', color: 'from-emerald-600 to-green-500', label: 'Argyle Green' },
    { id: 2, name: 'Polka Dot Luxe', icon: '🧦', color: 'from-sky-500 to-cyan-400', label: 'Polka Cyan' },
    { id: 3, name: 'Urban Striped Crew', icon: '🧦', color: 'from-amber-500 to-orange-400', label: 'Orange Stripe' }
  ];

  let deck = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let canFlip = true;
  let moves = 0;

  function init() {
    bindTriggers();
  }

  function bindTriggers() {
    document.querySelectorAll('[data-open-sock-game]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openGameModal();
      });
    });

    document.querySelectorAll('[data-close-sock-game]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeGameModal();
      });
    });
  }

  function openGameModal() {
    const modal = document.getElementById('sock-game-modal');
    if (!modal) return;
    resetGame();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.SoundEffects) window.SoundEffects.playPop();
  }

  function closeGameModal() {
    const modal = document.getElementById('sock-game-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function resetGame() {
    matchedPairs = 0;
    moves = 0;
    flippedCards = [];
    canFlip = true;

    // Create 6 cards (2 of each pair)
    deck = [];
    pairsData.forEach(pair => {
      deck.push({ ...pair, cardId: Math.random(), matched: false });
      deck.push({ ...pair, cardId: Math.random(), matched: false });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);

    renderBoard();
  }

  function renderBoard() {
    const board = document.getElementById('sock-game-board');
    const movesEl = document.getElementById('sock-game-moves');
    const matchedEl = document.getElementById('sock-game-matched');
    const winBox = document.getElementById('sock-game-win-card');

    if (movesEl) movesEl.innerText = `Moves: ${moves}`;
    if (matchedEl) matchedEl.innerText = `Pairs Found: ${matchedPairs}/3`;
    if (winBox) winBox.classList.add('hidden');

    if (!board) return;

    board.innerHTML = deck.map((card, idx) => `
      <div 
        onclick="SockGame.handleCardClick(${idx})"
        id="sock-card-${idx}"
        class="h-28 sm:h-32 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 p-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform select-none shadow-md ${
          card.matched ? 'bg-gradient-to-tr ' + card.color + ' border-white/60 scale-95' : 'hover:scale-105'
        }">
        ${card.matched ? `
          <span class="text-3xl">${card.icon}</span>
          <span class="text-[10px] font-bold text-white mt-1 text-center">${card.label}</span>
          <span class="text-[9px] text-emerald-100 font-semibold">Matched!</span>
        ` : `
          <span class="text-2xl text-slate-500">❓</span>
          <span class="text-[10px] text-slate-400 font-bold uppercase mt-1">TJ Sock</span>
        `}
      </div>
    `).join('');
  }

  function handleCardClick(idx) {
    if (!canFlip) return;
    const card = deck[idx];
    if (card.matched) return;
    if (flippedCards.length === 1 && flippedCards[0].idx === idx) return;

    // Flip card face up visually
    const cardEl = document.getElementById(`sock-card-${idx}`);
    if (cardEl) {
      cardEl.className = `h-28 sm:h-32 rounded-2xl bg-gradient-to-tr ${card.color} border-2 border-white p-2 flex flex-col items-center justify-center cursor-pointer shadow-lg transform scale-105 transition-all`;
      cardEl.innerHTML = `
        <span class="text-3xl animate-bounce">${card.icon}</span>
        <span class="text-[10px] font-bold text-white mt-1 text-center">${card.label}</span>
      `;
    }

    if (window.SoundEffects) window.SoundEffects.playPop();

    flippedCards.push({ idx, card });

    if (flippedCards.length === 2) {
      moves++;
      const movesEl = document.getElementById('sock-game-moves');
      if (movesEl) movesEl.innerText = `Moves: ${moves}`;
      canFlip = false;
      checkMatch();
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards;

    if (first.card.id === second.card.id) {
      // Match found!
      deck[first.idx].matched = true;
      deck[second.idx].matched = true;
      matchedPairs++;

      const matchedEl = document.getElementById('sock-game-matched');
      if (matchedEl) matchedEl.innerText = `Pairs Found: ${matchedPairs}/3`;

      if (window.SoundEffects) window.SoundEffects.playSuccess();
      flippedCards = [];
      canFlip = true;

      renderBoard();

      if (matchedPairs === 3) {
        handleVictory();
      }
    } else {
      // No match - flip back
      setTimeout(() => {
        const card1 = document.getElementById(`sock-card-${first.idx}`);
        const card2 = document.getElementById(`sock-card-${second.idx}`);

        if (card1) {
          card1.className = 'h-28 sm:h-32 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 p-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300';
          card1.innerHTML = `<span class="text-2xl text-slate-500">❓</span><span class="text-[10px] text-slate-400 font-bold uppercase mt-1">TJ Sock</span>`;
        }
        if (card2) {
          card2.className = 'h-28 sm:h-32 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 p-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300';
          card2.innerHTML = `<span class="text-2xl text-slate-500">❓</span><span class="text-[10px] text-slate-400 font-bold uppercase mt-1">TJ Sock</span>`;
        }

        flippedCards = [];
        canFlip = true;
      }, 900);
    }
  }

  function handleVictory() {
    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    const winBox = document.getElementById('sock-game-win-card');
    if (winBox) {
      winBox.classList.remove('hidden');
    }

    // Auto-apply promo code to calculator
    const promoInput = document.getElementById('calc-promo-input');
    if (promoInput) {
      promoInput.value = 'SOCKMASTER500';
      const applyBtn = document.getElementById('calc-apply-promo');
      if (applyBtn) applyBtn.click();
    }

    showToast('🎉 YOU WON! Promo code SOCKMASTER500 applied (-KSh 500 off)', 'success');
  }

  return {
    init,
    openGameModal,
    closeGameModal,
    handleCardClick,
    resetGame
  };
})();

window.SockGame = SockGame;
