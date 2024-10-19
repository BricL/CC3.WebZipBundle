import { path } from 'cc';
import { BuildHook, IBuildResult, ITaskOptions } from '../@types';
import { PACKAGE_NAME } from './global';
import * as fs from 'fs';
import * as crypo from 'crypto';
import JSZip from 'jszip';

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

//#region lifecycle hooks
export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
    // log(`${PACKAGE_NAME}.enable`, 'onBeforeBuild');
    const pkgOptions = options.packages[PACKAGE_NAME];
    log(`H5 Launch Booster: ${pkgOptions.enable}`);
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // const pkgOptions = options.packages[PACKAGE_NAME];
    // if (pkgOptions.webTestOption) {
    //     console.debug('webTestOption', true);
    // }
    // // Todo some thing
    // console.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // // Todo some thing
    // console.log('webTestOption', 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // // change the uuid to test
    // const uuidTestMap = {
    //     image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
    // };
    // for (const name of Object.keys(uuidTestMap)) {
    //     const uuid = uuidTestMap[name];
    //     console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
    //     console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
    //     console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
    //     console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
    // }
    // // test onError hook
    // // throw new Error('Test onError');

    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions) {
        const BUILD_PROJECT_DEST_PATH = result.dest;
        const H5LB_BUILD_CONFIG_PATH = `${Editor.Project.path}/h5lb-build-config`;
        const TEMP_PATH = path.join(H5LB_BUILD_CONFIG_PATH, 'temp');

        // Clean/Create temp folder
        if (fs.existsSync(TEMP_PATH))
            fs.rmdirSync(TEMP_PATH, { recursive: true });
        fs.mkdirSync(TEMP_PATH, { recursive: true });

        // Copy assets to temp folder
        const resultString = [];
        const jsonString = fs.readFileSync(`${H5LB_BUILD_CONFIG_PATH}/assetsUrlListRecord.json`, 'utf-8');
        const assetsPathList = JSON.parse(jsonString);

        for (const assetPath of assetsPathList) {
            let assetName = path.basename(assetPath);
            let srcAssetPath = path.join(BUILD_PROJECT_DEST_PATH, assetPath);

            try {
                if (fs.existsSync(srcAssetPath)) {
                    const destAssetPath = path.join(TEMP_PATH, path.dirname(assetPath), assetName);
                    copyAsset(srcAssetPath, destAssetPath);
                    resultString.push(destAssetPath);
                } else {
                    // Can't find the asset name with md5 hash, try to find the asset name without md5 hash
                    if (options.md5Cache) {
                        const regexTemplate = /\.[a-z,A-Z,0-9]*\./;
                        assetName = assetName.replace(regexTemplate, ".");
                        assetName = assetName.replace(path.extname(assetName), "");
                    }

                    const srcAssetDir = path.dirname(srcAssetPath);
                    const items = fs.readdirSync(srcAssetDir);
                    let isFound = false;

                    for (const item of items) {
                        if (item.includes(assetName)) {
                            srcAssetPath = path.join(srcAssetDir, item);
                            const destAssetPath = path.join(TEMP_PATH, path.dirname(assetPath), item);
                            copyAsset(srcAssetPath, destAssetPath);
                            resultString.push(destAssetPath);
                            isFound = true;
                            break;
                        }
                    }

                    if (!isFound) {
                        // The asset file not exists
                        console.error(`[${PACKAGE_NAME}] file not exists: ${srcAssetPath} `);
                    }
                }
            } catch (exp) {
                console.error(`[${PACKAGE_NAME}] copy file failed: ${exp}`);
            }
        }

        let md5Hash = '';
        if (options.md5Cache) {
            if (resultString.length > 0) {
                const hash = crypo.createHash('md5').update(resultString.join('')).digest('hex');
                md5Hash = hash.substring(0, 5);
            }
            console.log(`[${PACKAGE_NAME}] md5 hash: ${md5Hash}`);
        }

        await zipFolder(TEMP_PATH, path.join(H5LB_BUILD_CONFIG_PATH, md5Hash.length > 0 ? `h5lbResCache.${md5Hash}.zip` : 'h5lbResCache.zip'));
    }
};

function copyAsset(srcAssetPath: string, destAssetPath: string) {
    // const destAssetPath = path.join(TEMP_PATH, path.dirname(assetPath), assetName);
    console.log(`[${PACKAGE_NAME}] Copying file: ${srcAssetPath} to ${destAssetPath}`);

    fs.mkdirSync(path.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}

export const unload: BuildHook.unload = async function () {
    // console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    // console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    // console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    // console.log(`onAfterMake: root: ${root}, options: ${options}`);
};

//#region utils functions
async function zipFolder(srcFolder: string, destFolder: string) {
    const zip = new JSZip();

    function addFolderToZip(folderPath: string, zipFolder: JSZip) {
        const items = fs.readdirSync(folderPath);

        for (const item of items) {
            const fullPath = path.join(folderPath, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                const folder = zipFolder.folder(item);
                addFolderToZip(fullPath, folder);
            } else {
                const fileData = fs.readFileSync(fullPath);
                zipFolder.file(item, fileData);
            }
        }
    }

    addFolderToZip(srcFolder, zip);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(destFolder, zipContent);

    console.log(`[${PACKAGE_NAME}] Folder ${srcFolder} has been zipped to ${destFolder}`);
}
