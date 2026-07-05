
// Storage Utility

export async function save(key, value) {

    await chrome.storage.local.set({

        [key]: value

    });

}


export async function load(key) {

    const result = await chrome.storage.local.get(key);

    return result[key];

}


export async function remove(key) {

    await chrome.storage.local.remove(key);

}


export async function clear() {

    await chrome.storage.local.clear();

}


export async function exists(key) {

    const result = await chrome.storage.local.get(key);

    return result[key] !== undefined;

}


export async function getAll() {

    return await chrome.storage.local.get(null);

}