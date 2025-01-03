"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const global_1 = require("./global");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () {
    // Check BUILD_CONFIG_FOLDER
    (0, global_1.log)(`Loaded: ${Editor.Project.path}`);
    const buildConfigPath = path_1.default.join(Editor.Project.path, global_1.BUILD_CONFIG_FOLDER);
    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        (0, global_1.logWarn)(`Create config folder at '${buildConfigPath}.'`);
    }
    // Check ASSETS_URL_RECORD_LIST_JSON
    const assetsUrlRecordListPath = path_1.default.join(buildConfigPath, global_1.ASSETS_URL_RECORD_LIST_JSON);
    if (!fs.existsSync(assetsUrlRecordListPath)) {
        fs.writeFileSync(assetsUrlRecordListPath, JSON.stringify([]));
        (0, global_1.logWarn)(`Add record list at '${assetsUrlRecordListPath}.`);
    }
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
    (0, global_1.log)(`Unloaded`);
};
exports.unload = unload;
