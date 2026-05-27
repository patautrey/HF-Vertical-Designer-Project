/* ============================================================
   nvis-field.js — Tool Logic
   HF NVIS Field Estimator
   ============================================================ */

(function() {

    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    const freqEl = document.getElementById("nvisFreq");
    const heightEl = document.getElementById("nvisHeight");
    const wireEl = document.getElementById("nvisWire");
    const calcBtn = document.getElementById("nvisCalc");
    const exportBtn = document.getElementById("nvisExport");

    const outWavelength = document.getElementById("nvisWavelength");
    const outRatio = document.getElementById("nvisRatio");
    const outAngle = document.getElementById("nvisAngle");
    const outRadius = document.getElementById("nvisRadius");
    const outSuitability = document.getElementById("nvisSuitability");

    if (!calcBtn) {
        console.error("NVIS Field UI not found");
        return;
    }

    function estimateRadius(angleDeg) {
        if (angleDeg >= 75) return "0–150 miles";
        if (angleDeg >= 60) return "150–250 miles";
        if (angleDeg >= 45) return "250–350 miles";
        return "350+ miles (not NVIS‑dominant)";
    }

    function nvisSuitability(angleDeg) {
        if (angleDeg >= 75) return "Excellent NVIS";
        if (angleDeg >= 60) return "Good NVIS";
        if (angleDeg >= 45) return "Borderline NVIS";
        return "Poor NVIS (DX‑leaning)";
    }

    function saveTextFile(filename, text) {
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function generateText() {
        return [
            "HF Tools Suite — KG5IEF",
            `Exported: ${new Date().toLocaleString()}`,
            "Tool: NVIS Field Estimator",
            "",
            "Inputs:",
            `  Frequency: ${freqEl.value || "—"} MHz`,
            `  Antenna Height: ${heightEl.value || "—"} ft`,
            `  Antenna Length: ${wireEl.value || "—"} ft`,
            "",
            "Results:",
            `  Wavelength: ${outWavelength.textContent}`,
            `  Height/Wavelength Ratio: ${outRatio.textContent}`,
            `  Estimated NVIS Angle: ${outAngle.textContent}`,
            `  Coverage Radius: ${outRadius.textContent}`,
            `  NVIS Suitability: ${outSuitability.textContent}`,
            ""
        ].join("\n");
    }

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

        const wl = HFUtils.wavelength(freq);
        outWavelength.textContent = `${wl.toFixed(1)} ft`;

        const ratio = height / wl;
        outRatio.textContent = ratio.toFixed(2);

        const angle = HFUtils.nvisAngle(height, freq);
        outAngle.textContent = angle ? `${angle}°` : "—";

        const radius = estimateRadius(angle);
        outRadius.textContent = radius;

        const suit = nvisSuitability(angle);
        outSuitability.textContent = suit;
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            saveTextFile("KG5IEF - NVIS Field Estimator.txt", generateText());
        });
    }

})();
