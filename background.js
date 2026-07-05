
// Self-Phish Background Service

import { normalizeURL } from "./detector/normalize.js";
import { checkBlacklist } from "./detector/blacklist.js";
import { runHeuristics } from "./detector/heuristics.js";
import { calculateRisk } from "./detector/scoring.js";
import { log } from "./utils/logger.js";

// Ignore browser internal pages
const ignoredProtocols = [
    "chrome:",
    "edge:",
    "about:",
    "file:",
    "chrome-extension:"
];

// Listen for completed page loads
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status !== "complete")
        return;

    if (!tab.url)
        return;

    if (ignoredProtocols.some(protocol => tab.url.startsWith(protocol)))
        return;

    try {

        await analyzeWebsite(tab.url, tabId);

    } catch (err) {

        console.error(err);

    }

});

// Main Analysis Function

async function analyzeWebsite(url, tabId) {

    log("Checking:", url);

    // Normalize URL

    const normalized = normalizeURL(url);

    log("Normalized:", normalized);

    // Blacklist Check

    const blacklistResult = await checkBlacklist(normalized);

    if (blacklistResult.found) {

        log("PhishTank Match");

        await showWarning(tabId, {

            score: 100,

            reasons: [

                "Known phishing website (PhishTank)"

            ]

        });

        return;

    }

    // Run Heuristic Engine

    const heuristicResult = await runHeuristics(normalized);

    // Compute Score

    const score = calculateRisk(

        heuristicResult.results

    );

    log("Risk Score:", score);

    // Warning Threshold

    if (score >= 60) {

        await showWarning(tabId, {

            score,

            reasons: heuristicResult.results

        });

    }

}

// Inject Warning Overlay

async function showWarning(tabId, data) {

    await chrome.scripting.insertCSS({

        target: {

            tabId

        },

        files: [

            "content/warning.css"

        ]

    });

    await chrome.scripting.executeScript({

        target: {

            tabId

        },

        files: [

            "content/warning.js"

        ]

    });

    chrome.tabs.sendMessage(tabId, {

        type: "SHOW_WARNING",

        data

    });

}