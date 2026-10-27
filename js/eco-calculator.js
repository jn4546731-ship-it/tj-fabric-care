/* ==========================================================================
   TJ FABRIC CARE - ECO-SAVINGS & TIME-RECLAIMED DASHBOARD
   ========================================================================== */

const EcoCalculator = (function() {
  let loadsPerWeek = 3;

  function init() {
    const slider = document.getElementById('eco-loads-slider');
    const displayCount = document.getElementById('eco-loads-count');

    if (slider) {
      slider.addEventListener('input', (e) => {
        loadsPerWeek = parseInt(e.target.value, 10);
        if (displayCount) {
          displayCount.innerText = `${loadsPerWeek} ${loadsPerWeek === 1 ? 'load' : 'loads'} / week`;
        }
        recalculate();
      });
      slider.addEventListener('change', () => {
        if (window.SoundEffects) window.SoundEffects.playPop();
      });
    }

    recalculate();
  }

  function recalculate() {
    const annualLoads = loadsPerWeek * 52;

    // Water: Home washer ~42 gallons/load vs TJ Fabric Care ~12 gallons/load -> saves 30 gal/load
    const waterSavedGallons = Math.round(annualLoads * 30);

    // Time: Sorting, washing, transferring, folding, ironing = ~3.25 hrs per load. TJ Fabric Care = 2 mins (drop bag).
    const hoursSaved = Math.round(annualLoads * 3.2);
    const daysReclaimed = (hoursSaved / 24).toFixed(1);

    // Plastic bags eliminated
    const plasticBagsSaved = Math.round(annualLoads * 2.4);

    // Microplastics captured (grams)
    const microplasticsFilteredGrams = (annualLoads * 18.5).toFixed(0);

    // Carbon offset equivalent (kg CO2 via solar-powered dryers and EV van logistics)
    const carbonOffsetKg = Math.round(annualLoads * 4.8);

    // Update DOM
    const waterEl = document.getElementById('eco-water-saved');
    const timeEl = document.getElementById('eco-time-saved');
    const daysEl = document.getElementById('eco-days-saved');
    const plasticEl = document.getElementById('eco-plastic-saved');
    const microplasticsEl = document.getElementById('eco-microplastics-saved');
    const carbonEl = document.getElementById('eco-carbon-saved');

    if (waterEl) waterEl.innerText = `${waterSavedGallons.toLocaleString()} gal`;
    if (timeEl) timeEl.innerText = `${hoursSaved.toLocaleString()} hrs`;
    if (daysEl) daysEl.innerText = `≈ ${daysReclaimed} full days back!`;
    if (plasticEl) plasticEl.innerText = `${plasticBagsSaved.toLocaleString()} bags`;
    if (microplasticsEl) microplasticsEl.innerText = `${microplasticsFilteredGrams}g`;
    if (carbonEl) carbonEl.innerText = `${carbonOffsetKg.toLocaleString()} kg`;
  }

  return {
    init,
    recalculate
  };
})();

window.EcoCalculator = EcoCalculator;
