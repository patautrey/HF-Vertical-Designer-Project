document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("dxAnalyze");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
        const freq = parseFloat(document.getElementById("dxFreq").value) || 0;
        const height = parseFloat(document.getElementById("dxHeight").value) || 0;
        const type = document.getElementById("dxAntennaType").value;
        const ground = document.getElementById("dxGround").value;
        const mode = document.getElementById("dxMode").value;

        let results = "";
        let warnings = "";

        results += `<h3>DX Pattern Analysis</h3>`;
        results += `<p><strong>Frequency:</strong> ${freq} MHz</p>`;
        results += `<p><strong>Height:</strong> ${height} ft</p>`;
        results += `<p><strong>Antenna:</strong> ${type}</p>`;
        results += `<p><strong>Ground:</strong> ${ground}</p>`;
        results += `<p><strong>Mode:</strong> ${mode}</p>`;

        if (height < 20 && type !== "vertical") {
            warnings += `<p>⚠ Low height reduces DX performance for horizontal antennas.</p>`;
        }

        document.getElementById("dxResults").innerHTML = results;
        document.getElementById("dxWarnings").innerHTML = warnings;
    });
});

