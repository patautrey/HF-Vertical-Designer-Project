// /js/app.js
// ------------------------------------------------------------
// SIMPLE SPA ROUTER FOR HF VERTICAL DESIGNER PROJECT
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // Main content container
    const main = document.getElementById("main");

    // Map view names to partial HTML files
    const views = {
        "vertical-designer": "partials/vertical-designer.html",
        "feedline-matching": "partials/feedline-matching.html",
        "dx-patterns": "partials/dx-patterns.html",
        "nvis-field": "partials/nvis-field.html",
        "doublet-designer": "partials/doublet-designer.html",
        "random-wire": "partials/random-wire.html"
    };

    // Load a partial into #main
    async function loadView(viewName) {
        const file = views[viewName];
        if (!file) {
            main.innerHTML = `<p>View not found: ${viewName}</p>`;
            return;
        }

        try {
            const response = await fetch(file + "?v=" + Date.now());
            const html = await response.text();
            main.innerHTML = html;
        } catch (err) {
            main.innerHTML = `<p>Error loading view: ${file}</p>`;
        }
    }

    // Attach click handlers to sidebar links
    document.querySelectorAll("[data-view]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const view = link.getAttribute("data-view");
            loadView(view);
        });
    });

});
