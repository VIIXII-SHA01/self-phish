
// Domain Age Detector

// Leave empty if you don't have an API yet.
const API_URL = "";

// Cache lifetime (24 hours)
const CACHE_TIME = 24 * 60 * 60 * 1000;

// Main Function

export async function checkDomainAge(hostname) {

    // No API configured

    if (!API_URL) {

        return {

            suspicious: false,

            ageDays: null,

            message: "Domain age unavailable."

        };

    }

    // Check Cache

    const cacheKey = `domainAge_${hostname}`;

    const cache = await chrome.storage.local.get(cacheKey);

    if (cache[cacheKey]) {

        const cached = cache[cacheKey];

        if (Date.now() - cached.timestamp < CACHE_TIME) {

            return cached.result;

        }

    }

    // Query API

    try {

        const response = await fetch(

            `${API_URL}${hostname}`

        );

        if (!response.ok)
            throw new Error();

        const data = await response.json();

        //---------------------------------
        // Expected format
        //---------------------------------
        //
        // {
        //     ageDays: 45
        // }
        //
        //---------------------------------

        const ageDays = data.ageDays;

        let result;

        if (ageDays < 30) {

            result = {

                suspicious: true,

                ageDays,

                message:
                    `Domain is only ${ageDays} days old.`

            };

        }

        else if (ageDays < 90) {

            result = {

                suspicious: true,

                ageDays,

                message:
                    `Domain is relatively new (${ageDays} days).`

            };

        }

        else {

            result = {

                suspicious: false,

                ageDays,

                message:
                    `Domain age is ${ageDays} days.`

            };

        }

        // Save Cache

        await chrome.storage.local.set({

            [cacheKey]: {

                timestamp: Date.now(),

                result

            }

        });

        return result;

    }

    catch {

        return {

            suspicious: false,

            ageDays: null,

            message: "Unable to determine domain age."

        };

    }

}