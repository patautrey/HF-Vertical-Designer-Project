// /js/vertical-designer.js

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

        // SPECIAL ANTENNA TYPES: PERformer + Dominator
        let specialNotes = "";
        let specialBoost = 0;

        // PERformer
        if (type === "performer") {
            specialNotes += `<p><strong>PERformer Mode:</strong> Elevated resonant vertical with two tuned radials.</p>`;
            specialNotes += `<p>Front‑to‑back: 4–6 dB when radials are 90° apart; 180° gives omni pattern.</p>`;
            specialNotes += `<p>Requires common‑mode choke at feedpoint to keep feedline out of the radiator.</p>`;

            // Baseline modeled gain
            specialBoost += 0.4;

            // Elevated radials are inherent to PERformer
            specialBoost += 1.8;

            // SS25 synergy (long whip → less coil → more efficiency)
            if (height >= 25) {
                specialNotes += `<p>SS25 whip detected: reduced loading coil inductance → higher efficiency.</p>`;
                specialBoost += 1.5;
            }

            // 40m mode
            if (bands.includes("40m")) {
                specialNotes += `<p>40m Mode: two 17 ft radials linked in series (34 ft) + loading coil at base.</p>`;
                specialBoost += 1.0;
            }
        }

        // Dominator
        if (type === "dominator") {
            specialNotes += `<p><strong>Dominator Mode:</strong> Half‑wave vertical radiator with 49:1 feed.</p>`;
            specialNotes += `<p>Exceptionally low takeoff angle (~25°) optimized for DX.</p>`;
            specialNotes += `<p>Uses a single counterpoise wire tuned to the band.</p>`;

            // DX low-angle boost
            specialBoost += 3.0;

            // SS25 synergy for 20m half‑wave
            if (height >= 25) {
                specialNotes += `<p>SS25 whip enables 20m half‑wave operation with minimal pigtail.</p>`;
                specialBoost += 2.0;
            }

            // Low reactance bonus
            specialNotes += `<p>Measured reactance X ≈ 5Ω → excellent power transfer despite ~2:1 SWR.</p>`;
            specialBoost += 1.0;
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

        // BUILD OUTPUT
        let results = "";
        let warnings = "";
        let boostSummary = "";

        results += `<h3>Vertical Analysis</h3>`;
        results += `<p><strong>Mode:</strong> ${mode === "single" ? "Single-Band" : "Multi-Band"}</p>`;
        results += `<p><strong>Bands:</strong> ${bands.length ? bands.join(", ") : "None selected"}</p>`;
        results += `<p><strong>Antenna Type:</strong> ${describeType(type)}</p>`;
        if (customLength && type === "custom") {
            results += `<p><strong>Custom Length:</strong> ${customLength.toFixed(1)} ft</p>`;
        }
        results += `<p><strong>Height:</strong> ${height.toFixed(1)} ft</p>`;
        results += `<p><strong>Ground:</strong> ${describeGround(ground)}</p>`;
        results += `<p><strong>Radials:</strong> ${radialCount} × ${radialLength.toFixed(1)} ft (${describeRadialType(radialType)})</p>`;

        // WARNINGS
        if (height < 8) {
            warnings += `<p>⚠ Height is very low — efficiency and takeoff angle will suffer.</p>`;
        }
        if (radialCount === 0 && type !== "dominator" && type !== "efhw") {
            warnings += `<p>⚠ No radials specified — ground losses may be severe.</p>`;
        }
        if (ground === "poor" && radialCount < 16 && radialType !== "elevated") {
            warnings += `<p>⚠ Poor ground with few ground‑mounted radials — expect significant loss.</p>`;
        }

        // BOOST SUMMARY
        boostSummary += `<h3>Boost Summary</h3>`;
        boostSummary += `<p><strong>Total Gain Boost:</strong> ${totalBoost.toFixed(1)} dB</p>`;

        if (boostReflector) boostSummary += `<p>Reflector: +2.5 dB</p>`;
        if (boostDirector) boostSummary += `<p>Director: +1.5 dB</p>`;
        if (boostElevated) boostSummary += `<p>Elevated Radials: +1.8 dB</p>`;
        if (boostGroundScreen) boostSummary += `<p>Ground Screen: +1.0 dB</p>`;
        if (boostSaltwater) boostSummary += `<p>Saltwater Site: +5.0 dB</p>`;
        if (boostTurbo) boostSummary += `<p>0.70λ DX Turbo: +3.5 dB</p>`;

        boostSummary += `<p><strong>Time of Day:</strong> ${boostTime.toFixed(1)} dB</p>`;
        boostSummary += `<p><strong>Feedline Type:</strong> ${boostFeedline.toFixed(1)} dB</p>`;

        if (specialBoost > 0) {
            boostSummary += `<p><strong>Special Antenna Boost:</strong> +${specialBoost.toFixed(1)} dB</p>`;
        }

        // WRITE TO DOM
        const resultsDiv = document.getElementById("vdResults");
        const warningsDiv = document.getElementById("vdWarnings");
        const boostDiv = document.getElementById("vdBoostSummary");
        const specialDiv = document.getElementById("vdSpecial");

        if (resultsDiv) resultsDiv.innerHTML = results;
        if (warningsDiv) warningsDiv.innerHTML = warnings;
        if (boostDiv) boostDiv.innerHTML = boostSummary;
        if (specialDiv) specialDiv.innerHTML = specialNotes;
    });

    function describeType(type) {
        switch (type) {
            case "quarter": return "1/4-Wave Vertical";
            case "turbo": return "0.70λ DX Turbo Vertical";
            case "efhw": return "End-Fed Half-Wave";
            case "performer": return "POTA PERformer (Elevated Resonant)";
            case "dominator": return "POTA Dominator (Half-Wave DX)";
            case "custom": return "Custom Vertical";
            default: return type;
        }
    }

    function describeGround(g) {
        switch (g) {
            case "poor": return "Poor Ground";
            case "average": return "Average Ground";
            case "good": return "Good Ground";
            case "saltwater": return "Saltwater / Seaside";
            default: return g;
        }
    }

    function describeRadialType(r) {
        switch (r) {
            case "ground": return "Ground-Mounted";
            case "elevated": return "Elevated";
            case "counterpoise": return "Counterpoise Wire";
            default: return r;
        }
    }
});
