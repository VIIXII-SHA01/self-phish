
// Blacklist Detection Module

import { getHostname } from "./normalize.js";

let blacklistSet = null;

// Load blacklist into memory

async function loadBlacklist() {

    if (blacklistSet)
        return blacklistSet;

    // Try chrome.storage.local first, in case the user has updated the database

    const storage = await chrome.storage.local.get([
        "phishtankDatabase"
    ]);

    if (
        storage.phishtankDatabase &&
        storage.phishtankDatabase.length > 0
    ) {

        blacklistSet = new Set(
            storage.phishtankDatabase.map(domain =>
                domain.toLowerCase().trim()
            )
        );

        return blacklistSet;

    }

    // Fallback to bundled JSON

    const response = await fetch(
        chrome.runtime.getURL(
            "database/phishtank.json"
        )
    );

    const data = await response.json();

    blacklistSet = new Set(

        data.map(domain =>
            domain.toLowerCase().trim()
        )

    );

    return blacklistSet;

}

// Check URL

export async function checkBlacklist(url) {

    const hostname = getHostname(url);

    if (!hostname) {

        return {

            found: false,

            reason: "Invalid URL"

        };

    }

    const blacklist = await loadBlacklist();

    const found = blacklist.has(hostname);

    return {

        found,

        hostname,

        reason: found
            ? "Known phishing domain (PhishTank)"
            : null

    };

}

// Force reload database

export function clearBlacklistCache() {

    blacklistSet = null;

}