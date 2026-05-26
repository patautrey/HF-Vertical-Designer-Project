(function(){
const html=document.documentElement;
const body=document.body;
const navbarContainer=document.getElementById("app-navbar");
const sidebarContainer=document.getElementById("app-sidebar");
const main=document.getElementById("app-main");
function loadPartial(target,path){
return fetch(path).then(r=>r.text()).then(html=>{target.innerHTML=html;}).catch(()=>{});
}
function initTheme(){
const stored=localStorage.getItem("hfvd-theme");
if(stored==="light"||stored==="dark"){
html.setAttribute("data-theme",stored);
}else{
html.setAttribute("data-theme","auto");
}
updateThemeIcon();
}
function toggleTheme(){
const current=html.getAttribute("data-theme")||"auto";
let next;
if(current==="auto"){
next="dark";
}else if(current==="dark"){
next="light";
}else{
next="auto";
}
html.setAttribute("data-theme",next);
if(next==="auto"){
localStorage.removeItem("hfvd-theme");
}else{
localStorage.setItem("hfvd-theme",next);
}
updateThemeIcon();
}
function updateThemeIcon(){
const icon=document.getElementById("theme-icon");
if(!icon)return;
const mode=html.getAttribute("data-theme")||"auto";
if(mode==="dark"){
icon.textContent="☀";
}else if(mode==="light"){
icon.textContent="☾";
}else{
icon.textContent="◎";
}
}
function initSidebarBehavior(){
body.classList.add("sidebar-collapsed");
const toggle=document.getElementById("sidebar-toggle");
if(toggle){
toggle.addEventListener("click",()=>{body.classList.toggle("sidebar-collapsed");});
}
sidebarContainer.addEventListener("click",ev=>{
const btn=ev.target.closest(".sidebar-item");
if(!btn||btn.classList.contains("sidebar-item-disabled"))return;
const targetId=btn.getAttribute("data-nav-target");
if(!targetId)return;
switchView(targetId);
sidebarContainer.querySelectorAll(".sidebar-item").forEach(b=>b.classList.remove("sidebar-item-active"));
btn.classList.add("sidebar-item-active");
});
main.addEventListener("click",ev=>{
const btn=ev.target.closest("[data-nav-target]");
if(!btn)return;
const targetId=btn.getAttribute("data-nav-target");
if(!targetId)return;
switchView(targetId);
sidebarContainer.querySelectorAll(".sidebar-item").forEach(b=>{
if(b.getAttribute("data-nav-target")===targetId){
b.classList.add("sidebar-item-active");
}else{
b.classList.remove("sidebar-item-active");
}
});
});
}
function switchView(targetId){
document.querySelectorAll(".app-view").forEach(v=>v.classList.remove("app-view-active"));
const target=document.getElementById(targetId);
if(target){
target.classList.add("app-view-active");
}
}
function initVerticalDesigner(){
const runBtn=document.getElementById("btn-run-vertical");
if(!runBtn)return;
runBtn.addEventListener("click",()=>{
const elFt=parseFloat(document.getElementById("el-length-ft").value)||0;
const mastFt=parseFloat(document.getElementById("mast-height-ft").value)||0;
const bandMHz=parseFloat(document.getElementById("band-select").value)||14;
const ground=document.getElementById("ground-system").value;
const loading=document.getElementById("loading-mode").value;
const feedFt=parseFloat(document.getElementById("feedpoint-height-ft").value)||0;
const freqMHz=bandMHz;
const wavelengthFt=utils.wavelengthFeet(freqMHz);
const elecLength=elFt/wavelengthFt;
const resonance=utils.estimateResonantFreqMHz(elFt);
const feedZ=utils.estimateFeedImpedance(elecLength,ground,loading);
const swr=utils.estimateSWR(feedZ,50);
const pattern=utils.describePattern(elecLength,ground,mastFt,feedFt);
document.getElementById("summary-elec-length").textContent=elecLength.toFixed(2)+" λ";
document.getElementById("summary-resonance").textContent=resonance.toFixed(2)+" MHz";
document.getElementById("summary-feedz").textContent=feedZ.toFixed(0)+" Ω";
document.getElementById("summary-swr").textContent=swr.toFixed(1)+":1";
document.getElementById("summary-pattern").textContent=pattern;
});
}
document.addEventListener("DOMContentLoaded",()=>{
Promise.all([
loadPartial(navbarContainer,"partials/navbar.html"),
loadPartial(sidebarContainer,"partials/sidebar.html")
]).then(()=>{
initTheme();
const themeToggle=document.getElementById("theme-toggle");
if(themeToggle){
themeToggle.addEventListener("click",toggleTheme);
}
initSidebarBehavior();
initVerticalDesigner();
});
});
})();

