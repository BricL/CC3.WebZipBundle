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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const fs = __importStar(require("fs"));
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
    console.log(`h5_launch_booster loaded: ${Editor.Project.path}`);
    const buildConfigPath = `${Editor.Project.path}/build-config`;
    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        console.warn(`h5_launch_booster create build-config directory at '${buildConfigPath}.'`);
    }
    if (!fs.existsSync(`${buildConfigPath}/assetsUrlListRecord.json`)) {
        const assetsUrlListPath = `${buildConfigPath}/assetsUrlListRecord.json`;
        fs.writeFileSync(assetsUrlListPath, JSON.stringify([]));
        console.warn(`h5_launch_booster add assetsUrlListRecord.json at at '${assetsUrlListPath}.`);
    }
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
    console.log('h5_launch_booster unloaded');
};
exports.unload = unload;
