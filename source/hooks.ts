import { BuildHook, IBuildResult, ITaskOptions } from '../@types';
import { ASSETS_URL_RECORD_LIST_JSON, BUILD_CONFIG_FOLDER, PACKAGE_NAME, ZIP_NAME, log, logError, logWarn } from './global';
import * as fs from 'fs';
import * as crypo from 'crypto';
import JSZip, { file } from 'jszip';
import path from 'path';

export const throwError: BuildHook.throwError = true;

const downloadResCacheJSCodeSnippet = `
async function downloadResCache() {
    async function downloadZip(url) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            return buffer;
        } catch (e) {
            error(e.message);
        }
    }

    const resZipList = window['wzbResZipList'];

    if (resZipList !== undefined && resZipList.length > 0) {
        const promises = [];
        for (let i = 0; i < resZipList.length; i++) {
            promises.push(downloadZip(resZipList[i]));
        }
        window['wzbDownloadResCache'] = promises;
        return;
    } else {
        error("[WebZipBundle].downloadResCache: resZipList is empty");
    }
}

downloadResCache();`;

//#region lifecycle hooks
export const load: BuildHook.load = async function () {
    // TODO some thing
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions.enable) {
        const BUILD_DEST_PATH = result.dest;
        const BUILD_CONFIG_PATH = path.join(Editor.Project.path, BUILD_CONFIG_FOLDER);
        const TEMP_PATH = path.join(BUILD_CONFIG_PATH, 'temp');
        const destAssetPathString = [];

        // Clean/Create temp folder
        if (fs.existsSync(TEMP_PATH))
            fs.rmdirSync(TEMP_PATH, { recursive: true });
        fs.mkdirSync(TEMP_PATH, { recursive: true });

        // Copy assets to temp folder
        const jsonString = fs.readFileSync(path.join(BUILD_CONFIG_PATH, ASSETS_URL_RECORD_LIST_JSON), 'utf-8');
        const assetsUrlRecordList = JSON.parse(jsonString);
        const sizeInMBPerPack = parsePackSize(pkgOptions.selectPackSize);
        const packs = [];

        let assetsUrlInPack = [];
        let accumlatedMB = 0;
        for (const assetUrl of assetsUrlRecordList) {
            const srcAssets = [];
            let srcAssetPath = path.join(BUILD_DEST_PATH, assetUrl);

            let assetDirPath = path.dirname(srcAssetPath);
            let assetName = path.basename(srcAssetPath);
            assetName = assetName.replace(/\.[a-zA-Z0-9]+\./g, '.');
            const name = assetName.split('.')[0];

            let matchingFiles = fs.readdirSync(assetDirPath).filter((file) => file.includes(name));
            if (matchingFiles.length === 0) {
                logWarn(`onAfterBuild: File not found, ${srcAssetPath}`);
                continue;
            }

            for (let i = 0; i < matchingFiles.length; i++) {
                const srcAsset = path.join(path.dirname(assetUrl), matchingFiles[i]);
                srcAssets.push(srcAsset);
            }

            try {
                for (const srcAsset of srcAssets) {
                    const stat = fs.statSync(path.join(BUILD_DEST_PATH, srcAsset));
                    accumlatedMB += stat.size;
                    assetsUrlInPack.push(srcAsset);

                    if (accumlatedMB >= sizeInMBPerPack) {
                        packs.push(assetsUrlInPack);
                        assetsUrlInPack = [];
                        accumlatedMB = 0;
                    }
                }
            } catch (exp) {
                logError(`onAfterBuild: An error occurred while checking the file, ${exp.message}`);
            }
        }

        if (assetsUrlInPack.length > 0) {
            packs.push(assetsUrlInPack);
        }

        // Copy assets to temp folder
        for (let i = 0; i < packs.length; i++) {
            for (const assetUrl of packs[i]) {
                let assetName = path.basename(assetUrl);
                let srcAssetPath = path.join(BUILD_DEST_PATH, assetUrl);
                try {
                    if (fs.existsSync(srcAssetPath)) {
                        const destAssetPath = path.join(TEMP_PATH, `${ZIP_NAME}${i}`, path.dirname(assetUrl), assetName);
                        copyAsset(srcAssetPath, destAssetPath);
                        destAssetPathString.push(destAssetPath);
                    }
                } catch (exp) {
                    logError(`Copy file failed: ${exp}`);
                }
            }
        }

        // Calcaulte md5 hash this time
        let md5Hash = '';
        if (options.md5Cache && destAssetPathString.length > 0) {
            const hash = crypo.createHash('md5').update(destAssetPathString.join('')).digest('hex');
            md5Hash = hash.substring(0, 5);
        }

        // Generate ${ZIP_NAME}.zip
        let tempName = '';
        for (let i = 0; i < packs.length; i++) {
            const resCacheZipName = options.md5Cache ? `${ZIP_NAME}${i}.${md5Hash}.zip` : `${ZIP_NAME}${i}.zip`;
            await zipFolder(path.join(TEMP_PATH, `${ZIP_NAME}${i}`), path.join(BUILD_CONFIG_PATH, resCacheZipName));

            // Do the cut and paste
            const srcPath = path.join(BUILD_CONFIG_PATH, resCacheZipName);
            const destPath = path.join(BUILD_DEST_PATH, 'assets', resCacheZipName);
            fs.copyFileSync(srcPath, destPath);
            fs.unlinkSync(srcPath);
            tempName += `'assets/${resCacheZipName}'` + (i < packs.length - 1 ? ', ' : '');
        }

        // Modify index.html to add ${ZIP_NAME} gloable variable to window object which is used in ZipLoader.ts
        const indexHtml = fs.readFileSync(path.join(BUILD_DEST_PATH, 'index.html'), 'utf-8');
        const modifiedHtml = indexHtml.split('\n').map((line, index) => {
            if (line.includes('./index')) {
                if (pkgOptions.downloadZipAtIndexHtml) {
                    return `${line}\nwindow['wzbResZipList'] = [${tempName}];\n${downloadResCacheJSCodeSnippet}`;
                } else {
                    return `${line}\nwindow['wzbResZipList'] = [${tempName}];`;
                }
            }
            return line;
        }).join('\n');
        fs.writeFileSync(path.join(BUILD_DEST_PATH, 'index.html'), modifiedHtml);
    }
};

export const unload: BuildHook.unload = async function () {
    // TODO some thing
};

export const onError: BuildHook.onError = async function (options, result) {
    // TODO some thing
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    // TODO some thing
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    // TODO some thing
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
    addFileToZip(srcFolder, zip);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    fs.writeFileSync(destFolder, zipContent);

    log(`Folder ${srcFolder} has been zipped to ${destFolder}`);
}

function addFileToZip(dirPath: string, zip: JSZip) {
    const contentsInDir = fs.readdirSync(dirPath);
    for (const item of contentsInDir) {
        const fullPath = path.join(dirPath, item);
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                addFileToZip(fullPath, zip.folder(item));
            } else {
                const data = fs.readFileSync(fullPath);
                zip.file(item, data);
            }
        } catch (exp) {
            if (exp.code === 'ENOENT') {
                logWarn(`zipFolder: File not found, ${fullPath}`);
            } else {
                logError(`zipFolder: An error occurred while checking the file, ${exp.message}`);
            }
        }
    }
}

function copyAsset(srcAssetPath: string, destAssetPath: string) {
    fs.mkdirSync(path.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}