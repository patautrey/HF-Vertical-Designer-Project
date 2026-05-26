/* utils.js — Complete HF Math Engine (NVIS, DX, Doublet, OCF, Loop, Random-Wire) */
const HFUtils=(function(){
/* --- Constants --- */
const c=984; /* speed of light in ft per MHz */
const avoidLengths=[16,32,44,55,88,110];
const randomSafe=[29,35.5,41,58,71,84,107,124];

/* --- Basic wavelength --- */
function wavelength(bandMHz){return c/bandMHz;}

/* --- NVIS angle estimation --- */
function nvisAngle(heightFt,bandMHz){
if(!heightFt||!bandMHz)return null;
const wl=wavelength(bandMHz);
const hRatio=heightFt/(wl*3.28);
if(hRatio<0.15)return 85;
if(hRatio<0.25)return 75;
if(hRatio<0.35)return 60;
if(hRatio<0.5)return 45;
return 30;
}

/* --- DX lobe tendency --- */
function dxLobes(heightFt,wireFt,bandMHz){
if(!heightFt||!wireFt||!bandMHz)return "Insufficient data.";
const wl=wavelength(bandMHz);
const hRatio=heightFt/(wl*3.28);
if(hRatio<0.15)return "High-angle dominant (NVIS).";
if(hRatio<0.25)return "Mostly high-angle with some low-angle leakage.";
if(hRatio<0.5)return "Mixed lobes, moderate DX potential.";
return "Low-angle dominant, strong DX potential.";
}

/* --- Avoid-length classifier --- */
function classifyAvoid(len){
if(avoidLengths.some(a=>Math.abs(a-len)<0.5))return "avoid";
if(!randomSafe.some(s=>Math.abs(s-len)<0.5))return "borderline";
return "safe";
}

/* --- Random-wire band coverage --- */
function randomWireCoverage(len,bands){
let easy=[],hard=[],no=[];
bands.forEach(b=>{
const wl=wavelength(b);
const ratio=len/wl;
if(ratio>0.2&&ratio<1.5)easy.push(b);
else if(ratio>=1.5&&ratio<3)hard.push(b);
else no.push(b);
});
return{easy,hard,no};
}

/* --- Doublet impedance tendency --- */
function doubletImpedance(wireFt,ladderFt,ladderZ){
if(!wireFt||!ladderFt)return"Unknown";
if(Math.abs(wireFt-66)<1)return"40m-resonant wire: expect high Z on other bands.";
if(Math.abs(wireFt-102)<1)return"G5RV-length wire: requires correct ladder-line.";
if(Math.abs(wireFt-93)<1)return"ZS6BKW-length wire: requires correct ladder-line.";
if(ladderFt<15)return"Short ladder-line: high transformation ratio.";
return"Typical multiband doublet impedance.";
}

/* --- OCF feedpoint model --- */
function ocfFeedpoint(offsetPct){
if(offsetPct<20)return"Severe imbalance, extreme impedance.";
if(offsetPct<30)return"Moderate imbalance, some bands difficult.";
if(offsetPct<40)return"Balanced for 40/20/10m.";
return"Offset too large, pattern distortion likely.";
}

/* --- Loop pattern tendencies --- */
function loopPattern(shape,circFt,bandMHz){
if(!circFt||!bandMHz)return"Unknown.";
const wl=wavelength(bandMHz);
const ratio=circFt/wl;
if(ratio<0.8)return"Electrically small loop: high-angle dominant.";
if(ratio<1.2)return"Full-wave loop: excellent NVIS + omnidirectional.";
if(ratio<2)return"Multi-wave loop: complex lobes, some DX potential.";
return"Large loop: strong low-angle lobes.";
}

/* --- Tuner difficulty scoring --- */
function tunerDifficulty(Z){
if(!Z||isNaN(Z))return"Unknown";
if(Z<50)return"Easy";
if(Z<200)return"Moderate";
if(Z<600)return"Hard";
return"Extreme";
}

/* --- Export API --- */
return{
wavelength,
nvisAngle,
dxLobes,
classifyAvoid,
randomWireCoverage,
doubletImpedance,
ocfFeedpoint,
loopPattern,
tunerDifficulty
};
})();
