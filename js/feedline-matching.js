/* ============================================================
   feedline-matching.js — Tool Logic
   HF Feedline & Matching Calculator
   ============================================================ */

(function() {

    /* Grab UI elements */
    const freqEl = document.getElementById("fmFreq");
    const swrEl = document.getElementById("fmSWR");
    const lenEl = document.getElementById("fmLength");
    const typeEl = document.getElementById("fmType");
    const calcBtn = document.getElementById("fmCalc");

    const outLoss = document.getElementById("fmLoss");
    const outPower = document.getElementById("fmPower");
    const outTransformed = document.getElementById("fmTransformed");
    const outMatch = document.getElementById("fmMatch");

    if (!calcBtn) {
        console.error("Feedline Matching UI not found");
        return;
    }

    /* ========================================================
       Feedline Loss Table (dB per 100 ft @ 30 MHz)
       ======================================================== */
    const lossTable = {
        rg8x:   3.2,
        rg213:  1.5,
        lmr240: 2.1,
        lmr400: 0.7,
        ladder450: 0.1
    };

    /* ========================================================
       Frequency Scaling
       Loss ∝ sqrt(frequency)
       ======================================================== */
    function scaledLoss(baseLoss, freqMHz) {
        return baseLoss * Math.sqrt(freqMHz / 30);
    }

    /* ========================================================
       SWR Transformation (approximate)
       ======================================================== */
    function transformSWR(swr, lengthFt, freqMHz) {
        if (!swr || swr < 1) return 1;

        const wl = 984 / freqMHz;
        const electricalLength = (lengthFt / wl) * 360;

        const radians = electricalLength * (Math.PI / 180);
        const transformed = swr + (Math.sin(radians) * (swr - 1));

        return Math.max(1, transformed.toFixed(2));
    }

    /* ========================================================
       Matching Recommendation
       ======================================================== */
    function recommendMatch(swr) {
        if (swr <= 2) return "No matching required";
        if (swr <= 3) return "Internal tuner OK";
        if (swr <= 5) return "External tuner recommended";
        return "Use 4:1 or 9:1 transformer";
    }

    /* ========================================================
       Main Calculation Handler
       ======================================================== */
    calcBtn.addEventListener("click", () => {

        const freq = parseFloat(freqEl.value);
        const swr = parseFloat(swrEl.value);
        const length = parseFloat(lenEl.value);
        const type = typeEl.value;

        if (!freq || !swr || !length) {
            outLoss.textContent = "—";
            outPower.textContent = "—";
            outTransformed.textContent = "—";
            outMatch.textContent = "—";
            return;
        }

        /* Base loss for selected feedline */
        const baseLoss = lossTable[type];
        const lossPer100 = scaledLoss(baseLoss, freq);

        /* Total loss */
        const totalLoss = (lossPer100 * (length / 100)).toFixed(2);
        outLoss.textContent = `${totalLoss} dB`;

        /* Delivered power */
        const delivered = (100 * Math.pow(10, -totalLoss / 10)).toFixed(1);
        outPower.textContent = `${delivered}%`;

        /* Transformed SWR */
        const transformed = transformSWR(swr, length, freq);
        outTransformed.textContent = transformed;

        /* Matching recommendation */
        outMatch.textContent = recommendMatch(transformed);

    });

})();
