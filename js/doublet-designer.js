/* ============================================================
   doublet-designer.js — Tool Logic
   HF Doublet Designer
   ============================================================ */

(function() {

    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    const wireEl = document.getElementById("dblWire");
    const ladderEl = document.getElementById("dblLadder");
    const zEl = document.getElementById("dblZ");
    const bandsEl = document.getElementById("dblBands");
    const calcBtn = document.getElementById("dblCalc");
    const exportBtn = document.getElementById("dblExport");

    const outImpedance = document.getElementById("dblImpedance");
    const outCoverage = document.getElementById("dblCoverage");
    const outTuner = document.getElementById("dblTuner");

    if (!calcBtn) {
        console.error("Doublet Designer UI not found");
        return;
    }

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

    function tunerRecommendation(impedanceText) {
        if (impedanceText.includes("low")) return "Internal tuner OK";
        if (impedanceText.includes("moderate")) return "External tuner recommended";
        return "High-power balanced tuner required";
    }

    function saveTextFile(filename, text) {
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function generateText(bandsParsed) {
        const covText = outCoverage.textContent || "";
        return [
            "HF Tools Suite — KG5IEF",
            `Exported: ${new Date().toLocaleString()}`,
            "Tool: Doublet Designer",
            "",
            "Inputs:",
            `  Total Wire Length: ${wireEl.value || "—"} ft`,
            `  Ladder Line Length: ${ladderEl.value || "—"} ft`,
            `  Ladder Line Z: ${zEl.value || "—"} Ω`,
            `  Bands: ${bandsParsed && bandsParsed.length ? bandsParsed.join(", ") : (bandsEl.value || "—")}`,
            "",
            "Results:",
            `  Impedance Tendency: ${outImpedance.textContent}`,
            `  Band Coverage: ${covText}`,
            `  Recommended Tuner: ${outTuner.textContent}`,
            ""
        ].join("\n");
    }

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

        const bands = bandsRaw
            .split(",")
            .map(b => parseFloat(b.trim()))
            .filter(b => !isNaN(b));

        if (bands.length === 0) {
            outCoverage.textContent = "Invalid band list";
            return;
        }

        const imp = HFUtils.doubletImpedance(wire, ladder, z);
        outImpedance.textContent = imp;

        const cov = bandCoverage(wire, bands);

        const covText =
            `Easy: ${cov.easy.join(", ") || "None"} | ` +
            `Hard: ${cov.hard.join(", ") || "None"} | ` +
            `No: ${cov.no.join(", ") || "None"}`;

        outCoverage.textContent = covText;

        outTuner.textContent = tunerRecommendation(imp);
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const bands = bandsEl.value
                .split(",")
                .map(b => parseFloat(b.trim()))
                .filter(b => !isNaN(b));
            saveTextFile("KG5IEF - Doublet Designer.txt", generateText(bands));
        });
    }

})();
