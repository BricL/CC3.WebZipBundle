export const PACKAGE_NAME = 'web-zip-bundle';
export const ASSETS_URL_RECORD_LIST_JSON = 'assetsUrlRecordList.json';
export const BUILD_CONFIG_FOLDER = 'wzb-build-config';
export const ZIP_NAME = 'wzbResCache';

export function log(...args: any[]) {
    console.log(`[${PACKAGE_NAME}] ${args.join(' ')}`);
}

export function logDebug(...args: any[]) {
    console.debug(`[${PACKAGE_NAME}] ${args.join(' ')}`);
}

export function logWarn(...args: any[]) {
    console.warn(`[${PACKAGE_NAME}] ${args.join(' ')}`);
}

export function logError(...args: any[]) {
    console.error(`[${PACKAGE_NAME}] ${args.join(' ')}`);
}