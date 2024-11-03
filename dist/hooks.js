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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const global_1 = require("./global");
const fs = __importStar(require("fs"));
const crypo = __importStar(require("crypto"));
const jszip_1 = __importDefault(require("jszip"));
const path_1 = __importDefault(require("path"));
exports.throwError = true;
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
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.load = load;
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgOptions = options.packages[global_1.PACKAGE_NAME];
        if (pkgOptions.enable) {
            const BUILD_DEST_DIR = result.dest;
            const BUILD_CONFIG_DIR = path_1.default.join(Editor.Project.path, global_1.BUILD_CONFIG_FOLDER);
            const TEMP_DIR = path_1.default.join(BUILD_CONFIG_DIR, 'temp');
            // Get packs from assetsUrlRecordList.json
            const packs = getPacksFromAssetsUrlReocrdList(path_1.default.join(BUILD_CONFIG_DIR, global_1.ASSETS_URL_RECORD_LIST_JSON), BUILD_DEST_DIR, parsePackSize(pkgOptions.selectPackSize));
            // Create temp folder and Copy assets to temp folder, then return md5 hash
            const md5Hash = copyAssetsToTempFolder(packs, BUILD_DEST_DIR, TEMP_DIR, options.md5Cache);
            // Generate ${ZIP_NAME}.zip
            yield generateZipFiles(packs, md5Hash, BUILD_DEST_DIR, BUILD_CONFIG_DIR, TEMP_DIR, options.md5Cache, pkgOptions.downloadZipAtIndexHtml);
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.unload = unload;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onError = onError;
const onBeforeMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
    });
};
exports.onAfterMake = onAfterMake;
// #region utils functions
/**
 * Copy assets to temp folder
 * @param assetsUrlRecordListPath
 * @param buildDestDir
 * @param splitSizePerPack
 * @returns
 */
