
// PhishTank Database Updater

// Replace this with the official feed URL you choose to use.
const PHISHTANK_FEED_URL = "https://data.phishtank.com/data/online-valid.json";


// Download latest database

export async function updateDatabase() {

    try {

        console.log("Downloading PhishTank database...");

        const response = await fetch(PHISHTANK_FEED_URL);

        if (!response.ok) {

            throw new Error("Download failed.");

        }

        const data = await response.json();

        // Convert to hostname list

        const domains = [];

        for (const entry of data) {

            if (!entry.url)
                continue;

            try {

                const hostname = normalizeHostname(entry.url);

                if (hostname)
                    domains.push(hostname);

            }

            catch {

                // Ignore malformed URLs

            }

        }

        // Remove duplicates

        const uniqueDomains = [...new Set(domains)];

        // Save to storage

        await chrome.storage.local.set({

            phishtankDatabase: uniqueDomains,

            phishtankLastUpdate: Date.now()

        });

        console.log(

            `Database updated (${uniqueDomains.length} domains).`

        );

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}

// Normalize Hostname

function normalizeHostname(url) {

    const parsed = new URL(url);

    return parsed.hostname

        .replace(/^www\./, "")

        .toLowerCase();

}