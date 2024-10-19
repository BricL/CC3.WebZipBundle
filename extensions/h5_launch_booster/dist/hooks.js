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
function log(...arg) {
    return console.log(`[${global_1.PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
//#region lifecycle hooks
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${global_1.PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO some thing
        // log(`${PACKAGE_NAME}.enable`, 'onBeforeBuild');
        const pkgOptions = options.packages[global_1.PACKAGE_NAME];
        log(`H5 Launch Booster: ${pkgOptions.enable}`);
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
        if (pkgOptions) {
            const BUILD_PROJECT_DEST_PATH = result.dest;
            const H5LB_BUILD_CONFIG_PATH = `${Editor.Project.path}/h5lb-build-config`;
            const TEMP_PATH = cc_1.path.join(H5LB_BUILD_CONFIG_PATH, 'temp');
            // Clean/Create temp folder
            if (fs.existsSync(TEMP_PATH))
                fs.rmdirSync(TEMP_PATH, { recursive: true });
            fs.mkdirSync(TEMP_PATH, { recursive: true });
            // Copy assets to temp folder
            const resultString = [];
            const jsonString = fs.readFileSync(`${H5LB_BUILD_CONFIG_PATH}/assetsUrlListRecord.json`, 'utf-8');
            const assetsPathList = JSON.parse(jsonString);
            for (const assetPath of assetsPathList) {
                let assetName = cc_1.path.basename(assetPath);
                let srcAssetPath = cc_1.path.join(BUILD_PROJECT_DEST_PATH, assetPath);
                try {
                    if (fs.existsSync(srcAssetPath)) {
                        const destAssetPath = cc_1.path.join(TEMP_PATH, cc_1.path.dirname(assetPath), assetName);
                        copyAsset(srcAssetPath, destAssetPath);
                        resultString.push(destAssetPath);
                    }
                    else {
                        let isFound = false;
                        // Can't find the asset name with md5 hash, try to find the asset name without md5 hash
                        const regexTemplate = /\.[a-z,A-Z,0-9]*\./;
                        assetName = assetName.replace(regexTemplate, ".");
                        assetName = assetName.replace(cc_1.path.extname(assetName), "");
                        const srcAssetDir = cc_1.path.dirname(srcAssetPath);
                        const items = fs.readdirSync(srcAssetDir);
                        for (const item of items) {
                            if (item.includes(assetName)) {
                                srcAssetPath = cc_1.path.join(srcAssetDir, item);
                                const destAssetPath = cc_1.path.join(TEMP_PATH, cc_1.path.dirname(assetPath), item);
                                copyAsset(srcAssetPath, destAssetPath);
                                resultString.push(destAssetPath);
                                isFound = true;
                                break;
                            }
                        }
                        if (!isFound) {
                            // The asset file not exists
                            console.error(`[${global_1.PACKAGE_NAME}] file not exists: ${srcAssetPath} `);
                        }
                    }
                }
                catch (exp) {
                    console.error(`[${global_1.PACKAGE_NAME}] copy file failed: ${exp}`);
                }
            }
            let md5Hash = '';
            if (options.md5Cache) {
                if (resultString.length > 0) {
                    const hash = crypo.createHash('md5').update(resultString.join('')).digest('hex');
                    md5Hash = hash.substring(0, 5);
                }
                console.log(`[${global_1.PACKAGE_NAME}] md5 hash: ${md5Hash}`);
            }
            yield zipFolder(TEMP_PATH, cc_1.path.join(H5LB_BUILD_CONFIG_PATH, options.md5Cache ? `h5lbResCache.${md5Hash}.zip` : 'h5lbResCache.zip'));
        }
    });
};
exports.onAfterBuild = onAfterBuild;
function copyAsset(srcAssetPath, destAssetPath) {
    // const destAssetPath = path.join(TEMP_PATH, path.dirname(assetPath), assetName);
    console.log(`[${global_1.PACKAGE_NAME}] Copying file: ${srcAssetPath} to ${destAssetPath}`);
    fs.mkdirSync(cc_1.path.dirname(destAssetPath), { recursive: true });
    fs.copyFileSync(srcAssetPath, destAssetPath);
}
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
//#region utils functions
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
        const zipContent = yield zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(destFolder, zipContent);
        console.log(`[${global_1.PACKAGE_NAME}] Folder ${srcFolder} has been zipped to ${destFolder}`);
    });
}
