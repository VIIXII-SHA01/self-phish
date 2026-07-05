// Prevent multiple overlays
if (!window.phishGuardInitialized) {

    window.phishGuardInitialized = true;

    chrome.runtime.onMessage.addListener((message) => {

        if (message.type !== "SHOW_WARNING")
            return;

        // Remove old overlay if it exists
        const existing = document.getElementById("phishguard-overlay");

        if (existing)
            existing.remove();

        const score = message.data.score;
        const reasons = message.data.reasons || [];

        // Create Overlay

        const overlay = document.createElement("div");

        overlay.id = "phishguard-overlay";

        overlay.innerHTML = `
            <div class="phishguard-container">

                <div class="phishguard-header">

                    ⚠️ Potential Phishing Website

                </div>

                <div class="phishguard-score">

                    Risk Score: ${score}/100

                </div>

                <div class="phishguard-subtitle">

                    Reasons

                </div>

                <ul class="phishguard-list">

                    ${reasons.map(reason => `<li>${reason}</li>`).join("")}

                </ul>

                <div class="phishguard-buttons">

                    <button id="pg-leave">

                        Leave Site

                    </button>

                    <button id="pg-ignore">

                        Continue Anyway

                    </button>

                </div>

            </div>
        `;

        document.documentElement.appendChild(overlay);

        // Button Events

        document
            .getElementById("pg-leave")
            .addEventListener("click", () => {

                history.back();

            });

        document
            .getElementById("pg-ignore")
            .addEventListener("click", () => {

                overlay.remove();

            });

    });

}