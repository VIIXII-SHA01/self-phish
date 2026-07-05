
// URL Normalization Module

export function normalizeURL(url) {

    try {

        const parsed = new URL(url);

        // Hostname

        let hostname = parsed.hostname
            .toLowerCase()
            .trim();

        // Remove www.
        hostname = hostname.replace(/^www\./, "");

        // Path

        let pathname = parsed.pathname;

        // Remove duplicate slashes
        pathname = pathname.replace(/\/+/g, "/");

        // Remove trailing slash
        if (
            pathname.length > 1 &&
            pathname.endsWith("/")
        ) {
            pathname = pathname.slice(0, -1);
        }

        // Build normalized URL

        const normalized = hostname + pathname;

        return {

            original: url,

            protocol: parsed.protocol,

            hostname,

            pathname,

            search: parsed.search,

            hash: parsed.hash,

            port: parsed.port,

            normalized

        };

    }

    catch {

        return null;

    }

}