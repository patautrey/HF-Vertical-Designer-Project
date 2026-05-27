/* ============================================================
   feedline-matching.js — Tool Logic
   HF Feedline & Matching Calculator
   ============================================================ */

(function() {

    const freqEl = document.getElementById("fmFreq");
    const swrEl = document.getElementById("fmSWR");
    const lenEl = document.getElementById("fmLength");
    const typeEl = document.getElementById("fmType");
    const calcBtn = document.getElementById("fmCalc");
    const exportBtn = document.getElementById("fmExport");

    const outLoss = document.getElementById("fmLoss");
    const outPower = document.getElementById("fmPower");
    const outTransformed = document.getElementById("fmTransformed");
    const outMatch = document.getElementById("fmMatch");

    if (!calcBtn) {
        console.error("Feedline Matching UI not found");
        return;
    }

    const lossTable = {
        rg8x:   3.2,
        rg213:  1.5,
        lmr240: 2.1,
        lmr400: 0.7,
        ladder450: 0.1
    };

    function scaledLoss(baseLoss, freqMHz) {
        return baseLoss * Math.sqrt(freqMHz / 30);
    }

    function transformSWR(swr, lengthFt, freqMHz) {
        if (!swr || swr < 1) return 1;

        const wl = 984 / freqMHz;
        const electricalLength = (lengthFt / wl) * 360;
        const radians = electricalLength * (Math.PI / 180);
        const transformed = swr + (Math.sin(radians) * (swr - 1));

        return Math.max(1, parseFloat(transformed.toFixed(2)));
    }

    function recommendMatch(swr) {
        if (swr <= 2) return "No matching required";
        if (swr <= 3) return "Internal tuner OK";
        if (swr <= 5) return "External tuner recommended";
        return "Use 4:1 or 9:1 transformer";
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
            "Tool: Feedline & Matching",
            "",
            "Inputs:",
            `  Frequency: ${freqEl.value || "—"} MHz`,
            `  Antenna SWR: ${swrEl.value || "—"}`,
            `  Feedline Length: ${lenEl.value || "—"} ft`,
            `  Feedline Type: ${typeEl.value || "—"}`,
            "",
            "Results:",
            `  Loss: ${outLoss.textContent}`,
            `  Delivered Power: ${outPower.textContent}`,
            `  Transformed SWR: ${outTransformed.textContent}`,
            `  Recommended Match: ${outMatch.textContent}`,
            ""
        ].join("\n");
    }

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

        const baseLoss = lossTable[type];
        const lossPer100 = scaledLoss(baseLoss, freq);

        const totalLoss = (lossPer100 * (length / 100)).toFixed(2);
        outLoss.textContent = `${totalLoss} dB`;

        const delivered = (100 * Math.pow(10, -totalLoss / 10)).toFixed(1);
        outPower.textContent = `${delivered}%`;

        const transformed = transformSWR(swr, length, freq);
        outTransformed.textContent = transformed;

        outMatch.textContent = recommendMatch(transformed);
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            saveTextFile("KG5IEF - Feedline & Matching.txt", generateText());
        });
    }

})();
