import * as fs from 'fs';

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
    console.log(`h5_launch_booster loaded: ${Editor.Project.path}`);
    const buildConfigPath = `${Editor.Project.path}/h5lb-build-config`;

    if (!fs.existsSync(buildConfigPath)) {
        fs.mkdirSync(buildConfigPath);
        console.warn(`h5_launch_booster create build-config directory at '${buildConfigPath}.'`);
    }

    // Check assetsUrlListRecord.json
    if (!fs.existsSync(`${buildConfigPath}/assetsUrlListRecord.json`)) {
        const assetsUrlListPath = `${buildConfigPath}/assetsUrlListRecord.json`;
        fs.writeFileSync(assetsUrlListPath, JSON.stringify([]));
        console.warn(`h5_launch_booster add assetsUrlListRecord.json at at '${assetsUrlListPath}.`);
    }
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {
    console.log('h5_launch_booster unloaded');
};