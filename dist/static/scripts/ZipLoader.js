"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var ZipLoader_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipLoader = void 0;
const cc_1 = require("cc");
// @ts-ignore
const env_1 = require("cc/env");
const jszip_1 = __importDefault(require("jszip"));
const { ccclass, property } = cc_1._decorator;
let ZipLoader = ZipLoader_1 = class ZipLoader extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.isRecordAssetsUrl = true;
        this.isAwaitResCacheDwonload = true;
        this.loadSceneName = '';
        this.downloadResCachePromise = null;
        this.recordAssetsUrlList = [];
        this.zipCache = new Map();
        this.resCache = new Map();
        this.isPressedLeftAlt = false;
    }
    //#region public methods
    static get inst() {
        return ZipLoader_1.instance;
    }
    get getDownloadResCachePromise() {
        return this.downloadResCachePromise;
    }
    downloadResCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const resZipList = window.wzbResZipList;
            if (resZipList !== undefined && resZipList.length > 0) {
                const promises = [];
                for (let i = 0; i < resZipList.length; i++) {
                    promises.push(this.downloadZip(resZipList[i]));
                }
                const zips = yield Promise.all(promises);
                for (const zip of zips) {
                    zip.forEach((relativePath, zipEntry) => {
                        if (zipEntry.dir)
                            return;
                        else
                            this.zipCache.set(relativePath, zipEntry);
                    });
                }
            }
        });
    }
    //#region private methods
    downloadZip(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url);
                const buffer = yield response.arrayBuffer();
                const zip = yield jszip_1.default.loadAsync(buffer);
                return zip;
            }
            catch (e) {
                (0, cc_1.error)(`[${this.constructor.name}].downloadZip`, e);
            }
        });
    }
    inject(extension) {
        if (extension === '.cconb') {
            this.injectXMLHttpRequest();
        }
        else if (extension === '.png' || extension === '.jpg' || extension === '.webp') {
            cc_1.assetManager.downloader.register(extension, (url, options, onComplete) => __awaiter(this, void 0, void 0, function* () {
                this.recordUrl(url);
                if (this.resCache.has(url)) {
                    const res = this.resCache.get(url);
                    onComplete(null, res);
                }
                else {
                    if (this.zipCache.has(url)) {
                        const cache = this.zipCache.get(url);
                        const res = yield cache.async("blob");
                        this.resCache.set(url, res);
                        this.zipCache.delete(url);
                        onComplete(null, res);
                        return;
                    }
                    else {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => { onComplete(null, img); };
                        img.onerror = (e) => { onComplete(new Error(e instanceof Event ? e.type : e), null); };
                        img.src = url;
                    }
                }
            }));
        }
        else if (extension === '.json') {
            // assetManager.downloader.register('.json', async (url, options, onComplete) => {
            //     this.recordUrl(url);
            //     if (this.zipCache.has(url)) {
            //         const cache = this.zipCache.get(url);
            //         const res = await cache.async("text");
            //         onComplete(null, JSON.parse(res));
            //         return;
            //     }
            //     try {
            //         const response = await fetch(url);
            //         const jsonStr = await response.json();
            //         onComplete(null, jsonStr);
            //     } catch (e) {
            //         onComplete(new Error(e), null);
            //     }
            // });
        }
        else {
            (0, cc_1.error)(`[${this.constructor.name}].inject`, `Unknown extension: ${extension}`);
        }
    }
    /**
     * Only record the url of the assets when DEBUG or DEV is true.
     * @param url
     */
    recordUrl(url) {
        if (env_1.DEBUG || env_1.DEV) {
            if (this.isRecordAssetsUrl) {
                this.recordAssetsUrlList.push(url);
            }
        }
    }
    injectXMLHttpRequest() {
        const accessor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
        if (accessor === undefined)
            return false;
        const that = this;
        // 注入新 open 方法
        const oldOpen = (XMLHttpRequest.prototype).open;
        // @ts-ignore
        (XMLHttpRequest.prototype).open = function (method, url, async, user, password) {
            const extension = url.split('.').pop();
            if (extension === 'cconb' || extension === 'json') {
                that.recordUrl(url);
            }
            // 檢查zip 加載時是否有這個url
            if (that.zipCache.has(url)) {
                this.zipCacheUrl = url;
            }
            else {
                this.zipCacheUrl = null;
                (0, cc_1.warn)(`[${that.constructor.name}] The requested asset not in cache: ${url}`);
            }
            return oldOpen.apply(this, [method, url, async, user, password]);
        };
        // 注入新 send 方法
        const oldSend = (XMLHttpRequest.prototype).send;
        (XMLHttpRequest.prototype).send = function (data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.zipCacheUrl) {
                    if (!that.resCache.has(this.zipCacheUrl)) {
                        const cache = that.zipCache.get(this.zipCacheUrl);
                        if (this.responseType === "json") {
                            const text = yield cache.async("text");
                            that.resCache.set(this.zipCacheUrl, text);
                        }
                        else {
                            const res = yield cache.async(this.responseType);
                            that.resCache.set(this.zipCacheUrl, res);
                        }
                        that.zipCache.delete(this.zipCacheUrl);
                    }
                    if (typeof this.onload === "function") {
                        const event = new ProgressEvent('load', {
                            lengthComputable: false,
                            loaded: 0,
                            total: 0
                        });
                        this.onload(event);
                    }
                    return;
                }
                return oldSend.apply(this, [data]);
            });
        };
        Object.defineProperty((XMLHttpRequest.prototype), 'response', {
            get: function () {
                if (this.zipCacheUrl) {
                    const res = that.resCache.get(this.zipCacheUrl);
                    return this.responseType === "json" ? JSON.parse(res) : res;
                }
                return accessor.get ? accessor.get.call(this) : undefined;
            },
            set: function () { },
            configurable: true
        });
        return true;
    }
    //#region lifecycle hooks
    onLoad() {
        ZipLoader_1.instance = this;
        this.inject('.cconb');
        this.inject('.json');
        this.inject('.png');
        this.inject('.jpg');
        this.inject('.webp');
    }
    start() {
        cc_1.director.addPersistRootNode(this.node);
        if (env_1.DEBUG || env_1.DEV) {
            cc_1.input.on(cc_1.Input.EventType.KEY_DOWN, (event) => {
                if (event.keyCode === cc_1.KeyCode.ALT_LEFT) {
                    this.isPressedLeftAlt = true;
                }
                else if (event.keyCode === cc_1.KeyCode.KEY_W && this.isPressedLeftAlt) {
                    console.log(this.recordAssetsUrlList);
                }
            });
            cc_1.input.on(cc_1.Input.EventType.KEY_UP, (event) => {
                if (event.keyCode === cc_1.KeyCode.ALT_LEFT) {
                    this.isPressedLeftAlt = false;
                }
            });
        }
        (() => __awaiter(this, void 0, void 0, function* () {
            this.downloadResCachePromise = this.downloadResCache();
            if (this.isAwaitResCacheDwonload) {
                yield this.downloadResCachePromise;
            }
            if (this.loadSceneName.trim() !== '') {
                cc_1.director.loadScene(this.loadSceneName);
            }
        }))();
    }
};
ZipLoader.instance = null;
__decorate([
    property
], ZipLoader.prototype, "isRecordAssetsUrl", void 0);
__decorate([
    property
], ZipLoader.prototype, "isAwaitResCacheDwonload", void 0);
__decorate([
    property
], ZipLoader.prototype, "loadSceneName", void 0);
ZipLoader = ZipLoader_1 = __decorate([
    ccclass('ZipLoader')
], ZipLoader);
exports.ZipLoader = ZipLoader;
