async function initializePopup() {

    // Get active tab

    const tabs = await chrome.tabs.query({

        active: true,

        currentWindow: true

    });

    const tab = tabs[0];

    document.getElementById("website").textContent = tab.url;

    // Read latest scan result

    chrome.storage.local.get(

        ["lastScan"],

        (result) => {

            if (!result.lastScan)
                return;

            updateUI(result.lastScan);

        }

    );

}

// Update popup information

function updateUI(scan) {

    const scoreElement = document.getElementById("score");

    const statusElement = document.getElementById("status");

    scoreElement.textContent = `${scan.score} / 100`;

    scoreElement.className = "score";

    statusElement.className = "status";

    if (scan.score >= 60) {

        scoreElement.classList.add("danger");

        statusElement.classList.add("danger");

        statusElement.textContent = "⚠️ Dangerous";

    }

    else if (scan.score >= 30) {

        scoreElement.classList.add("warning");

        statusElement.classList.add("warning");

        statusElement.textContent = "⚠️ Suspicious";

    }

    else {

        scoreElement.classList.add("safe");

        statusElement.classList.add("safe");

        statusElement.textContent = "✅ Safe";

    }

}

// Update database button

document

    .getElementById("updateDB")

    .addEventListener("click", () => {

        chrome.runtime.sendMessage({

            action: "UPDATE_DATABASE"

        });

        alert("Database update started.");

    });

initializePopup();