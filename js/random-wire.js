/* ============================================================
   random-wire.js — Tool Logic
   HF Random Wire Analyzer
   ============================================================ */

(function() {

    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    const lenEl = document.getElementById("rwLength");
    const bandsEl = document.getElementById("rwBands");
    const calcBtn = document.getElementById("rwCalc");
    const exportBtn = document.getElementById("rwExport");

    const outClass = document.getElementById("rwClass");
    const outCoverage = document.getElementById("rwCoverage");
    const outMatch = document.getElementById("rwMatch");

    if (!calcBtn) {
        console.error("Random Wire UI not found");
        return;
    }

    function classifyLength(lengthFt) {
        const avoid = [32, 64, 96, 128, 160];
        const near = avoid.some(a => Math.abs(a - lengthFt) <= 2);

        if (avoid.includes(lengthFt)) return "Avoid length (high impedance)";
        if (near) return "Borderline (near avoid-length)";
        if (lengthFt < 20) return "Too short for HF";
        if (lengthFt > 200) return "Very long (may require strong tuner)";
        return "Safe random-wire length";
    }

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

    function matchRecommendation(classification) {
        if (classification.includes("Avoid")) return "Use 9:1 unun + tuner";
        if (classification.includes("Borderline")) return "External tuner recommended";
        if (classification.includes("Too short")) return "Not recommended";
        if (classification.includes("Very long")) return "Balanced tuner recommended";
        return "Internal tuner usually OK";
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
            "Tool: Random Wire Analyzer",
            "",
            "Inputs:",
            `  Wire Length: ${lenEl.value || "—"} ft`,
            `  Bands: ${bandsParsed && bandsParsed.length ? bandsParsed.join(", ") : (bandsEl.value || "—")}`,
            "",
            "Results:",
            `  Avoid-Length Classification: ${outClass.textContent}`,
            `  Band Coverage: ${covText}`,
            `  Recommended Match: ${outMatch.textContent}`,
            ""
        ].join("\n");
    }

    calcBtn.addEventListener("click", () => {
        const length = parseFloat(lenEl.value);
        const bandsRaw = bandsEl.value;

        if (!length || !bandsRaw) {
            outClass.textContent = "—";
            outCoverage.textContent = "—";
            outMatch.textContent = "—";
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

        const cls = classifyLength(length);
        outClass.textContent = cls;

        const cov = bandCoverage(length, bands);

        const covText =
            `Good: ${cov.good.join(", ") || "None"} | ` +
            `Marginal: ${cov.marginal.join(", ") || "None"} | ` +
            `Poor: ${cov.poor.join(", ") || "None"}`;

        outCoverage.textContent = covText;

        outMatch.textContent = matchRecommendation(cls);
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const bands = bandsEl.value
                .split(",")
                .map(b => parseFloat(b.trim()))
                .filter(b => !isNaN(b));
            saveTextFile("KG5IEF - Random Wire Analyzer.txt", generateText(bands));
        });
    }

})();
