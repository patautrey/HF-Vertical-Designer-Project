/* ============================================================
   vertical-designer.js — Tool Logic
   HF Vertical Designer
   ============================================================ */

(function() {

    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    const bandEl = document.getElementById("vdBand");
    const heightEl = document.getElementById("vdHeight");
    const radialsEl = document.getElementById("vdRadials");
    const radialLenEl = document.getElementById("vdRadialLen");
    const calcBtn = document.getElementById("vdCalc");
    const exportBtn = document.getElementById("vdExport");

    const outWavelength = document.getElementById("vdWavelength");
    const outResonant = document.getElementById("vdResonant");
    const outNVIS = document.getElementById("vdNVIS");
    const outDX = document.getElementById("vdDX");
    const outRadials = document.getElementById("vdRadialEff");

    if (!calcBtn) {
        console.error("Vertical Designer UI not found");
        return;
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
            "Tool: Vertical Designer",
            "",
            "Inputs:",
            `  Band: ${bandEl.value || "—"} MHz`,
            `  Vertical Height: ${heightEl.value || "—"} ft`,
            `  Radial Count: ${radialsEl.value || "—"}`,
            `  Radial Length: ${radialLenEl.value || "—"} ft`,
            "",
            "Results:",
            `  Wavelength: ${outWavelength.textContent}`,
            `  Resonant Length: ${outResonant.textContent}`,
            `  NVIS Angle: ${outNVIS.textContent}`,
            `  DX Tendency: ${outDX.textContent}`,
            `  Radial Efficiency: ${outRadials.textContent}`,
            ""
        ].join("\n");
    }

    calcBtn.addEventListener("click", () => {
        const band = parseFloat(bandEl.value);
        const height = parseFloat(heightEl.value);
        const radials = parseFloat(radialsEl.value);
        const radialLen = parseFloat(radialLenEl.value);

        if (!band || !height || !radials || !radialLen) {
            outWavelength.textContent = "—";
            outResonant.textContent = "—";
            outNVIS.textContent = "—";
            outDX.textContent = "—";
            outRadials.textContent = "—";
            return;
        }

        const wl = HFUtils.wavelength(band);
        outWavelength.textContent = `${wl.toFixed(1)} ft`;

        const resonant = wl / 4;
        outResonant.textContent = `${resonant.toFixed(1)} ft`;

        const angle = HFUtils.nvisAngle(height, band);
        outNVIS.textContent = angle ? `${angle}°` : "—";

        const dxClass = HFUtils.dxLobes(height, resonant, band);
        outDX.textContent = dxClass;

        const eff = Math.min(100, (radials / 32) * 100);
        outRadials.textContent = `${eff.toFixed(0)}%`;
    });

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            saveTextFile("KG5IEF - Vertical Designer.txt", generateText());
        });
    }

})();
