/* app.js — SPA Routing and View Management */
document.addEventListener("DOMContentLoaded",function(){
/* --- View handling --- */
const views=document.querySelectorAll(".view");
function showView(id){
views.forEach(v=>{v.style.display=(v.id===id)?"block":"none";});
}
/* --- Sidebar navigation --- */
const navLinks=document.querySelectorAll("#sidebar .nav-link");
navLinks.forEach(link=>{
link.addEventListener("click",function(e){
e.preventDefault();
const viewKey=this.getAttribute("data-view");
if(!viewKey)return;
const viewId=viewKey+"-view";
showView(viewId);
});
});
/* --- Default view --- */
showView("vertical-designer-view");
});
