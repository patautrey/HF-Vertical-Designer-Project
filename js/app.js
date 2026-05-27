/* ============================================================
   app.js — SPA Loader & Router
   HF Tools Suite — KG5IEF
   ============================================================ */

(function() {

    const mainEl = document.getElementById("main");
    const navLinks = document.querySelectorAll("[data-view]");

    const routes = {
        "welcome": "partials/welcome.html",              // optional; falls back to inline welcome if missing
        "vertical-designer": "partials/vertical-designer.html",
        "feedline-matching": "partials/feedline-matching.html",
        "dx-patterns": "partials/dx-patterns.html",
        "nvis-field": "partials/nvis-field.html",
        "doublet-designer": "partials/doublet-designer.html",
        "random-wire": "partials/random-wire.html",
        "user-manual": "partials/user-manual.html",
        "quick-start": "partials/quick-start.html"
    };

    function loadView(view) {
        const url = routes[view];
        if (!url) return;

        fetch(url + "?v=1")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load view");
                return res.text();
            })
            .then(html => {
                mainEl.innerHTML = html;
            })
            .catch(err => {
                console.error(err);
                mainEl.innerHTML = `
                    <section class="tool-header">
                        <h2>Error</h2>
                        <p>Unable to load view: ${view}</p>
                    </section>
                `;
            });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const view = link.getAttribute("data-view");
            loadView(view);
        });
    });

})();
