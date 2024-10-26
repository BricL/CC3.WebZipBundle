import * as fs from 'fs';
import { ASSETS_URL_RECORD_LIST_JSON, PACKAGE_NAME, log, logWarn } from './global';
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
    // Check build-config directory
    log(`Loaded: ${Editor.Project.path}`);
    const buildConfigPath = `${Editor.Project.path}/h5lb-build-config`;

    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        logWarn(`Create build-config directory at '${buildConfigPath}.'`);
    }

    // Check assetsUrlRecordList.json
    const assetsUrlRecordListPath = path.join(buildConfigPath, ASSETS_URL_RECORD_LIST_JSON);
    if (!fs.existsSync(assetsUrlRecordListPath)) {
        fs.writeFileSync(assetsUrlRecordListPath, JSON.stringify([]));
        logWarn(`Add assetsUrlRecordList.json at at '${assetsUrlRecordListPath}.`);
    }
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {
    log(`Unloaded`);
};