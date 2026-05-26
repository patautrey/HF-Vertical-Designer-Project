/* vertical-designer.js — Full Module Logic */

document.addEventListener("DOMContentLoaded", function () {

    /* --- DOM Elements --- */
    const modeSel = document.getElementById("vdMode");
    const bandSel = document.getElementById("vdBands");
    const typeSel = document.getElementById("vdType");
    const customBlock = document.getElementById("vdCustomBlock");
    const customLen = document.getElementById("vdCustomLength");

    const heightInput = document.getElementById("vdHeight");
    const groundSel = document.getElementById("vdGround");

    const radialCount = document.getElementById("vdRadialCount");
    const radialLength = document.getElementById("vdRadialLength");
    const radialType = document.getElementById("vdRadialType");

    const analyzeBtn = document.getElementById("vdAnalyze");
    const resultsDiv = document.getElementById("vdResults");
    const warnDiv = document.getElementById("vdWarnings");

    /* --- Show/Hide Custom Electrical Length --- */
    typeSel.addEventListener("change", () => {
        if (typeSel.value === "custom") {
            customBlock.style.display = "block";
        } else {
            customBlock.style.display = "none";
        }
    });

    /* --- Helper: Convert band (meters) to MHz --- */
    function bandToMHz(b) {
        const map = {
            "80": 3.5,
            "60": 5.3,
            "40": 7.15,
            "30": 10.1,
            "20": 14.2,
            "17": 18.1,
            "15": 21.2,
            "12": 24.9,
            "10": 28.5
        };
        return map[b] || null;
    }

    /* --- Compute Electrical Length Multiplier --- */
    function getElectricalLengthFactor(type) {
        switch (type) {
            case "quarter": return 0.25;
            case "half": return 0.50;
            case "fiveEighths": return 0.625;
            case "sixFour": return 0.64;
            case "sevenZero": return 0.70;
            case "threeQuarter": return 0.75;
            case "loaded": return 0.20;   // Approx, depends on loading coil
            case "trap": return 0.25;     // Base section before trap
            case "fan": return 0.25;      // Each element tuned separately
            case "efhw": return 0.50;     // EFHW vertical = half-wave radiator
            case "custom": return parseFloat(customLen.value) || 0.5;
            default: return 0.25;
        }
    }

    /* --- Compute Feedpoint Impedance (Simplified Model) --- */
    function computeFeedpointZ(bandMHz, heightFt, type) {
        const wl = HFUtils.wavelength(bandMHz);
        const factor = getElectricalLengthFactor(type);
        const radiatorFt = wl * factor;

        // Height effect
        const hRatio = heightFt / (wl * 3.28);

        let Z = 36; // Base for quarter-wave

        if (type === "half") Z = 70;
        if (type === "fiveEighths") Z = 150;
        if (type === "sixFour") Z = 200;
        if (type === "sevenZero") Z = 250;
        if (type === "threeQuarter") Z = 300;
        if (type === "loaded") Z = 20;
        if (type === "trap") Z = 50;
        if (type === "fan") Z = 35;
        if (type === "efhw") Z = 2500;

        // Height correction
        if (hRatio < 0.1) Z *= 0.8;
        if (hRatio > 0.25) Z *= 1.2;

        return Math.round(Z);
    }

    /* --- Compute SWR (Assume 50Ω system) --- */
    function computeSWR(Z) {
        const R = Z;
        const Z0 = 50;
        const swr = (R > Z0) ? (R / Z0) : (Z0 / R);
        return swr.toFixed(2);
    }

    /* --- Radial Efficiency Notes --- */
    function radialNotes(count, length, type) {
        if (type === "ground") {
            if (count < 8) return "Low efficiency: add more radials.";
            if (count < 16) return "Moderate efficiency.";
            if (count >= 32) return "High efficiency ground radial field.";
        } else {
            if (count < 2) return "Elevated radials require at least 2.";
            if (count === 2) return "Good efficiency with tuned elevated radials.";
            if (count >= 4) return "Excellent elevated radial system.";
        }
        return "";
    }

    /* --- Pattern Tendencies --- */
    function patternSummary(bandMHz, heightFt) {
        return HFUtils.dxLobes(heightFt, 20, bandMHz);
    }

    /* --- Main Analysis --- */
    analyzeBtn.addEventListener("click", () => {

        resultsDiv.innerHTML = "";
        warnDiv.innerHTML = "";

        const mode = modeSel.value;
        const type = typeSel.value;
        const heightFt = parseFloat(heightInput.value) || 0;

        const radCount = parseInt(radialCount.value) || 0;
        const radLen = parseFloat(radialLength.value) || 0;
        const radType = radialType.value;

        const selectedBands = Array.from(bandSel.selectedOptions).map(o => o.value);

        if (selectedBands.length === 0) {
            warnDiv.innerHTML = "<span class='warning-red'>Select at least one band.</span>";
            return;
        }

        let html = "";

        selectedBands.forEach(b => {
            const mhz = bandToMHz(b);
            if (!mhz) return;

            const Z = computeFeedpointZ(mhz, heightFt, type);
            const swr = computeSWR(Z);
            const pattern = patternSummary(mhz, heightFt);
            const radialMsg = radialNotes(radCount, radLen, radType);

            html += `
                <div style="margin-bottom:20px; padding:10px; border:1px solid #ddd; border-radius:6px;">
                    <h3>${b}m Band</h3>
                    <p><b>Feedpoint Impedance:</b> ${Z} Ω</p>
                    <p><b>SWR (50Ω):</b> ${swr}</p>
                    <p><b>Pattern:</b> ${pattern}</p>
                    <p><b>Radials:</b> ${radialMsg}</p>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    });

});
