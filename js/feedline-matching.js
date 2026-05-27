document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("flAnalyze");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
        const type = document.getElementById("flType").value;
        const customVF = parseFloat(document.getElementById("flCustomVF").value) || null;
        const length = parseFloat(document.getElementById("flLength").value) || 0;
        const freq = parseFloat(document.getElementById("flFreq").value) || 0;
        const loadZ = parseFloat(document.getElementById("flLoadZ").value) || 50;
        const sourceZ = parseFloat(document.getElementById("flSourceZ").value) || 50;

        // Velocity factor lookup
        let vf = 0.66;
        if (type === "rg58") vf = 0.64;
        if (type === "rg8x") vf = 0.78;
        if (type === "lmr240") vf = 0.84;
        if (type === "lmr400") vf = 0.85;
        if (type === "ladder300") vf = 0.90;
        if (type === "ladder450") vf = 0.91;
        if (type === "ladder600") vf = 0.92;
        if (type === "custom" && customVF) vf = customVF;

        // Basic electrical length calculation
        const wavelength = 984 / freq;
        const electricalLength = (length / wavelength) * 360;

        let results = "";
        let warnings = "";

        results += `<h3>Feedline Analysis</h3>`;
        results += `<p><strong>Type:</strong> ${type}</p>`;
        results += `<p><strong>Velocity Factor:</strong> ${vf}</p>`;
        results += `<p><strong>Length:</strong> ${length} ft</p>`;
        results += `<p><strong>Electrical Length:</strong> ${electricalLength.toFixed(1)}°</p>`;
        results += `<p><strong>Load Z:</strong> ${loadZ} Ω</p>`;
        results += `<p><strong>Source Z:</strong> ${sourceZ} Ω</p>`;

        if (electricalLength % 180 < 20) {
            warnings += `<p>⚠ Feedline is near a half‑wave — impedance transformation may be extreme.</p>`;
        }

        document.getElementById("flResults").innerHTML = results;
        document.getElementById("flWarnings").innerHTML = warnings;
    });
});
