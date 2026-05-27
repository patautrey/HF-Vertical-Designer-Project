// /js/app.js
// ------------------------------------------------------------
// SPA ROUTER WITH DYNAMIC SCRIPT LOADING + LIVE SIDEBAR BINDING
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

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

    // Map view names to JS modules
    const scripts = {
        "vertical-designer": "js/vertical-designer.js",
        "feedline-matching": "js/feedline-matching.js",
        "dx-patterns": "js/dx-patterns.js",
        "nvis-field": "js/nvis-field.js",
        "doublet-designer": "js/doublet-designer.js",
        "random-wire": "js/random-wire.js"
    };

    // Remove previously loaded tool scripts
    function removeOldToolScripts() {
        document.querySelectorAll("script[data-tool]").forEach(s => s.remove());
    }

    // Dynamically load the JS module for the selected tool
    function loadToolScript(viewName) {
        const file = scripts[viewName];
        if (!file) return;

        const script = document.createElement("script");
        script.src = file + "?v=" + Date.now();
        script.dataset.tool = "true";
        document.body.appendChild(script);
    }

    // Load a partial into #main and then load its JS module
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

            removeOldToolScripts();
            loadToolScript(viewName);

        } catch (err) {
            main.innerHTML = `<p>Error loading view: ${file}</p>`;
        }
    }

    // Attach click handlers to sidebar links
    function bindSidebarLinks() {
        document.querySelectorAll("[data-view]").forEach(link => {
            link.onclick = event => {
                event.preventDefault();
                const view = link.getAttribute("data-view");
                loadView(view);
            };
        });
    }

    // Bind immediately (in case sidebar is already present)
    bindSidebarLinks();

    // Watch for DOM changes (sidebar injected later)
    const observer = new MutationObserver(bindSidebarLinks);
    observer.observe(document.body, { childList: true, subtree: true });

});
