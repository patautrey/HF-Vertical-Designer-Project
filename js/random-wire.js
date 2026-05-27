/* random-wire.js — Full Module Logic */

document.addEventListener("DOMContentLoaded", function () {

    /* DOM Elements */
    const rwLength = document.getElementById("rwLength");
    const rwTransformer = document.getElementById("rwTransformer");
    const rwCounterpoise = document.getElementById("rwCounterpoise");
    const rwHeight = document.getElementById("rwHeight");
    const rwGround = document.getElementById("rwGround");
    const rwBands = document.getElementById("rwBands");

    const rwAnalyze = document.getElementById("rwAnalyze");
    const rwResults = document.getElementById("rwResults");
    const rwWarnings = document.getElementById("rwWarnings");

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

    /* Transformer Ratios */
    const transformerRatio = {
        "9to1": 9,
        "4to1": 4,
        "1to1": 1
    };

    /* Ground Quality Factors */
    const groundFactor = {
        poor: 0.7,
        average: 1.0,
        good: 1.2
    };

    /* Random Wire Feedpoint Z Model */
    function computeFeedpointZ(freqMHz, wireFt, counterFt, heightFt, transformer, ground) {
        const wl = HFUtils.wavelength(freqMHz) * 3.28;
        const wireRatio = wireFt / wl;

        let Z = 300;

        if (wireRatio < 0.25) Z = 150;
        if (wireRatio >= 0.25 && wireRatio <= 0.5) Z = 300;
        if (wireRatio > 0.5 && wireRatio <= 1.0) Z = 600;
        if (wireRatio > 1.0) Z = 1200;

        if (counterFt < 10) Z *= 1.2;
        if (counterFt > 20) Z *= 0.9;

        const hRatio = heightFt / wl;
        if (hRatio < 0.15) Z *= 0.8;
        if (hRatio > 0.25) Z *= 1.1;

        Z *= groundFactor[ground];

        Z = Z / transformerRatio[transformer];

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

    /* Transformer Notes */
    function transformerNotes(type) {
        if (type === "9to1") return "9:1 unun recommended for random wires.";
        if (type === "4to1") return "4:1 balun usable but not ideal for random wires.";
        if (type === "1to1") return "1:1 balun not recommended for random wires.";
        return "";
    }

    /* Main Analysis */
    rwAnalyze.addEventListener("click", () => {

        rwResults.innerHTML = "";
        rwWarnings.innerHTML = "";

        const wireFt = parseFloat(rwLength.value) || 0;
        const transformer = rwTransformer.value;
        const counterFt = parseFloat(rwCounterpoise.value) || 0;
        const heightFt = parseFloat(rwHeight.value) || 0;
        const ground = rwGround.value;

        const selectedBands = Array.from(rwBands.selectedOptions).map(o => o.value);

        if (selectedBands.length === 0) {
            rwWarnings.innerHTML = "<span class='warning-red'>Select at least one band.</span>";
            return;
        }

        let html = "";

        selectedBands.forEach(b => {
            const mhz = bandMHz[b];
            const Z = computeFeedpointZ(mhz, wireFt, counterFt, heightFt, transformer, ground);
            const swr = computeSWR(Z);
            const pattern = patternSummary(mhz, heightFt);
            const tmsg = transformerNotes(transformer);

            html += `
                <div style="margin-bottom:20px; padding:10px; border:1px solid #ddd; border-radius:6px;">
                    <h3>${b}m Band</h3>
                    <p><b>Feedpoint Impedance:</b> ${Z} Ω</p>
                    <p><b>SWR (50Ω):</b> ${swr}</p>
                    <p><b>Pattern:</b> ${pattern}</p>
                    <p><b>Transformer:</b> ${tmsg}</p>
                </div>
            `;
        });

        rwResults.innerHTML = html;
    });

});
