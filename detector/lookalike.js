
// Lookalike Domain Detector

// Trusted domains
const trustedDomains = [

    "google.com",
    "paypal.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "facebook.com",
    "github.com",
    "netflix.com",
    "discord.com",
    "dropbox.com",
    "instagram.com",
    "linkedin.com",
    "openai.com",
    "x.com"

];

// Main function

export function checkLookalike(hostname) {

    hostname = hostname.toLowerCase();

    // Ignore exact matches

    if (trustedDomains.includes(hostname)) {

        return {

            detected: false,

            brand: null,

            distance: 0

        };

    }

    // Compare against each brand

    for (const brand of trustedDomains) {

        const distance = levenshtein(

            hostname,

            brand

        );

        // Threshold

        if (distance <= 2) {

            return {

                detected: true,

                brand,

                distance

            };

        }

    }

    //---------------------------------

    return {

        detected: false,

        brand: null,

        distance: null

    };

}


// Levenshtein Distance Algorithm

function levenshtein(a, b) {

    const matrix = [];

    const rows = a.length + 1;

    const cols = b.length + 1;

    //---------------------------------
    // Initialize matrix
    //---------------------------------

    for (let i = 0; i < rows; i++) {

        matrix[i] = [];

        matrix[i][0] = i;

    }

    for (let j = 0; j < cols; j++) {

        matrix[0][j] = j;

    }

    //---------------------------------
    // Dynamic Programming
    //---------------------------------

    for (let i = 1; i < rows; i++) {

        for (let j = 1; j < cols; j++) {

            const cost =

                a[i - 1] === b[j - 1]

                    ? 0

                    : 1;

            matrix[i][j] = Math.min(

                matrix[i - 1][j] + 1,

                matrix[i][j - 1] + 1,

                matrix[i - 1][j - 1] + cost

            );

        }

    }

    return matrix[rows - 1][cols - 1];

}