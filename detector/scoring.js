
// Risk Scoring Engine

const MAX_SCORE = 100;

// Calculate Risk Score

export function calculateRisk(results = []) {

    let score = 0;

    // Sum all heuristic scores

    for (const result of results) {

        score += result.score;

    }

    // Cap at 100

    score = Math.min(score, MAX_SCORE);

    // Determine Risk Level

    let level = "SAFE";

    if (score >= 60) {

        level = "DANGEROUS";

    }

    else if (score >= 30) {

        level = "SUSPICIOUS";

    }

    // Return detailed result

    return {

        score,

        level,

        reasons: results

    };

}