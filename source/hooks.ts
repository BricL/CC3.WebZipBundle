import { BuildHook, IBuildResult, IOptions, ITaskOptions } from '../@types';
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
        const BUILD_DEST_DIR = result.dest;
        const BUILD_CONFIG_DIR = path.join(Editor.Project.path, BUILD_CONFIG_FOLDER);
        const TEMP_DIR = path.join(BUILD_CONFIG_DIR, 'temp');

        // Get packs from assetsUrlRecordList.json
        const packs = getPacksFromAssetsUrlReocrdList(path.join(BUILD_CONFIG_DIR, ASSETS_URL_RECORD_LIST_JSON), BUILD_DEST_DIR, parsePackSize(pkgOptions.selectPackSize));

        // Create temp folder and Copy assets to temp folder, then return md5 hash
        const md5Hash = copyAssetsToTempFolder(packs, BUILD_DEST_DIR, TEMP_DIR, options.md5Cache);

        // Generate ${ZIP_NAME}.zip
        await generateZipFiles(packs, md5Hash, BUILD_DEST_DIR, BUILD_CONFIG_DIR, TEMP_DIR, options.md5Cache, pkgOptions.downloadZipAtIndexHtml);
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

/**
 * Copy assets to temp folder
 * @param assetsUrlRecordListPath 
 * @param buildDestDir 
 * @param splitSizePerPack 
 * @returns 
 */
function getPacksFromAssetsUrlReocrdList(assetsUrlRecordListPath: string, buildDestDir: string, splitSizePerPack: number) {
    const jsonString = fs.readFileSync(assetsUrlRecordListPath, 'utf-8');
    const assetsUrlRecordList = JSON.parse(jsonString);
    const packs = [];
    let assetsUrlInPack = [];
    let accumlatedSize = 0;

    for (const assetUrl of assetsUrlRecordList) {
        const srcAssetsUrl = [];

        let srcAssetPath = path.join(buildDestDir, assetUrl);
        let srcAssetDir = path.dirname(srcAssetPath);
        let srcAssetName = path.basename(srcAssetPath); srcAssetName = srcAssetName.replace(/\.[a-zA-Z0-9]+\./g, '.');
        const srcAssetBasename = srcAssetName.split('.')[0];

        let matchingFiles = fs.readdirSync(srcAssetDir).filter((file) => file.includes(srcAssetBasename));
        if (matchingFiles.length === 0) {
            logWarn(`onAfterBuild: File not found, ${srcAssetPath}`);
            continue;
        }

        for (let i = 0; i < matchingFiles.length; i++)
            srcAssetsUrl.push(path.join(path.dirname(assetUrl), matchingFiles[i]));

        try {
            for (const srcAssetUrl of srcAssetsUrl) {
                const stat = fs.statSync(path.join(buildDestDir, srcAssetUrl));
                accumlatedSize += stat.size;
                assetsUrlInPack.push(srcAssetUrl);

                if (accumlatedSize >= splitSizePerPack) {
                    packs.push(assetsUrlInPack);
                    assetsUrlInPack = [];
                    accumlatedSize = 0;
                }
            }
        } catch (exp) {
            logError(`onAfterBuild: An error occurred while checking the file, ${exp.message}`);
        }
    }

    if (assetsUrlInPack.length > 0) {
        packs.push(assetsUrlInPack);
    }

    return packs;
}

/**
 * Clean/Create temp folder and Copy assets to temp folder
 * @param packs 
 * @param buildDestDir 
 * @param tempDir 
 * @param isMd5Cache 
 * @returns 
 */
function copyAssetsToTempFolder(packs: any[], buildDestDir: string, tempDir: string, isMd5Cache: boolean) {
    const md5HashString = [];

    if (fs.existsSync(tempDir))
        fs.rmdirSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    for (let i = 0; i < packs.length; i++) {
        for (const assetUrl of packs[i]) {
            let srcAssetName = path.basename(assetUrl);
            let srcAssetPath = path.join(buildDestDir, assetUrl);
            try {
                if (fs.existsSync(srcAssetPath)) {
                    const destAssetPath = path.join(tempDir, `${ZIP_NAME}${i}`, path.dirname(assetUrl), srcAssetName);
                    copyAsset(srcAssetPath, destAssetPath);

                    md5HashString.push(destAssetPath);
                }
            } catch (exp) {
                logError(`Copy file failed: ${exp}`);
            }
        }
    }

    let md5Hash = '';
    if (isMd5Cache && md5HashString.length > 0) {
        const hash = crypo.createHash('md5').update(md5HashString.join('')).digest('hex');
        md5Hash = hash.substring(0, 5);
    }

    return md5Hash;
}

/**
 * Generate ${ZIP_NAME}.zip
 * @param packs 
 * @param md5Hash 
 * @param buildDestDir 
 * @param buildConfigDir 
 * @param tempDir 
 * @param md5Cache 
 * @param downloadZipAtIndexHtml 
 */
async function generateZipFiles(packs: any[], md5Hash: string, buildDestDir: string, buildConfigDir: string, tempDir: string, md5Cache: boolean, downloadZipAtIndexHtml: boolean) {
    let tempName = '';
    for (let i = 0; i < packs.length; i++) {
        const resCacheZipName = md5Cache ? `${ZIP_NAME}${i}.${md5Hash}.zip` : `${ZIP_NAME}${i}.zip`;
        await zipFolder(path.join(tempDir, `${ZIP_NAME}${i}`), path.join(buildConfigDir, resCacheZipName));

        // Do the cut and paste
        const srcPath = path.join(buildConfigDir, resCacheZipName);
        const destPath = path.join(buildDestDir, 'assets', resCacheZipName);
        fs.copyFileSync(srcPath, destPath);
        fs.unlinkSync(srcPath);
        tempName += `'assets/${resCacheZipName}'` + (i < packs.length - 1 ? ', ' : '');
    }

    // Modify index.html to add ${ZIP_NAME} gloable variable to window object which is used in ZipLoader.ts
    const indexHtml = fs.readFileSync(path.join(buildDestDir, 'index.html'), 'utf-8');
    const modifiedHtml = indexHtml.split('\n').map((line, index) => {
        if (line.includes('./index')) {
            if (downloadZipAtIndexHtml) {
                return `${line}\nwindow['wzbResZipList'] = [${tempName}];\n${downloadResCacheJSCodeSnippet}`;
            } else {
                return `${line}\nwindow['wzbResZipList'] = [${tempName}];`;
            }
        }
        return line;
    }).join('\n');
    fs.writeFileSync(path.join(buildDestDir, 'index.html'), modifiedHtml);
}

function parsePackSize(packSize: string) {
    if (packSize === 'option0') { // 250KB
        return 250 * 1024;
    } else if (packSize === 'option1') { // 500KB
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