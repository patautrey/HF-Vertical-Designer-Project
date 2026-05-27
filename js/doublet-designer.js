/* ============================================================
   doublet-designer.js — Tool Logic
   HF Doublet Designer
   ============================================================ */

(function() {

    /* Ensure HFUtils exists */
    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    /* Grab UI elements */
    const wireEl = document.getElementById("dblWire");
    const ladderEl = document.getElementById("dblLadder");
    const zEl = document.getElementById("dblZ");
    const bandsEl = document.getElementById("dblBands");
    const calcBtn = document.getElementById("dblCalc");

    const outImpedance = document.getElementById("dblImpedance");
    const outCoverage = document.getElementById("dblCoverage");
    const outTuner = document.getElementById("dblTuner");

    if (!calcBtn) {
        console.error("Doublet Designer UI not found");
        return;
    }

    /* ========================================================
       Band Coverage Estimation
       ======================================================== */
    function bandCoverage(wireFt, bands) {
        const easy = [];
        const hard = [];
        const no = [];

        bands.forEach(b => {
            const wl = HFUtils.wavelength(b);
            const ratio = wireFt / wl;

            if (ratio > 0.2 && ratio < 1.5) easy.push(b);
            else if (ratio >= 1.5 && ratio < 3) hard.push(b);
            else no.push(b);
        });

        return { easy, hard, no };
    }

    /* ========================================================
       Tuner Recommendation
       ======================================================== */
    function tunerRecommendation(impedanceText) {
        if (impedanceText.includes("low")) return "Internal tuner OK";
        if (impedanceText.includes("moderate")) return "External tuner recommended";
        return "High-power balanced tuner required";
    }

    /* ========================================================
       Main Calculation Handler
       ======================================================== */
    calcBtn.addEventListener("click", () => {

        const wire = parseFloat(wireEl.value);
        const ladder = parseFloat(ladderEl.value);
        const z = parseFloat(zEl.value);
        const bandsRaw = bandsEl.value;

        if (!wire || !ladder || !z || !bandsRaw) {
            outImpedance.textContent = "—";
            outCoverage.textContent = "—";
            outTuner.textContent = "—";
            return;
        }

        /* Parse bands */
        const bands = bandsRaw
            .split(",")
            .map(b => parseFloat(b.trim()))
            .filter(b => !isNaN(b));

        if (bands.length === 0) {
            outCoverage.textContent = "Invalid band list";
            return;
        }

        /* Impedance tendency (from HFUtils) */
        const imp = HFUtils.doubletImpedance(wire, ladder, z);
        outImpedance.textContent = imp;

        /* Band coverage */
        const cov = bandCoverage(wire, bands);

        const covText =
            `Easy: ${cov.easy.join(", ") || "None"} | ` +
            `Hard: ${cov.hard.join(", ") || "None"} | ` +
            `No: ${cov.no.join(", ") || "None"}`;

        outCoverage.textContent = covText;

        /* Tuner recommendation */
        outTuner.textContent = tunerRecommendation(imp);

    });

})();
