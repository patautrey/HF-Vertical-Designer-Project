/* ============================================================
   dx-patterns.js — Tool Logic
   HF DX Pattern Explorer
   ============================================================ */

(function() {

    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    const freqEl = document.getElementById("dxFreq");
    const heightEl = document.getElementById("dxHeight");
    const lengthEl = document.getElementById("dxLength");
    const calcBtn = document.getElementById("dxCalc");
    const exportBtn = document.getElementById("dxExport");

    const outWavelength = document.getElementById("dxWavelength");
    const outRatio = document.getElementById("dxRatio");
    const outAngle = document.getElementById("dxAngle");
    const outClass = document.getElementById("dxClass");
    const outPotential = document.getElementById("dxPotential");

    if (!calcBtn) {
        console.error("DX Patterns UI not found");
        return;
    }

    function estimateAngle(heightFt, freqMHz) {
        const wl = HFUtils.wavelength(freqMHz);
        const hRatio = heightFt / wl;

        if (hRatio < 0.15) return 70;
        if (hRatio < 0.25) return 55;
        if (hRatio < 0.35) return 40;
        if (hRatio < 0.5) return 30;
        return 20;
    }

    function classifyLobes(heightFt, lengthFt, freqMHz) {
        const wl = HFUtils.wavelength(freqMHz);
        const hRatio = heightFt / wl;

        if (hRatio < 0.15) return "High-angle dominant (NVIS)";
        if (hRatio < 0.25) return "Mostly high-angle with some low-angle leakage";
        if (hRatio < 0.5) return "Mixed lobes, moderate DX potential";
        return "Low-angle dominant, strong DX potential";
    }

    function dxPotential(angle) {
        if (angle >= 60) return "Poor";
        if (angle >= 40) return "Moderate";
        if (angle >= 25) return "Good";
        return "Excellent";
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
            "Tool: DX Pattern Explorer",
            "",
            "Inputs:",
            `  Frequency: ${freqEl.value || "—"} MHz`,
            `  Antenna Height: ${heightEl.value || "—"} ft`,
            `  Antenna Length: ${lengthEl.value || "—"} ft`,
            "",
            "Results:",
            `  Wavelength: ${outWavelength.textContent}`,
            `  Height/Wavelength Ratio: ${outRatio.textContent}`,
            `  Primary Takeoff Angle: ${outAngle.textContent}`,
            `  Lobe Classification: ${outClass.textContent}`,
            `  DX Potential: ${outPotential.textContent}`,
            ""
        ].join("\n");
    }

    calcBtn.addEventListener("click", () => {
        const freq = parseFloat(freqEl.value);
        const height = parseFloat(heightEl.value);
        const length = parseFloat(lengthEl.value);

        if (!freq || !height || !length) {
            outWavelength.textContent = "—";
            outRatio.textContent = "—";
            outAngle.textContent = "—";
            outClass.textContent = "—";
            outPotential.textContent = "—";
            return;
        }

        const wl = HFUtils.wavelength(freq);
        outWavelength.textContent = `${wl.toFixed(1)} ft`;

        const ratio = height / wl;
        outRatio.textContent = ratio.toFixed(2);

        const angle = estimateAngle(height, freq);
        outAngle.textContent = `${angle}°`;

        const lobes = classifyLobes(height, length, freq);
        outClass.textContent = lobes;

        const potential = dxPotential(angle);
        outPotential.textContent = potential;
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            saveTextFile("KG5IEF - DX Pattern Explorer.txt", generateText());
        });
    }

})();
