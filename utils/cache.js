
// Cache Utility

export async function setCache(key, value, ttlMinutes = 60) {

    const expires = Date.now() + (ttlMinutes * 60 * 1000);

    await chrome.storage.local.set({

        [key]: {

            value,

            expires

        }

    });

}


export async function getCache(key) {

    const result = await chrome.storage.local.get(key);

    const cached = result[key];

    if (!cached)
        return null;

    // Expired?

    if (Date.now() > cached.expires) {

        await chrome.storage.local.remove(key);

        return null;

    }

    return cached.value;

}


export async function removeCache(key) {

    await chrome.storage.local.remove(key);

}


export async function clearCache() {

    const all = await chrome.storage.local.get(null);

    const keys = Object.keys(all);

    for (const key of keys) {

        if (key.startsWith("cache_")) {

            await chrome.storage.local.remove(key);

        }

    }

}