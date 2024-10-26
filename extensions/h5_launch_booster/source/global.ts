export const PACKAGE_NAME = 'h5_launch_booster';
export const ASSETS_URL_RECORD_LIST_JSON = 'assetsUrlRecordList.json';

export function log(...args: any[]) {
    console.log(`[${PACKAGE_NAME}]`, ...args);
}

export function logDebug(...args: any[]) {
    console.debug(`[${PACKAGE_NAME}]`, ...args);
}

export function logWarn(...args: any[]) {
    console.warn(`[${PACKAGE_NAME}]`, ...args);
}

export function logError(...args: any[]) {
    console.error(`[${PACKAGE_NAME}]`, ...args);
}