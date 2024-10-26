import * as fs from 'fs';
import { ASSETS_URL_RECORD_LIST_JSON, PACKAGE_NAME } from './global';
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
    console.log(`[${PACKAGE_NAME}] loaded: ${Editor.Project.path}`);
    const buildConfigPath = `${Editor.Project.path}/h5lb-build-config`;

    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        console.warn(`[${PACKAGE_NAME}] create build-config directory at '${buildConfigPath}.'`);
    }

    // Check assetsUrlRecordList.json
    const assetsUrlRecordListPath = path.join(buildConfigPath, ASSETS_URL_RECORD_LIST_JSON);
    if (!fs.existsSync(assetsUrlRecordListPath)) {
        fs.writeFileSync(assetsUrlRecordListPath, JSON.stringify([]));
        console.warn(`[${PACKAGE_NAME}] add assetsUrlRecordList.json at at '${assetsUrlRecordListPath}.`);
    }
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {
    console.log(`[${PACKAGE_NAME}] unloaded`);
};