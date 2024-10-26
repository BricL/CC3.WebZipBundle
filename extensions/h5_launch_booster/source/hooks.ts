import { path } from 'cc';
import { BuildHook, IBuildResult, ITaskOptions } from '../@types';
import { ASSETS_URL_RECORD_LIST_JSON, PACKAGE_NAME, log, logError } from './global';
import * as fs from 'fs';
import * as crypo from 'crypto';
import JSZip from 'jszip';

// let allAssets = [];

export const throwError: BuildHook.throwError = true;

//#region lifecycle hooks
export const load: BuildHook.load = async function () {
    // log(`Load cocos plugin example in builder.`);
    // allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // const pkgOptions = options.packages[PACKAGE_NAME];
    // if (pkgOptions.webTestOption) {
    //     logDebug('webTestOption', true);
    // }
    // // Todo some thing
    // logDebug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // // Todo some thing
    // log('webTestOption', 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // // change the uuid to test
    // const uuidTestMap = {
    //     image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
    // };
    // for (const name of Object.keys(uuidTestMap)) {
    //     const uuid = uuidTestMap[name];
    //     logDebug(`containsAsset of ${name}`, result.containsAsset(uuid));
    //     logDebug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
    //     logDebug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
    //     logDebug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
    // }
    // // test onError hook
    // // throw new Error('Test onError');

    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions.enable) {
        const BUILD_DEST_PATH = result.dest;
        const BUILD_CONFIG_PATH = `${Editor.Project.path}/h5lb-build-config`;
        const TEMP_PATH = path.join(BUILD_CONFIG_PATH, 'temp');

        // Clean/Create temp folder
        if (fs.existsSync(TEMP_PATH))
            fs.rmdirSync(TEMP_PATH, { recursive: true });
        fs.mkdirSync(TEMP_PATH, { recursive: true });

        // Copy assets to temp folder
        const resultString = [];
        const jsonString = fs.readFileSync(path.join(BUILD_CONFIG_PATH, ASSETS_URL_RECORD_LIST_JSON), 'utf-8');
        const assetsPathList = JSON.parse(jsonString);

        const oneMB = parsePackSize(pkgOptions.selectPackSize); //  500KB in bytes
        const zipPackages = [];
        let assetsInZip = [];
        let totalSize = 0;
        for (const assetPath of assetsPathList) {
            let srcAssetPath = path.join(BUILD_DEST_PATH, assetPath);
            const assetStat = fs.statSync(srcAssetPath);
            totalSize += assetStat.size;
            assetsInZip.push(assetPath);

            if (totalSize >= oneMB) {
                zipPackages.push(assetsInZip);
                log(`AssetsInZip size: ${totalSize}, assets: ${assetsInZip.length}`);
                assetsInZip = [];
                totalSize = 0;
            }
        }

        if (assetsInZip.length > 0) {
            zipPackages.push(assetsInZip);
            log(`AssetsInZip size: ${totalSize}, assets: ${assetsInZip.length}`);
        }

        log(`ZipPackages: ${zipPackages.length}`);

        for (let i = 0; i < zipPackages.length; i++) {
            const assetsPathList = zipPackages[i];
            for (const assetPath of assetsPathList) {
                let assetName = path.basename(assetPath);
                let srcAssetPath = path.join(BUILD_DEST_PATH, assetPath);

                try {
                    if (fs.existsSync(srcAssetPath)) {
                        const destAssetPath = path.join(TEMP_PATH, `zipPackage${i}`, path.dirname(assetPath), assetName);
                        copyAsset(srcAssetPath, destAssetPath);
                        resultString.push(destAssetPath);
                    }
                } catch (exp) {
                    logError(`Copy file failed: ${exp}`);
                }
            }
        }

        let md5Hash = '';
        if (options.md5Cache) {
            if (resultString.length > 0) {
                const hash = crypo.createHash('md5').update(resultString.join('')).digest('hex');
                md5Hash = hash.substring(0, 5);
            }
        }

        // Generate h5lbResCache.zip
        let tempName = '';
        for (let i = 0; i < zipPackages.length; i++) {
            const h5lbResCacheZipName = options.md5Cache ? `h5lbResCache${i}.${md5Hash}.zip` : `h5lbResCache${i}.zip`;
            await zipFolder(path.join(TEMP_PATH, `zipPackage${i}`), path.join(BUILD_CONFIG_PATH, h5lbResCacheZipName));

            // Do the cut and paste
            const srcPath = path.join(BUILD_CONFIG_PATH, h5lbResCacheZipName);
            const destPath = path.join(BUILD_DEST_PATH, 'assets', h5lbResCacheZipName);
            fs.copyFileSync(srcPath, destPath);
            fs.unlinkSync(srcPath);
            tempName += `'assets/${h5lbResCacheZipName}'` + (i < zipPackages.length - 1 ? ', ' : '');
        }

        // Modify index.html to add 'h5lbResCache' gloable variable to window object which is used in ZipLoader.ts
        const indexHtml = fs.readFileSync(path.join(BUILD_DEST_PATH, 'index.html'), 'utf-8');
        const modifiedHtml = indexHtml.split('\n').map((line, index) => {
            if (line.includes('./index')) {
                return `${line}\nwindow['h5lbResZipList'] = [${tempName}];`;
            }
            return line;
        }).join('\n');
        fs.writeFileSync(path.join(BUILD_DEST_PATH, 'index.html'), modifiedHtml);
    }
};

export const unload: BuildHook.unload = async function () {
    // log(`Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    // logWarn(`Run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    // log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    // log(`onAfterMake: root: ${root}, options: ${options}`);
};

// #region utils functions
function parsePackSize(packSize: string) {
    if (packSize === 'option1') { // 500KB
        return 500 * 1024;
    } else if (packSize === 'option2') { // 1MB
        return 1024 * 1024;
    } else if (packSize === 'option3') { // 2MB
        return 2 * 1024 * 1024;
    } else if (packSize === 'option4') { // 3MB
        return 3 * 1024 * 1024;
    } else if (packSize === 'option5') { // 4MB
        return 4 * 1024 * 1024;
    } else {
        return Number.MAX_SAFE_INTEGER;
    }
}

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

    const zipContent = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    fs.writeFileSync(destFolder, zipContent);

    log(`Folder ${srcFolder} has been zipped to ${destFolder}`);
}

function copyAsset(srcAssetPath: string, destAssetPath: string) {
    log(`Copying file: ${srcAssetPath} to ${destAssetPath}`);
    fs.mkdirSync(path.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}
