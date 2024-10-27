import { ASSETS_URL_RECORD_LIST_JSON, BUILD_CONFIG_FOLDER, log, logWarn } from './global';
import * as fs from 'fs';
import path from 'path';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {

};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () {
    // Check BUILD_CONFIG_FOLDER
    log(`Loaded: ${Editor.Project.path}`);
    const buildConfigPath = path.join(Editor.Project.path, BUILD_CONFIG_FOLDER);

    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        logWarn(`Create config folder at '${buildConfigPath}.'`);
    }

    // Check ASSETS_URL_RECORD_LIST_JSON
    const assetsUrlRecordListPath = path.join(buildConfigPath, ASSETS_URL_RECORD_LIST_JSON);
    if (!fs.existsSync(assetsUrlRecordListPath)) {
        fs.writeFileSync(assetsUrlRecordListPath, JSON.stringify([]));
        logWarn(`Add record list at '${assetsUrlRecordListPath}.`);
    }
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {
    log(`Unloaded`);
};