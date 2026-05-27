/* ============================================================
   utils.js — HF Math Engine
   Shared utilities for all HF Tools
   ============================================================ */

const HFUtils = {

    /* --------------------------------------------------------
       Wavelength (feet)
       λ = 984 / f(MHz)
       -------------------------------------------------------- */
    wavelength(freqMHz) {
        if (!freqMHz || freqMHz <= 0) return 0;
        return 984 / freqMHz;
    },

    /* --------------------------------------------------------
       NVIS Angle Estimation
       Based on height/wavelength ratio
       -------------------------------------------------------- */
    nvisAngle(heightFt, freqMHz) {
        const wl = this.wavelength(freqMHz);
        if (!wl) return null;

        const ratio = heightFt / wl;

        if (ratio < 0.1) return 85;
        if (ratio < 0.15) return 78;
        if (ratio < 0.2) return 70;
        if (ratio < 0.25) return 62;
        if (ratio < 0.3) return 55;
        if (ratio < 0.4) return 48;
        if (ratio < 0.5) return 42;

        return 35;  // DX‑leaning
    },

    /* --------------------------------------------------------
       DX Lobe Classification
       -------------------------------------------------------- */
    dxLobes(heightFt, resonantFt, freqMHz) {
        const wl = this.wavelength(freqMHz);
        if (!wl) return "Unknown";

        const hRatio = heightFt / wl;

        if (hRatio < 0.15) return "High-angle dominant (NVIS)";
        if (hRatio < 0.25) return "Mostly high-angle";
        if (hRatio < 0.35) return "Mixed lobes";
        if (hRatio < 0.5) return "Moderate low-angle";
        return "Low-angle dominant (DX)";
    },

    /* --------------------------------------------------------
       Doublet Impedance Tendency
       Very simplified model
       -------------------------------------------------------- */
    doubletImpedance(wireFt, ladderFt, zOhms) {
        const total = wireFt + ladderFt;

        if (total < 60) return "Very high impedance (short doublet)";
        if (total < 90) return "Moderate impedance (tuner friendly)";
        if (total < 130) return "Low-to-moderate impedance";
        if (total < 200) return "Moderate-to-high impedance";
        return "High impedance (long doublet)";
    }

};
