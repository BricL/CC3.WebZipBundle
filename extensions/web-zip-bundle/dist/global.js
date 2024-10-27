"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logWarn = exports.logDebug = exports.log = exports.ZIP_NAME = exports.BUILD_CONFIG_FOLDER = exports.ASSETS_URL_RECORD_LIST_JSON = exports.PACKAGE_NAME = void 0;
exports.PACKAGE_NAME = 'web-zip-bundle';
exports.ASSETS_URL_RECORD_LIST_JSON = 'assetsUrlRecordList.json';
exports.BUILD_CONFIG_FOLDER = 'wzb-build-config';
exports.ZIP_NAME = 'wzbResCache';
function log(...args) {
    console.log(`[${exports.PACKAGE_NAME}] ${args.join(' ')}`);
}
exports.log = log;
function logDebug(...args) {
    console.debug(`[${exports.PACKAGE_NAME}] ${args.join(' ')}`);
}
exports.logDebug = logDebug;
function logWarn(...args) {
    console.warn(`[${exports.PACKAGE_NAME}] ${args.join(' ')}`);
}
exports.logWarn = logWarn;
function logError(...args) {
    console.error(`[${exports.PACKAGE_NAME}] ${args.join(' ')}`);
}
exports.logError = logError;
