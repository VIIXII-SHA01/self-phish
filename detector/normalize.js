// ======================================
// URL Normalization Module
// ======================================

const homographMap = {

    I: "l",
    0: "o",
    1: "l",
    5: "s",
    S: "s",
    O: "o"

};

const trustedDomains = [

    "paypal.com",
    "google.com",
    "microsoft.com",
    "apple.com",
    "netflix.com",
    "amazon.com",
    "github.com",
    "facebook.com",
    "meta.com",
    "instagram.com",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "youtube.com",
    "outlook.com",
    "office.com",
    "dropbox.com",
    "zoom.us",
    "slack.com",
    "salesforce.com"

];

const shortenerDomains = [

    "bit.ly",
    "tinyurl.com",
    "t.ly",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "cutt.ly",
    "rebrand.ly",
    "tiny.cc",
    "shorturl.at",
    "buff.ly",
    "v.gd",
    "s.id",
    "u.to",
    "shorte.st",
    "rb.gy",
    "bl.ink",
    "lnkd.in",
    "tiny.one",
    "t.co",
    "trib.al",
    "urlz.fr",
    "adf.ly"

];

const brandTerms = [

    "login",
    "signin",
    "verify",
    "secure",
    "account",
    "paypal",
    "netflix",
    "microsoft",
    "google",
    "apple",
    "facebook"

];

export function normalizeURL(url) {

    try {

        const parsed = new URL(url);

        let hostname = parsed.hostname
            .toLowerCase()
            .trim()
            .replace(/^www\./, "")
            .replace(/\.$/, "");

        let pathname = parsed.pathname.replace(/\/+/g, "/");

        if (pathname.length > 1 && pathname.endsWith("/")) {
            pathname = pathname.slice(0, -1);
        }

        return {

            original: url,

            protocol: parsed.protocol,

            hostname,

            pathname,

            search: parsed.search,

            hash: parsed.hash,

            port: parsed.port,

            normalized: hostname + pathname

        };

    } catch {

        return null;

    }

}

//-------------------------------------
// Get hostname only
//-------------------------------------

export function getHostname(url) {

    const result = normalizeURL(url);

    return result ? result.hostname : null;

}

//-------------------------------------
// Check HTTPS
//-------------------------------------

export function isHTTPS(url) {

    const result = normalizeURL(url);

    return result
        ? result.protocol === "https:"
        : false;

}

//-------------------------------------
// Count subdomains
//-------------------------------------

export function countSubdomains(hostname) {

    const parts = hostname.split(".");

    if (parts.length <= 2)
        return 0;

    return parts.length - 2;

}

//-------------------------------------
// Check IPv4
//-------------------------------------

export function isIPAddress(hostname) {

    const ipv4 =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    return ipv4.test(hostname);

}

//-------------------------------------
// Remove query string
//-------------------------------------

export function stripQuery(url) {

    const parsed = normalizeURL(url);

    if (!parsed)
        return null;

    return parsed.hostname + parsed.pathname;

}

//-------------------------------------
// Normalize hostnames for comparison
//-------------------------------------

export function normalizeHost(hostname = "") {

    return (hostname || "")
        .toLowerCase()
        .trim()
        .replace(/^www\./, "")
        .replace(/\.$/, "");

}

//-------------------------------------
// Normalize homograph characters
//-------------------------------------

export function normalizeHomographs(text = "") {

    let normalized = (text || "").toLowerCase();

    for (const [suspicious, replacement] of Object.entries(homographMap)) {

        normalized = normalized.split(suspicious.toLowerCase()).join(replacement);
        normalized = normalized.split(suspicious).join(replacement);

    }

    return normalized;

}

//-------------------------------------
// Check trusted allowlist
//-------------------------------------

export function isTrustedDomain(hostname = "") {

    return trustedDomains.includes(normalizeHost(hostname));

}

//-------------------------------------
// Check shortener services
//-------------------------------------

export function isShortenedUrl(hostname = "") {

    const host = normalizeHost(hostname);

    return shortenerDomains.some(shortener =>
        host === shortener || host.endsWith(`.${shortener}`)
    );

}

//-------------------------------------
// Check brand impersonation patterns
//-------------------------------------

export function looksLikeBrandImpersonation(hostname = "", path = "") {

    const host = normalizeHomographs(normalizeHost(hostname));
    const pathText = normalizeHomographs(path || "");

    return brandTerms.some(term =>
        host.includes(term) || pathText.includes(term)
    );

}

//-------------------------------------
// Detect character substitution attacks
//-------------------------------------

export function hasHomographSubstitution(original = "", normalized = "") {

    return (original || "").toLowerCase() !== (normalized || "").toLowerCase();

}

//-------------------------------------
// Detect embedded shortener or brand-like domains in the full URL text
//-------------------------------------

function escapeRegExp(value = "") {

    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

export function detectEmbeddedSuspiciousReference(hostname = "", text = "") {

    if (!text)
        return null;

    const normalizedText = normalizeHomographs(text);
    const host = normalizeHost(hostname);

    for (const shortener of shortenerDomains) {

        const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(shortener)}([^a-z0-9]|$)`, "i");

        if (pattern.test(normalizedText)) {

            return {

                type: "SHORTENER",
                value: shortener,
                message: `Embedded shortener domain detected: ${shortener}`
            };

        }

    }

    if (!isTrustedDomain(host)) {

        for (const term of brandTerms) {

            const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}\\.(?:com|net|org|co|io|uk|us|info|dev|app)([^a-z0-9]|$)`, "i");

            if (pattern.test(normalizedText)) {

                return {

                    type: "BRAND_IMPERSONATION",
                    value: term,
                    message: `Embedded brand-like domain reference detected: ${term}`
                };

            }

        }

    }

    return null;

}