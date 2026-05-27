/* feedline-matching.js — Full Module Logic */

document.addEventListener("DOMContentLoaded", function () {

    /* DOM Elements */
    const flType = document.getElementById("flType");
    const flCustomBlock = document.getElementById("flCustomBlock");
    const flCustomVF = document.getElementById("flCustomVF");

    const flLength = document.getElementById("flLength");
    const flFreq = document.getElementById("flFreq");
    const flLoadZ = document.getElementById("flLoadZ");
    const flSourceZ = document.getElementById("flSourceZ");

    const flAnalyze = document.getElementById("flAnalyze");
    const flResults = document.getElementById("flResults");
    const flWarnings = document.getElementById("flWarnings");

    /* Feedline Database */
    const feedlineDB = {
        rg58:   { vf: 0.64, loss: 1.5 },
        rg8x:   { vf: 0.78, loss: 1.0 },
        rg213:  { vf: 0.66, loss: 0.7 },
        lmr240: { vf: 0.84, loss: 0.5 },
        lmr400: { vf: 0.85, loss: 0.25 },
        ladder300: { vf: 0.91, loss: 0.1 },
        ladder450: { vf: 0.95, loss: 0.05 },
        ladder600: { vf: 0.98, loss: 0.03 }
    };

    /* Show/Hide Custom VF */
    flType.addEventListener("change", () => {
        flCustomBlock.style.display = (flType.value === "custom") ? "block" : "none";
    });

    /* Compute Electrical Length */
    function electricalLengthFeet(freqMHz, vf) {
        const wl = HFUtils.wavelength(freqMHz); // meters
        const wlFt = wl * 3.28;
        return wlFt * vf;
    }

    /* Impedance Transformation */
    function transformImpedance(Zload, Z0, lengthFt, freqMHz, vf) {
        const wl = electricalLengthFeet(freqMHz, vf);
        const electricalDeg = (lengthFt / wl) * 360;
        const theta = (electricalDeg * Math.PI) / 180;

        const j = math.complex(0, 1);
        const ZL = math.complex(Zload, 0);

        const numerator = math.add(ZL, math.multiply(j, Z0 * Math.tan(theta)));
        const denominator = math.add(Z0, math.multiply(j, ZL * Math.tan(theta)));
        const Zin = math.multiply(Z0, math.divide(numerator, denominator));

        return Zin;
    }

    /* SWR */
    function computeSWR(Zin, Z0) {
        const R = math.abs(Zin.re);
        const swr = (R > Z0) ? (R / Z0) : (Z0 / R);
        return swr.toFixed(2);
    }

    /* Loss Calculation */
    function computeLoss(lossPer100ft, lengthFt, freqMHz) {
        const scale = lengthFt / 100;
        const freqFactor = freqMHz / 10;
        return (lossPer100ft * scale * freqFactor).toFixed(2);
    }

    /* Main Analysis */
    flAnalyze.addEventListener("click", () => {

        flResults.innerHTML = "";
        flWarnings.innerHTML = "";

        const type = flType.value;
        const lengthFt = parseFloat(flLength.value) || 0;
        const freqMHz = parseFloat(flFreq.value) || 0;
        const Zload = parseFloat(flLoadZ.value) || 50;
        const Zsource = parseFloat(flSourceZ.value) || 50;

        let vf = 0.66;
        let loss = 1.0;

        if (type === "custom") {
            vf = parseFloat(flCustomVF.value) || 0.80;
            loss = 1.0;
        } else {
            vf = feedlineDB[type].vf;
            loss = feedlineDB[type].loss;
        }

        const Zin = transformImpedance(Zload, Zsource, lengthFt, freqMHz, vf);
        const swr = computeSWR(Zin, Zsource);
        const totalLoss = computeLoss(loss, lengthFt, freqMHz);

        flResults.innerHTML = `
            <div style="padding:10px; border:1px solid #ccc; border-radius:6px;">
                <p><b>Feedline VF:</b> ${vf}</p>
                <p><b>Electrical Length:</b> ${electricalLengthFeet(freqMHz, vf).toFixed(1)} ft</p>
                <p><b>Input Impedance:</b> ${Zin.re.toFixed(1)} + j${Zin.im.toFixed(1)} Ω</p>
                <p><b>SWR at Source:</b> ${swr}</p>
                <p><b>Estimated Loss:</b> ${totalLoss} dB</p>
            </div>
        `;
    });

});
