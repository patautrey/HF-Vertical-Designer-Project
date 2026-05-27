/* ============================================================
   app.js — SPA Router + Dynamic Loader
   HF Vertical Designer Project
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const main = document.getElementById("main");
    const links = document.querySelectorAll("#sidebar a");

    /* Track currently loaded tool script */
    let activeScript = null;

    /* ========================================================
       Load Partial HTML
       ======================================================== */
    async function loadView(viewName) {
        const url = `partials/${viewName}.html`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                main.innerHTML = `<p>Error loading view: ${viewName}</p>`;
                return;
            }

            const html = await response.text();
            main.innerHTML = html;

        } catch (err) {
            main.innerHTML = `<p>Failed to load view: ${viewName}</p>`;
        }
    }

    /* ========================================================
       Load Tool Script Dynamically
       ======================================================== */
    function loadToolScript(viewName) {

        /* Remove old script if present */
        if (activeScript) {
            activeScript.remove();
            activeScript = null;
        }

        /* Build script path */
        const script = document.createElement("script");
        script.src = `js/${viewName}.js?v=1`;
        script.type = "text/javascript";

        /* Attach */
        document.body.appendChild(script);
        activeScript = script;
    }

    /* ========================================================
       Handle Sidebar Clicks
       ======================================================== */
    links.forEach(link => {
        link.addEventListener("click", evt => {
            evt.preventDefault();

            const view = link.dataset.view;
            if (!view) return;

            loadView(view);
            loadToolScript(view);
        });
    });

});
