/* ============================================================
   nvis-field.js — Tool Logic
   HF NVIS Field Estimator
   ============================================================ */

(function() {

    /* Ensure HFUtils exists */
    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    /* Grab UI elements */
    const freqEl = document.getElementById("nvisFreq");
    const heightEl = document.getElementById("nvisHeight");
    const wireEl = document.getElementById("nvisWire");
    const calcBtn = document.getElementById("nvisCalc");

    const outWavelength = document.getElementById("nvisWavelength");
    const outRatio = document.getElementById("nvisRatio");
    const outAngle = document.getElementById("nvisAngle");
    const outRadius = document.getElementById("nvisRadius");
    const outSuitability = document.getElementById("nvisSuitability");

    if (!calcBtn) {
        console.error("NVIS Field UI not found");
        return;
    }

    /* ========================================================
       Coverage Radius Estimation
       (Very simplified NVIS model)
       ======================================================== */
    function estimateRadius(angleDeg) {
        if (angleDeg >= 75) return "0–150 miles";
        if (angleDeg >= 60) return "150–250 miles";
        if (angleDeg >= 45) return "250–350 miles";
        return "350+ miles (not NVIS‑dominant)";
    }

    /* ========================================================
       NVIS Suitability Rating
       ======================================================== */
    function nvisSuitability(angleDeg) {
        if (angleDeg >= 75) return "Excellent NVIS";
        if (angleDeg >= 60) return "Good NVIS";
        if (angleDeg >= 45) return "Borderline NVIS";
        return "Poor NVIS (DX‑leaning)";
    }

    /* ========================================================
       Main Calculation Handler
       ======================================================== */
    calcBtn.addEventListener("click", () => {

        const freq = parseFloat(freqEl.value);
        const height = parseFloat(heightEl.value);
        const wire = parseFloat(wireEl.value);

        if (!freq || !height || !wire) {
            outWavelength.textContent = "—";
            outRatio.textContent = "—";
            outAngle.textContent = "—";
            outRadius.textContent = "—";
            outSuitability.textContent = "—";
            return;
        }

        /* Wavelength */
        const wl = HFUtils.wavelength(freq);
        outWavelength.textContent = `${wl.toFixed(1)} ft`;

        /* Height/Wavelength Ratio */
        const ratio = height / wl;
        outRatio.textContent = ratio.toFixed(2);

        /* NVIS Angle (from HFUtils) */
        const angle = HFUtils.nvisAngle(height, freq);
        outAngle.textContent = angle ? `${angle}°` : "—";

        /* Coverage Radius */
        const radius = estimateRadius(angle);
        outRadius.textContent = radius;

        /* Suitability */
        const suit = nvisSuitability(angle);
        outSuitability.textContent = suit;

    });

})();
