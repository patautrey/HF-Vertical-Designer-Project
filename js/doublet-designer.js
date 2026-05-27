/* doublet-designer.js — Full Module Logic */

document.addEventListener("DOMContentLoaded", function () {

    /* DOM Elements */
    const ddType = document.getElementById("ddType");
    const ddWireLength = document.getElementById("ddWireLength");
    const ddLLLength = document.getElementById("ddLLLength");
    const ddLLZ = document.getElementById("ddLLZ");
    const ddBalun = document.getElementById("ddBalun");
    const ddHeight = document.getElementById("ddHeight");
    const ddBands = document.getElementById("ddBands");

    const ddAnalyze = document.getElementById("ddAnalyze");
    const ddResults = document.getElementById("ddResults");
    const ddWarnings = document.getElementById("ddWarnings");

    /* Band → MHz */
    const bandMHz = {
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

    /* Presets */
    const presets = {
        g5rv:      { wire: 102, ll: 34,  z: 450 },
        zs6bkw:    { wire: 93,  ll: 39,  z: 450 },
        "20m":     { wire: 33,  ll: 16,  z: 450 },
        "40m":     { wire: 66,  ll: 28,  z: 450 },
        "80m":     { wire: 132, ll: 34,  z: 450 }
    };

    /* Apply Preset */
    ddType.addEventListener("change", () => {
        const t = ddType.value;
        if (t !== "custom") {
            ddWireLength.value = presets[t].wire;
            ddLLLength.value = presets[t].ll;
            ddLLZ.value = presets[t].z;
        }
    });

    /* Feedpoint Z Model */
    function computeFeedpointZ(freqMHz, wireFt, llFt, llZ, heightFt) {
        const wl = HFUtils.wavelength(freqMHz) * 3.28;

        const halfWave = wl / 2;
        const wireRatio = wireFt / halfWave;

        let Z = 50;

        if (wireRatio < 0.8) Z = 30;
        if (wireRatio >= 0.8 && wireRatio <= 1.2) Z = 70;
        if (wireRatio > 1.2) Z = 120;

        if (llZ === 300) Z *= 1.1;
        if (llZ === 450) Z *= 1.3;
        if (llZ === 600) Z *= 1.5;

        const hRatio = heightFt / wl;
        if (hRatio < 0.15) Z *= 0.8;
        if (hRatio > 0.25) Z *= 1.2;

        return Math.round(Z);
    }

    /* SWR */
    function computeSWR(Z, Z0 = 50) {
        const swr = (Z > Z0) ? (Z / Z0) : (Z0 / Z);
        return swr.toFixed(2);
    }

    /* Pattern Summary */
    function patternSummary(freqMHz, heightFt) {
        return HFUtils.dxLobes(heightFt, 20, freqMHz);
    }

    /* Balun Notes */
    function balunNotes(type) {
        if (type === "1to1") return "1:1 current balun recommended for balanced doublets.";
        if (type === "4to1") return "4:1 current balun useful for higher feedpoint impedance.";
        if (type === "unun9to1") return "9:1 unun is not recommended for center‑fed doublets.";
        return "";
    }

    /* Main Analysis */
    ddAnalyze.addEventListener("click", () => {

        ddResults.innerHTML = "";
        ddWarnings.innerHTML = "";

        const wireFt = parseFloat(ddWireLength.value) || 0;
        const llFt = parseFloat(ddLLLength.value) || 0;
        const llZ = parseInt(ddLLZ.value) || 450;
        const balun = ddBalun.value;
        const heightFt = parseFloat(ddHeight.value) || 0;

        const selectedBands = Array.from(ddBands.selectedOptions).map(o => o.value);

        if (selectedBands.length === 0) {
            ddWarnings.innerHTML = "<span class='warning-red'>Select at least one band.</span>";
            return;
        }

        let html = "";

        selectedBands.forEach(b => {
            const mhz = bandMHz[b];
            const Z = computeFeedpointZ(mhz, wireFt, llFt, llZ, heightFt);
            const swr = computeSWR(Z);
            const pattern = patternSummary(mhz, heightFt);
            const balunMsg = balunNotes(balun);

            html += `
                <div style="margin-bottom:20px; padding:10px; border:1px solid #ddd; border-radius:6px;">
                    <h3>${b}m Band</h3>
                    <p><b>Feedpoint Impedance:</b> ${Z} Ω</p>
                    <p><b>SWR (50Ω):</b> ${swr}</p>
                    <p><b>Pattern:</b> ${pattern}</p>
                    <p><b>Balun:</b> ${balunMsg}</p>
                </div>
            `;
        });

        ddResults.innerHTML = html;
    });

});
