/* ============================================================
   vertical-designer.js — Tool Logic
   HF Vertical Designer Project
   ============================================================ */

(function() {

    /* Ensure HFUtils exists */
    if (typeof HFUtils === "undefined") {
        console.error("HFUtils not loaded");
        return;
    }

    /* Grab UI elements */
    const bandEl = document.getElementById("band");
    const heightEl = document.getElementById("height");
    const radialsEl = document.getElementById("radials");
    const radialLenEl = document.getElementById("radialLength");
    const calcBtn = document.getElementById("calcVertical");

    const outWavelength = document.getElementById("outWavelength");
    const outResonant = document.getElementById("outResonant");
    const outNVIS = document.getElementById("outNVIS");
    const outDX = document.getElementById("outDX");
    const outRadials = document.getElementById("outRadials");

    if (!calcBtn) {
        console.error("Vertical Designer UI not found");
        return;
    }

    /* ========================================================
       Radial Efficiency Helper
       ======================================================== */
    function radialEfficiency(count, lengthFt) {
        if (!count || !lengthFt) return "Unknown";

        if (count < 4) return "Very poor";
        if (count < 8) return "Poor";
        if (count < 16) return "Moderate";
        if (count < 32) return "Good";

        return "Excellent";
    }

    /* ========================================================
       Main Calculation Handler
       ======================================================== */
    calcBtn.addEventListener("click", () => {

        const band = parseFloat(bandEl.value);
        const height = parseFloat(heightEl.value);
        const radials = parseFloat(radialsEl.value);
        const radialLen = parseFloat(radialLenEl.value);

        if (!band || !height) {
            outWavelength.textContent = "—";
            outResonant.textContent = "—";
            outNVIS.textContent = "—";
            outDX.textContent = "—";
            outRadials.textContent = "—";
            return;
        }

        /* Wavelength */
        const wl = HFUtils.wavelength(band);
        outWavelength.textContent = `${wl.toFixed(1)} ft`;

        /* Resonant Length (quarter-wave) */
        const resonant = wl / 4;
        outResonant.textContent = `${resonant.toFixed(1)} ft`;

        /* NVIS Angle */
        const nvis = HFUtils.nvisAngle(height, band);
        outNVIS.textContent = nvis ? `${nvis}°` : "—";

        /* DX Lobe Tendency */
        const dx = HFUtils.dxLobes(height, resonant, band);
        outDX.textContent = dx;

        /* Radial Efficiency */
        const eff = radialEfficiency(radials, radialLen);
        outRadials.textContent = eff;

    });

})();

