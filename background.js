
// Self-Phish Background Service

import { normalizeURL } from "./detector/normalize.js";
import { checkBlacklist } from "./detector/blacklist.js";
import { runHeuristics } from "./detector/heuristics.js";
import { calculateRisk } from "./detector/scoring.js";
import { log } from "./utils/logger.js";
import { save } from "./utils/storage.js";

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

    try {

        log("Checking:", url);

        // Normalize URL

        const normalized = normalizeURL(url);

        log("Normalized:", normalized);

        if (!normalized) {

            await save("lastScan", {

                url: url,
                score: 100,
                level: "DANGEROUS",
                reasons: ["Invalid URL format."]

            });

            await showWarning(tabId, {

                score: 100,

                reasons: ["Invalid URL format."]

            });

            return;

        }

        // Blacklist Check

        const blacklistResult = await checkBlacklist(normalized);

        if (blacklistResult.found) {

            log("PhishTank Match");

            await save("lastScan", {

                url: url,
                score: 100,
                level: "DANGEROUS",
                reasons: ["Known phishing website (PhishTank)"]

            });

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

        const risk = calculateRisk(

            heuristicResult.results

        );

        log("Risk Score:", risk);

        // Persist scan result for popup

        await save("lastScan", {

            url: url,
            score: risk.score,
            level: risk.level,
            reasons: heuristicResult.results.map(result => result.message)

        });

        // Warning Threshold

        if (risk.score >= 40) {

            await showWarning(tabId, {

                score: risk.score,

                reasons: heuristicResult.results.map(result => result.message)

            });

        }

    }

    catch (error) {

        console.error("Website analysis failed:", error);

    }

}

// Inject Warning Overlay

async function showWarning(tabId, data) {

    try {

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

        }, () => {

            if (chrome.runtime.lastError) {

                console.debug("Warning message not delivered:", chrome.runtime.lastError.message);

            }

        });

    }

    catch (error) {

        console.error("Warning injection failed:", error);

    }

}