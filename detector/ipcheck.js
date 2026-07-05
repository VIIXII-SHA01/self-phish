
// IP Address Detector


/**
 * Check if a hostname is an IPv4 address.
 *
 * Example:
 * 192.168.1.1
 */

function isIPv4(hostname) {

    const ipv4Regex =

        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    return ipv4Regex.test(hostname);

}


/**
 * Check if a hostname is an IPv6 address.
 *
 * Example:
 * 2001:db8::1
 */

function isIPv6(hostname) {

    return hostname.includes(":");

}


/**
 * Main detector
 */

export function isIPAddress(hostname) {

    if (!hostname)
        return false;

    hostname = hostname.trim();

    return isIPv4(hostname) || isIPv6(hostname);

}


/**
 * Returns detailed information.
 */

export function checkIPAddress(hostname) {

    if (!hostname) {

        return {

            detected: false,

            version: null,

            message: null

        };

    }

    hostname = hostname.trim();

    // IPv4

    if (isIPv4(hostname)) {

        return {

            detected: true,

            version: "IPv4",

            message:
                "Website uses an IPv4 address instead of a domain."

        };

    }

    // IPv6

    if (isIPv6(hostname)) {

        return {

            detected: true,

            version: "IPv6",

            message:
                "Website uses an IPv6 address instead of a domain."

        };

    }

    //----------------------------------

    return {

        detected: false,

        version: null,

        message: null

    };

}