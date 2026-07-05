
// Heuristic Detection Engine

import { isHTTPS, countSubdomains } from "./normalize.js";
import { isIPAddress } from "./ipcheck.js";
import { checkLookalike } from "./lookalike.js";
import { checkDomainAge } from "./domainage.js";

// Suspicious keywords

const suspiciousKeywords = [

    "login",
    "verify",
    "verification",
    "secure",
    "update",
    "account",
    "wallet",
    "bank",
    "signin",
    "confirm",
    "password",
    "recover",
    "payment"

];

// Main Heuristic Engine

export async function runHeuristics(urlData) {

    const results = [];

    // HTTPS

    if (!isHTTPS(urlData.original)) {

        results.push({

            type: "HTTPS",

            score: 10,

            message: "Website does not use HTTPS."

        });

    }

    // IP Address

    if (isIPAddress(urlData.hostname)) {

        results.push({

            type: "IP",

            score: 40,

            message: "Website uses an IP address instead of a domain."

        });

    }

    // Long URL

    if (urlData.original.length > 100) {

        results.push({

            type: "LONG_URL",

            score: 10,

            message: "URL is unusually long."

        });

    }

    if (urlData.original.length > 200) {

        results.push({

            type: "VERY_LONG_URL",

            score: 20,

            message: "URL is extremely long."

        });

    }

    // Too many subdomains

    const subdomains = countSubdomains(
        urlData.hostname
    );

    if (subdomains >= 3) {

        results.push({

            type: "SUBDOMAIN",

            score: 15,

            message: `Contains ${subdomains} subdomains.`

        });

    }

    // Suspicious keywords

    const lowerURL = urlData.original.toLowerCase();

    for (const keyword of suspiciousKeywords) {

        if (lowerURL.includes(keyword)) {

            results.push({

                type: "KEYWORD",

                score: 5,

                message: `Contains keyword "${keyword}".`

            });

        }

    }

    // Lookalike detection


    const lookalike = checkLookalike(
        urlData.hostname
    );

    if (lookalike.detected) {

        results.push({

            type: "LOOKALIKE",

            score: 50,

            message:
                `Looks similar to ${lookalike.brand}.`

        });

    }

    // Domain age

    const age = await checkDomainAge(
        urlData.hostname
    );

    if (age.suspicious) {

        results.push({

            type: "DOMAIN_AGE",

            score: 30,

            message:
                age.message

        });

    }

    // Return all findings

    return {

        results

    };

}