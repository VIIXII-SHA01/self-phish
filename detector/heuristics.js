
// Heuristic Detection Engine

import {

    isHTTPS,
    countSubdomains,
    normalizeHost,
    normalizeHomographs,
    isTrustedDomain,
    isShortenedUrl,
    looksLikeBrandImpersonation,
    hasHomographSubstitution,
    detectEmbeddedSuspiciousReference

} from "./normalize.js";
import { isIPAddress } from "./ipcheck.js";
import { checkLookalike } from "./lookalike.js";
import { checkDomainAge } from "./domainage.js";

// Suspicious keywords

const suspiciousKeywords = [

    "login",
    "verify",
    "secure",
    "banking",
    "signin",
    "account",
    "update",
    "paypal",
    "netflix",
    "microsoft",
    "google",
    "apple",
    "facebook"

];

function escapeRegExp(value) {

    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

// Main Heuristic Engine

export async function runHeuristics(urlData) {

    if (!urlData) {

        return {

            results: [{

                type: "INVALID_URL",

                score: 100,

                message: "Invalid URL format."

            }]

        };

    }

    const results = [];
    const originalUrl = urlData.original || "";
    const hostname = normalizeHost(urlData.hostname || "");
    const pathname = urlData.pathname || "";
    const normalizedHostForCheck = normalizeHost(hostname);
    const normalizedPath = normalizeHomographs(pathname);
    const normalizedHost = normalizeHomographs(normalizedHostForCheck);
    const hasSubstitution = hasHomographSubstitution(hostname, normalizedHost);
    const isTrusted = isTrustedDomain(hostname);
    const isShortened = isShortenedUrl(hostname);

    // HTTPS

    if (!isHTTPS(originalUrl)) {

        results.push({

            type: "HTTPS",

            score: 10,
            message: "Website does not use HTTPS."

        });

    }

    // IP Address

    if (isIPAddress(hostname)) {

        results.push({

            type: "IP",
            score: 40,
            message: "Website uses an IP address instead of a domain."

        });

    }

    // Misplaced double slash

    if (originalUrl.lastIndexOf("//") > 7) {

        results.push({

            type: "DOUBLE_SLASH",
            score: 30,
            message: "Suspicious positioning of the // symbol."

        });

    }

    // Long URL

    if (originalUrl.length > 75) {

        results.push({

            type: "LONG_URL",
            score: 15,
            message: "URL length is exceptionally long (> 75 characters)."

        });

    }

    // Too many subdomains

    const subdomains = countSubdomains(hostname);

    if (subdomains >= 3) {

        results.push({

            type: "SUBDOMAIN",
            score: 25,
            message: `Contains ${subdomains} subdomains.`

        });

    }

    // URL shortener

    if (isShortened) {

        results.push({

            type: "SHORTENER",
            score: 50,
            message: "URL uses a shortener service."

        });

    }

    // Impersonation heuristics

    else if (!isTrusted && looksLikeBrandImpersonation(hostname, pathname)) {

        results.push({

            type: "BRAND_IMPERSONATION",
            score: 50,
            message: "Domain does not appear in the trusted allowlist and looks like brand impersonation."

        });

    }

    // Path mimicking login/account flow

    if (/(login|signin|verify|account|secure|update|paypal)(?:_|-|\.|\/|$)/i.test(pathname)) {

        results.push({

            type: "PATH_FLOW",
            score: 25,
            message: "Path mimics a login or account flow for a branded service."

        });

    }

    // Embedded shortener or brand-like references inside the full URL text

    const embeddedReference = detectEmbeddedSuspiciousReference(hostname, originalUrl);

    if (embeddedReference) {

        results.push({

            type: embeddedReference.type,
            score: embeddedReference.type === "SHORTENER" ? 50 : 40,
            message: embeddedReference.message

        });

    }

    // Suspicious keywords

    for (const keyword of suspiciousKeywords) {

        const keywordPattern = new RegExp(escapeRegExp(keyword), "i");
        const looksLikeRealDomain = new RegExp(`${escapeRegExp(keyword)}\.[a-z]{2,}$`, "i");

        if (keywordPattern.test(normalizedHost) || keywordPattern.test(normalizedPath)) {

            if (!looksLikeRealDomain.test(normalizedHost) || hasSubstitution) {

                results.push({

                    type: "KEYWORD",
                    score: hasSubstitution ? 40 : 20,
                    message: `Contains suspicious keyword target: "${keyword}".`

                });

                break;

            }

        }

    }

    // Lookalike detection

    const lookalike = checkLookalike(hostname);

    if (lookalike.detected) {

        results.push({

            type: "LOOKALIKE",
            score: 50,
            message: `Looks similar to ${lookalike.brand}.`

        });

    }

    // Domain age

    const age = await checkDomainAge(hostname);

    if (age.suspicious) {

        results.push({

            type: "DOMAIN_AGE",
            score: 30,
            message: age.message

        });

    }

    return { results };

}