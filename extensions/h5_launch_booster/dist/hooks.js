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
const cc_1 = require("cc");
const global_1 = require("./global");
const fs = __importStar(require("fs"));
const crypo = __importStar(require("crypto"));
const jszip_1 = __importDefault(require("jszip"));
// function log(...arg: any[]) {
//     return console.log(`[${PACKAGE_NAME}] `, ...arg);
// }
// let allAssets = [];
exports.throwError = true;
//#region lifecycle hooks
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        // allAssets = await Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
        // log(`${PACKAGE_NAME}.enable`, 'onBeforeBuild');
        // const pkgOptions = options.packages[PACKAGE_NAME];
        // log(`H5 Launch Booster: ${pkgOptions.enable}`);
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // const pkgOptions = options.packages[PACKAGE_NAME];
        // if (pkgOptions.webTestOption) {
        //     console.debug('webTestOption', true);
        // }
        // // Todo some thing
        // console.debug('get settings test', result.settings);
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // // Todo some thing
        // console.log('webTestOption', 'onAfterCompressSettings');
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const pkgOptions = options.packages[global_1.PACKAGE_NAME];
        if (pkgOptions.enable) {
            const BUILD_DEST_PATH = result.dest;
            const BUILD_CONFIG_PATH = `${Editor.Project.path}/h5lb-build-config`;
            const TEMP_PATH = cc_1.path.join(BUILD_CONFIG_PATH, 'temp');
            // Clean/Create temp folder
            if (fs.existsSync(TEMP_PATH))
                fs.rmdirSync(TEMP_PATH, { recursive: true });
            fs.mkdirSync(TEMP_PATH, { recursive: true });
            // Copy assets to temp folder
            const resultString = [];
            const jsonString = fs.readFileSync(cc_1.path.join(BUILD_CONFIG_PATH, global_1.ASSETS_URL_RECORD_LIST_JSON), 'utf-8');
            const assetsPathList = JSON.parse(jsonString);
            const oneMB = parsePackSize(pkgOptions.selectPackSize); //  500KB in bytes
            const zipPackages = [];
            let assetsInZip = [];
            let totalSize = 0;
            for (const assetPath of assetsPathList) {
                let srcAssetPath = cc_1.path.join(BUILD_DEST_PATH, assetPath);
                const assetStat = fs.statSync(srcAssetPath);
                totalSize += assetStat.size;
                assetsInZip.push(assetPath);
                if (totalSize >= oneMB) {
                    zipPackages.push(assetsInZip);
                    console.log(`[${global_1.PACKAGE_NAME}] assetsInZip size: ${totalSize}, assets: ${assetsInZip.length}`);
                    assetsInZip = [];
                    totalSize = 0;
                }
            }
            if (assetsInZip.length > 0) {
                zipPackages.push(assetsInZip);
                console.log(`[${global_1.PACKAGE_NAME}] assetsInZip size: ${totalSize}, assets: ${assetsInZip.length}`);
            }
            console.log(`[${global_1.PACKAGE_NAME}] zipPackages: ${zipPackages.length}`);
            for (let i = 0; i < zipPackages.length; i++) {
                const assetsPathList = zipPackages[i];
                for (const assetPath of assetsPathList) {
                    let assetName = cc_1.path.basename(assetPath);
                    let srcAssetPath = cc_1.path.join(BUILD_DEST_PATH, assetPath);
                    try {
                        if (fs.existsSync(srcAssetPath)) {
                            const destAssetPath = cc_1.path.join(TEMP_PATH, `zipPackage${i}`, cc_1.path.dirname(assetPath), assetName);
                            copyAsset(srcAssetPath, destAssetPath);
                            resultString.push(destAssetPath);
                        }
                    }
                    catch (exp) {
                        console.error(`[${global_1.PACKAGE_NAME}] copy file failed: ${exp}`);
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
                yield zipFolder(cc_1.path.join(TEMP_PATH, `zipPackage${i}`), cc_1.path.join(BUILD_CONFIG_PATH, h5lbResCacheZipName));
                // Do the cut and paste
                const srcPath = cc_1.path.join(BUILD_CONFIG_PATH, h5lbResCacheZipName);
                const destPath = cc_1.path.join(BUILD_DEST_PATH, 'assets', h5lbResCacheZipName);
                fs.copyFileSync(srcPath, destPath);
                fs.unlinkSync(srcPath);
                tempName += `'assets/${h5lbResCacheZipName}'` + (i < zipPackages.length - 1 ? ', ' : '');
            }
            // Modify index.html to add 'h5lbResCache' gloable variable to window object which is used in ZipLoader.ts
            const indexHtml = fs.readFileSync(cc_1.path.join(BUILD_DEST_PATH, 'index.html'), 'utf-8');
            const modifiedHtml = indexHtml.split('\n').map((line, index) => {
                if (line.includes('./index')) {
                    return `${line}\nwindow['h5lbResZipList'] = [${tempName}];`;
                }
                return line;
            }).join('\n');
            fs.writeFileSync(cc_1.path.join(BUILD_DEST_PATH, 'index.html'), modifiedHtml);
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
    });
};
exports.unload = unload;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // console.warn(`${PACKAGE_NAME} run onError`);
    });
};
exports.onError = onError;
const onBeforeMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`onBeforeMake: root: ${root}, options: ${options}`);
    });
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`onAfterMake: root: ${root}, options: ${options}`);
    });
};
exports.onAfterMake = onAfterMake;
// #region utils functions
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
        function addFolderToZip(folderPath, zipFolder) {
            const items = fs.readdirSync(folderPath);
            for (const item of items) {
                const fullPath = cc_1.path.join(folderPath, item);
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    const folder = zipFolder.folder(item);
                    addFolderToZip(fullPath, folder);
                }
                else {
                    const fileData = fs.readFileSync(fullPath);
                    zipFolder.file(item, fileData);
                }
            }
        }
        addFolderToZip(srcFolder, zip);
        const zipContent = yield zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        fs.writeFileSync(destFolder, zipContent);
        console.log(`[${global_1.PACKAGE_NAME}] Folder ${srcFolder} has been zipped to ${destFolder}`);
    });
}
function copyAsset(srcAssetPath, destAssetPath) {
    console.log(`[${global_1.PACKAGE_NAME}] Copying file: ${srcAssetPath} to ${destAssetPath}`);
    fs.mkdirSync(cc_1.path.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}
