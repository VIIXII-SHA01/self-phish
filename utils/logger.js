
// Logger Utility

const DEBUG = true;


function timestamp() {

    return new Date().toLocaleTimeString();

}


export function log(...args) {

    if (!DEBUG)
        return;

    console.log(

        `[PhishGuard ${timestamp()}]`,

        ...args

    );

}


export function warn(...args) {

    if (!DEBUG)
        return;

    console.warn(

        `[PhishGuard ${timestamp()}]`,

        ...args

    );

}


export function error(...args) {

    if (!DEBUG)
        return;

    console.error(

        `[PhishGuard ${timestamp()}]`,

        ...args

    );

}