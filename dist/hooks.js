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
            const BUILD_DEST_PATH = result.dest;
            const BUILD_CONFIG_PATH = path_1.default.join(Editor.Project.path, global_1.BUILD_CONFIG_FOLDER);
            const TEMP_PATH = path_1.default.join(BUILD_CONFIG_PATH, 'temp');
            // Clean/Create temp folder
            if (fs.existsSync(TEMP_PATH))
                fs.rmdirSync(TEMP_PATH, { recursive: true });
            fs.mkdirSync(TEMP_PATH, { recursive: true });
            // Copy assets to temp folder
            const resultString = [];
            const jsonString = fs.readFileSync(path_1.default.join(BUILD_CONFIG_PATH, global_1.ASSETS_URL_RECORD_LIST_JSON), 'utf-8');
            const assetsPathList = JSON.parse(jsonString);
            const oneMB = parsePackSize(pkgOptions.selectPackSize); //  500KB in bytes
            const zipPackages = [];
            let assetsInZip = [];
            let totalSize = 0;
            for (const assetPath of assetsPathList) {
                let srcAssetPath = path_1.default.join(BUILD_DEST_PATH, assetPath);
                try {
                    const assetStat = fs.statSync(srcAssetPath);
                    totalSize += assetStat.size;
                    assetsInZip.push(assetPath);
                    if (totalSize >= oneMB) {
                        zipPackages.push(assetsInZip);
                        assetsInZip = [];
                        totalSize = 0;
                    }
                }
                catch (exp) {
                    if (exp.code === 'ENOENT') {
                        (0, global_1.logWarn)(`onAfterBuild: File not found, ${srcAssetPath}`);
                    }
                    else {
                        (0, global_1.logError)(`onAfterBuild: An error occurred while checking the file, ${exp.message}`);
                    }
                }
            }
            if (assetsInZip.length > 0) {
                zipPackages.push(assetsInZip);
            }
            // Copy assets to temp folder
            for (let i = 0; i < zipPackages.length; i++) {
                const assetsPathList = zipPackages[i];
                for (const assetPath of assetsPathList) {
                    let assetName = path_1.default.basename(assetPath);
                    let srcAssetPath = path_1.default.join(BUILD_DEST_PATH, assetPath);
                    try {
                        if (fs.existsSync(srcAssetPath)) {
                            const destAssetPath = path_1.default.join(TEMP_PATH, `${global_1.ZIP_NAME}${i}`, path_1.default.dirname(assetPath), assetName);
                            copyAsset(srcAssetPath, destAssetPath);
                            resultString.push(destAssetPath);
                        }
                    }
                    catch (exp) {
                        (0, global_1.logError)(`Copy file failed: ${exp}`);
                    }
                }
            }
            // Calcaulte md5 hash this time
            let md5Hash = '';
            if (options.md5Cache) {
                if (resultString.length > 0) {
                    const hash = crypo.createHash('md5').update(resultString.join('')).digest('hex');
                    md5Hash = hash.substring(0, 5);
                }
            }
            // Generate ${ZIP_NAME}.zip
            let tempName = '';
            for (let i = 0; i < zipPackages.length; i++) {
                const resCacheZipName = options.md5Cache ? `${global_1.ZIP_NAME}${i}.${md5Hash}.zip` : `${global_1.ZIP_NAME}${i}.zip`;
                yield zipFolder(path_1.default.join(TEMP_PATH, `${global_1.ZIP_NAME}${i}`), path_1.default.join(BUILD_CONFIG_PATH, resCacheZipName));
                // Do the cut and paste
                const srcPath = path_1.default.join(BUILD_CONFIG_PATH, resCacheZipName);
                const destPath = path_1.default.join(BUILD_DEST_PATH, 'assets', resCacheZipName);
                fs.copyFileSync(srcPath, destPath);
                fs.unlinkSync(srcPath);
                tempName += `'assets/${resCacheZipName}'` + (i < zipPackages.length - 1 ? ', ' : '');
            }
            // Modify index.html to add ${ZIP_NAME} gloable variable to window object which is used in ZipLoader.ts
            const indexHtml = fs.readFileSync(path_1.default.join(BUILD_DEST_PATH, 'index.html'), 'utf-8');
            const modifiedHtml = indexHtml.split('\n').map((line, index) => {
                if (line.includes('./index')) {
                    return `${line}\nwindow['wzbResZipList'] = [${tempName}];`;
                }
                return line;
            }).join('\n');
            fs.writeFileSync(path_1.default.join(BUILD_DEST_PATH, 'index.html'), modifiedHtml);
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