function getPacksFromAssetsUrlReocrdList(assetsUrlRecordListPath, buildDestDir, splitSizePerPack) {
    const jsonString = fs.readFileSync(assetsUrlRecordListPath, 'utf-8');
    const assetsUrlRecordList = JSON.parse(jsonString);
    const packs = [];
    let assetsUrlInPack = [];
    let accumlatedSize = 0;
    for (const assetUrl of assetsUrlRecordList) {
        const srcAssetsUrl = [];
        let srcAssetPath = path_1.default.join(buildDestDir, assetUrl);
        let srcAssetDir = path_1.default.dirname(srcAssetPath);
        let srcAssetName = path_1.default.basename(srcAssetPath);
        srcAssetName = srcAssetName.replace(/\.[a-zA-Z0-9]+\./g, '.');
        const srcAssetBasename = srcAssetName.split('.')[0];
        let matchingFiles = fs.readdirSync(srcAssetDir).filter((file) => file.includes(srcAssetBasename));
        if (matchingFiles.length === 0) {
            (0, global_1.logWarn)(`onAfterBuild: File not found, ${srcAssetPath}`);
            continue;
        }
        for (let i = 0; i < matchingFiles.length; i++)
            srcAssetsUrl.push(path_1.default.join(path_1.default.dirname(assetUrl), matchingFiles[i]));
        try {
            for (const srcAssetUrl of srcAssetsUrl) {
                const stat = fs.statSync(path_1.default.join(buildDestDir, srcAssetUrl));
                accumlatedSize += stat.size;
                assetsUrlInPack.push(srcAssetUrl);
                if (accumlatedSize >= splitSizePerPack) {
                    packs.push(assetsUrlInPack);
                    assetsUrlInPack = [];
                    accumlatedSize = 0;
                }
            }
        }
        catch (exp) {
            (0, global_1.logError)(`onAfterBuild: An error occurred while checking the file, ${exp.message}`);
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
function copyAssetsToTempFolder(packs, buildDestDir, tempDir, isMd5Cache) {
    const md5HashString = [];
    if (fs.existsSync(tempDir))
        fs.rmdirSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });
    for (let i = 0; i < packs.length; i++) {
        for (const assetUrl of packs[i]) {
            let srcAssetName = path_1.default.basename(assetUrl);
            let srcAssetPath = path_1.default.join(buildDestDir, assetUrl);
            try {
                if (fs.existsSync(srcAssetPath)) {
                    const destAssetPath = path_1.default.join(tempDir, `${global_1.ZIP_NAME}${i}`, path_1.default.dirname(assetUrl), srcAssetName);
                    copyAsset(srcAssetPath, destAssetPath);
                    md5HashString.push(destAssetPath);
                }
            }
            catch (exp) {
                (0, global_1.logError)(`Copy file failed: ${exp}`);
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
function generateZipFiles(packs, md5Hash, buildDestDir, buildConfigDir, tempDir, md5Cache, downloadZipAtIndexHtml) {
    return __awaiter(this, void 0, void 0, function* () {
        let tempName = '';
        for (let i = 0; i < packs.length; i++) {
            const resCacheZipName = md5Cache ? `${global_1.ZIP_NAME}${i}.${md5Hash}.zip` : `${global_1.ZIP_NAME}${i}.zip`;
            yield zipFolder(path_1.default.join(tempDir, `${global_1.ZIP_NAME}${i}`), path_1.default.join(buildConfigDir, resCacheZipName));
            // Do the cut and paste
            const srcPath = path_1.default.join(buildConfigDir, resCacheZipName);
            const destPath = path_1.default.join(buildDestDir, 'assets', resCacheZipName);
            fs.copyFileSync(srcPath, destPath);
            fs.unlinkSync(srcPath);
            tempName += `'assets/${resCacheZipName}'` + (i < packs.length - 1 ? ', ' : '');
        }
        // Modify index.html to add ${ZIP_NAME} gloable variable to window object which is used in ZipLoader.ts
        const indexHtml = fs.readFileSync(path_1.default.join(buildDestDir, 'index.html'), 'utf-8');
        const modifiedHtml = indexHtml.split('\n').map((line, index) => {
            if (line.includes('./index')) {
                if (downloadZipAtIndexHtml) {
                    return `${line}\nwindow['wzbResZipList'] = [${tempName}];\n${downloadResCacheJSCodeSnippet}`;
                }
                else {
                    return `${line}\nwindow['wzbResZipList'] = [${tempName}];`;
                }
            }
            return line;
        }).join('\n');
        fs.writeFileSync(path_1.default.join(buildDestDir, 'index.html'), modifiedHtml);
    });
}
function parsePackSize(packSize) {
    if (packSize === 'option1') { // 500KB
        return 500 * 1024;
    }
    else if (packSize === 'option2') { // 1MB
        return 1024 * 1024;
    }
    else if (packSize === 'option3') { // 2MB
        return 2 * 1024 * 1024;
    }
    else if (packSize === 'option4') { // 3MB
        return 3 * 1024 * 1024;
    }
    else if (packSize === 'option5') { // 4MB
        return 4 * 1024 * 1024;
    }
    else {
        return Number.MAX_SAFE_INTEGER;
    }
}
function zipFolder(srcFolder, destFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const zip = new jszip_1.default();
        addFileToZip(srcFolder, zip);
        const zipContent = yield zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        fs.writeFileSync(destFolder, zipContent);
        (0, global_1.log)(`Folder ${srcFolder} has been zipped to ${destFolder}`);
    });
}
function addFileToZip(dirPath, zip) {
    const contentsInDir = fs.readdirSync(dirPath);
    for (const item of contentsInDir) {
        const fullPath = path_1.default.join(dirPath, item);
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                addFileToZip(fullPath, zip.folder(item));
            }
            else {
                const data = fs.readFileSync(fullPath);
                zip.file(item, data);
            }
        }
        catch (exp) {
            if (exp.code === 'ENOENT') {
                (0, global_1.logWarn)(`zipFolder: File not found, ${fullPath}`);
            }
            else {
                (0, global_1.logError)(`zipFolder: An error occurred while checking the file, ${exp.message}`);
            }
        }
    }
}
function copyAsset(srcAssetPath, destAssetPath) {
    fs.mkdirSync(path_1.default.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}
