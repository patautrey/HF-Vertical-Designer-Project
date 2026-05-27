/* ============================================================
   random-wire.js — Tool Logic
   HF Random Wire Analyzer
   ============================================================ */

(function() {

    /* Ensure HFUtils exists */
    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    /* Grab UI elements */
    const lenEl = document.getElementById("rwLength");
    const bandsEl = document.getElementById("rwBands");
    const calcBtn = document.getElementById("rwCalc");

    const outClass = document.getElementById("rwClass");
    const outCoverage = document.getElementById("rwCoverage");
    const outMatch = document.getElementById("rwMatch");

    if (!calcBtn) {
        console.error("Random Wire UI not found");
        return;
    }

    /* ========================================================
       Avoid-Length Classification
       ======================================================== */
    function classifyLength(lengthFt) {
        const avoid = [32, 64, 96, 128, 160];
        const near = avoid.some(a => Math.abs(a - lengthFt) <= 2);

        if (avoid.includes(lengthFt)) return "Avoid length (high impedance)";
        if (near) return "Borderline (near avoid-length)";
        if (lengthFt < 20) return "Too short for HF";
        if (lengthFt > 200) return "Very long (may require strong tuner)";
        return "Safe random-wire length";
    }

    /* ========================================================
       Band Coverage Estimation
       ======================================================== */
    function bandCoverage(lengthFt, bands) {
        const good = [];
        const marginal = [];
        const poor = [];

        bands.forEach(b => {
            const wl = HFUtils.wavelength(b);
            const ratio = lengthFt / wl;

            if (ratio > 0.15 && ratio < 0.75) good.push(b);
            else if (ratio >= 0.75 && ratio < 1.5) marginal.push(b);
            else poor.push(b);
        });

        return { good, marginal, poor };
    }

    /* ========================================================
       Matching Recommendation
       ======================================================== */
    function matchRecommendation(classification) {
        if (classification.includes("Avoid")) return "Use 9:1 unun + tuner";
        if (classification.includes("Borderline")) return "External tuner recommended";
        if (classification.includes("Too short")) return "Not recommended";
        if (classification.includes("Very long")) return "Balanced tuner recommended";
        return "Internal tuner usually OK";
    }

    /* ========================================================
       Main Calculation Handler
       ======================================================== */
    calcBtn.addEventListener("click", () => {

        const length = parseFloat(lenEl.value);
        const bandsRaw = bandsEl.value;

        if (!length || !bandsRaw) {
            outClass.textContent = "—";
            outCoverage.textContent = "—";
            outMatch.textContent = "—";
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

        /* Classification */
        const cls = classifyLength(length);
        outClass.textContent = cls;

        /* Band coverage */
        const cov = bandCoverage(length, bands);

        const covText =
            `Good: ${cov.good.join(", ") || "None"} | ` +
            `Marginal: ${cov.marginal.join(", ") || "None"} | ` +
            `Poor: ${cov.poor.join(", ") || "None"}`;

        outCoverage.textContent = covText;

        /* Matching recommendation */
        outMatch.textContent = matchRecommendation(cls);

    });

})();
