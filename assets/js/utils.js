const utils=(function(){
const C=299792458;
function wavelengthFeet(freqMHz){
const freqHz=freqMHz*1e6;
const lambdaMeters=C/freqHz;
return lambdaMeters*3.28084;
}
function estimateResonantFreqMHz(lengthFt){
if(lengthFt<=0)return 0;
const lengthMeters=lengthFt/3.28084;
const vf=0.95;
const lambdaEff=4*lengthMeters/vf;
const freqHz=C/lambdaEff;
return freqHz/1e6;
}
function estimateFeedImpedance(elecLength,ground,loading){
let z0=36;
if(elecLength<0.2)z0*=0.7;
else if(elecLength>0.3)z0*=1.2;
if(ground==="minimal")z0*=0.7;
else if(ground==="dense")z0*=1.1;
if(loading==="base")z0*=0.8;
else if(loading==="top")z0*=1.1;
return Math.max(5,Math.min(200,z0));
}
function estimateSWR(zAnt,zRef){
if(zRef<=0)return 1;
const r=zAnt/zRef;
const gamma=Math.abs((r-1)/(r+1));
return (1+gamma)/(1-gamma||1e-6);
}
function describePattern(elecLength,ground,mastFt,feedFt){
let base="Low-angle DX focus with typical vertical pattern.";
if(elecLength<0.2)base="Short vertical with higher-angle energy, useful for regional coverage.";
else if(elecLength>0.3)base="Slightly extended vertical with stronger low-angle radiation for DX paths.";
if(ground==="minimal")base+=" Efficiency limited by sparse radial system.";
else if(ground==="field")base+=" Balanced compromise radial system for field deployment.";
else if(ground==="dense")base+=" Enhanced efficiency from dense radial field.";
if(mastFt>40)base+=" Elevated support may slightly alter near-field environment.";
if(feedFt>3)base+=" Raised feedpoint can change common-mode behavior on the feedline.";
return base;
}
return{
wavelengthFeet,
estimateResonantFreqMHz,
estimateFeedImpedance,
estimateSWR,
describePattern
};
})();

