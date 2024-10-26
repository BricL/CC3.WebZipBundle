"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logWarn = exports.logDebug = exports.log = exports.ASSETS_URL_RECORD_LIST_JSON = exports.PACKAGE_NAME = void 0;
exports.PACKAGE_NAME = 'h5-launch-booster';
exports.ASSETS_URL_RECORD_LIST_JSON = 'assetsUrlRecordList.json';
function log(...args) {
    console.log(`[${exports.PACKAGE_NAME}]`, ...args);
}
exports.log = log;
function logDebug(...args) {
    console.debug(`[${exports.PACKAGE_NAME}]`, ...args);
}
exports.logDebug = logDebug;
function logWarn(...args) {
    console.warn(`[${exports.PACKAGE_NAME}]`, ...args);
}
exports.logWarn = logWarn;
function logError(...args) {
    console.error(`[${exports.PACKAGE_NAME}]`, ...args);
}
exports.logError = logError;
