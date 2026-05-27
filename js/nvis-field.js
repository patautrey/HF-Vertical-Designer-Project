/* nvis-field.js — Full Module Logic */

document.addEventListener("DOMContentLoaded", function () {

    /* DOM Elements */
    const nvisBand = document.getElementById("nvisBand");
    const nvisType = document.getElementById("nvisType");
    const nvisHeight = document.getElementById("nvisHeight");
    const nvisGround = document.getElementById("nvisGround");
    const nvisContext = document.getElementById("nvisContext");
    const nvisWireLength = document.getElementById("nvisWireLength");
    const nvisLoopShape = document.getElementById("nvisLoopShape");

    const nvisAnalyze = document.getElementById("nvisAnalyze");
    const nvisResults = document.getElementById("nvisResults");
    const nvisWarnings = document.getElementById("nvisWarnings");

    /* Band → MHz */
    const bandMHz = {
        "80": 3.5,
        "60": 5.3,
        "40": 7.15
    };

    /* Ground Quality Factors */
    const groundFactor = {
        poor: 0.7,
        average: 1.0,
        good: 1.2
    };

    /* NVIS Suitability Model */
    function nvisSuitability(freqMHz, heightFt, type, ground) {
        const wl = HFUtils.wavelength(freqMHz) * 3.28;
        const hRatio = heightFt / wl;

        let score = 1.0;

        if (hRatio < 0.15) score += 0.6;
        if (hRatio < 0.10) score += 0.8;

        if (type === "invertedV") score += 0.2;
        if (type === "loop") score += 0.3;

        score *= groundFactor[ground];

        if (score > 2.0) return "Excellent NVIS";
        if (score > 1.4) return "Good NVIS";
        if (score > 1.0) return "Moderate NVIS";
        return "Weak NVIS";
    }

    /* Takeoff Angle Model */
    function takeoffAngle(freqMHz, heightFt) {
        const wl = HFUtils.wavelength(freqMHz) * 3.28;
        const hRatio = heightFt / wl;

        let angle = 70;

        if (hRatio < 0.15) angle = 75;
        if (hRatio < 0.10) angle = 80;

        return angle;
    }

    /* Wire Length Notes */
    function wireNotes(type, lengthFt, band) {
        if (type === "lowDipole") {
            const target = (468 / bandMHz[band]);
            const diff = Math.abs(lengthFt - target);

            if (diff < 5) return "Wire length appropriate for NVIS dipole.";
            return "Wire length not optimal for NVIS dipole resonance.";
        }

        if (type === "loop") {
            return `Loop perimeter: ${lengthFt} ft (${nvisLoopShape.value} shape).`;
        }

        if (type === "randomWire") {
            return "Random wire: tuner required for NVIS operation.";
        }

        return "Wire length acceptable.";
    }

    /* Deployment Notes */
    function deploymentNotes(context) {
        if (context === "portable") return "Portable deployment: expect variable ground coupling.";
        return "Fixed station: stable ground characteristics.";
    }

    /* Main Analysis */
    nvisAnalyze.addEventListener("click", () => {

        nvisResults.innerHTML = "";
        nvisWarnings.innerHTML = "";

        const band = nvisBand.value;
        const freq = bandMHz[band];
        const type = nvisType.value;
        const height = parseFloat(nvisHeight.value) || 0;
        const ground = nvisGround.value;
        const context = nvisContext.value;
        const wireLen = parseFloat(nvisWireLength.value) || 0;

        const suitability = nvisSuitability(freq, height, type, ground);
        const angle = takeoffAngle(freq, height);
        const wireMsg = wireNotes(type, wireLen, band);
        const deployMsg = deploymentNotes(context);

        nvisResults.innerHTML = `
            <div style="padding:10px; border:1px solid #ccc; border-radius:6px;">
                <p><b>Band:</b> ${band}m</p>
                <p><b>NVIS Suitability:</b> ${suitability}</p>
                <p><b>Estimated Takeoff Angle:</b> ~${angle}°</p>
                <p><b>Wire Notes:</b> ${wireMsg}</p>
                <p><b>Deployment:</b> ${deployMsg}</p>
            </div>
        `;
    });

});
