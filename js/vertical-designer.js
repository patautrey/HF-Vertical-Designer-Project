document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("vdAnalyze");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {

        // BASIC INPUTS
        const mode = document.getElementById("vdMode").value;
        const bands = Array.from(document.getElementById("vdBands").selectedOptions).map(o => o.value);
        const type = document.getElementById("vdType").value;
        const customLength = parseFloat(document.getElementById("vdCustomLength").value) || null;
        const height = parseFloat(document.getElementById("vdHeight").value) || 0;
        const ground = document.getElementById("vdGround").value;
        const radialCount = parseInt(document.getElementById("vdRadialCount").value) || 0;
        const radialLength = parseFloat(document.getElementById("vdRadialLength").value) || 0;
        const radialType = document.getElementById("vdRadialType").value;

        // BOOST OPTIONS
        const boostReflector = document.getElementById("vdBoostReflector").checked ? 2.5 : 0;
        const boostDirector = document.getElementById("vdBoostDirector").checked ? 1.5 : 0;
        const boostElevated = document.getElementById("vdBoostElevatedRadials").checked ? 1.8 : 0;
        const boostGroundScreen = document.getElementById("vdBoostGroundScreen").checked ? 1.0 : 0;
        const boostSaltwater = document.getElementById("vdBoostSaltwater").checked ? 5.0 : 0;
        const boostTurbo = document.getElementById("vdBoostTurbo").checked ? 3.5 : 0;

        // TIME OF DAY BOOST
        let boostTime = 0;
        const tod = document.getElementById("vdTimeOfDay").value;
        if (tod === "night") boostTime = 3.0;
        if (tod === "dawn") boostTime = 6.0;
        if (tod === "dusk") boostTime = 6.0;

        // FEEDLINE TYPE BOOST
        let boostFeedline = 0;
        const fl = document.getElementById("vdFeedlineType").value;
        if (fl === "rg58") boostFeedline = -1.0;
        if (fl === "rg8x") boostFeedline = 0.0;
        if (fl === "lmr240") boostFeedline = 0.8;
        if (fl === "lmr400") boostFeedline = 1.5;
        if (fl === "ladder450") boostFeedline = 2.0;
        if (fl === "ladder600") boostFeedline = 2.5;

        // SPECIAL ANTENNA TYPES
        let specialNotes = "";
        let specialBoost = 0;

        // PERformer
        if (type === "performer") {
            specialNotes += `<p><strong>PERformer Mode:</strong> Elevated resonant vertical with two tuned radials.</p>`;
            specialNotes += `<p>Front‑to‑back: 4–6 dB when radials are 90° apart.</p>`;
            specialNotes += `<p>Omni pattern when radials are 180° apart.</p>`;
            specialNotes += `<p>Requires common‑mode choke at feedpoint.</p>`;

            specialBoost += 0.4;   // modeled gain
            specialBoost += 1.8;   // elevated radials

            if (height >= 25) {
                specialNotes += `<p>SS25 whip detected: reduced coil inductance → higher efficiency.</p>`;
                specialBoost += 1.5;
            }

            if (bands.includes("40m")) {
                specialNotes += `<p>40m Mode: radials linked in series (34 ft) + loading coil.</p>`;
                specialBoost += 1.0;
            }
        }

        // Dominator
        if (type === "dominator") {
            specialNotes += `<p><strong>Dominator Mode:</strong> Half‑wave vertical radiator (49:1 feed).</p>`;
            specialNotes += `<p>Low takeoff angle (~25°) ideal for DX.</p>`;
            specialNotes += `<p>Single counterpoise wire required.</p>`;

            specialBoost += 3.0; // DX low-angle
            specialBoost += 1.0; // low reactance bonus

            if (height >= 25) {
                specialNotes += `<p>SS25 whip enables 20m half‑wave operation.</p>`;
                specialBoost += 2.0;
            }
        }

        // TOTAL BOOST
        const totalBoost =
            boostReflector +
            boostDirector +
            boostElevated +
            boostGroundScreen +
            boostSaltwater +
            boostTurbo +
            boostTime +
            boostFeedline +
            specialBoost;

        // OUTPUT
        let results = "";
        let warnings = "";
        let boostSummary = "";

        results += `<h3>Vertical Analysis</h3>`;
        results += `<p><strong>Mode:</strong> ${mode}</p>`;
        results += `<p><strong>Bands:</strong> ${bands.join(", ")}</p>`;
        results += `<p><strong>Antenna Type:</strong> ${type}</p>`;
        results += `<p><strong>Height:</strong> ${height} ft</p>`;
        results += `<p><strong>Ground:</strong> ${ground}</p>`;
        results += `<p><strong>Radials:</strong> ${radialCount} × ${radialLength} ft (${radialType})</p>`;

        if (height < 8) {
            warnings += `<p>⚠ Height is very low — efficiency reduced.</p>`;
        }

        boostSummary += `<h3>Boost Summary</h3>`;
        boostSummary += `<p><strong>Total Gain Boost:</strong> ${totalBoost.toFixed(1)} dB</p>`;

        if (specialBoost > 0) {
            boostSummary += `<p><strong>Special Antenna Boost:</strong> +${specialBoost.toFixed(1)} dB</p>`;
        }

        document.getElementById("vdResults").innerHTML = results;
        document.getElementById("vdWarnings").innerHTML = warnings;
        document.getElementById("vdBoostSummary").innerHTML = boostSummary;
        document.getElementById("vdSpecial").innerHTML = specialNotes;
    });
});
