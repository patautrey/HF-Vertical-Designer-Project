document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("vdAnalyze");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
        const mode = document.getElementById("vdMode").value;
        const bands = Array.from(document.getElementById("vdBands").selectedOptions).map(o => o.value);
        const type = document.getElementById("vdType").value;
        const customLength = parseFloat(document.getElementById("vdCustomLength").value) || null;
        const height = parseFloat(document.getElementById("vdHeight").value) || 0;
        const ground = document.getElementById("vdGround").value;
        const radialCount = parseInt(document.getElementById("vdRadialCount").value) || 0;
        const radialLength = parseFloat(document.getElementById("vdRadialLength").value) || 0;
        const radialType = document.getElementById("vdRadialType").value;

        let results = "";
        let warnings = "";

        results += `<h3>Vertical Analysis</h3>`;
        results += `<p><strong>Mode:</strong> ${mode}</p>`;
        results += `<p><strong>Bands:</strong> ${bands.join(", ")}</p>`;
        results += `<p><strong>Antenna Type:</strong> ${type}</p>`;
        results += `<p><strong>Height:</strong> ${height} ft</p>`;
        results += `<p><strong>Ground:</strong> ${ground}</p>`;
        results += `<p><strong>Radials:</strong> ${radialCount} × ${radialLength} ft (${radialType})</p>`;

        if (height < 8) {
            warnings += `<p>⚠ Height is very low — efficiency will be reduced.</p>`;
        }

        document.getElementById("vdResults").innerHTML = results;
        document.getElementById("vdWarnings").innerHTML = warnings;
    });
});

