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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipLoader = void 0;
const cc_1 = require("cc");
// @ts-ignore
const env_1 = require("cc/env");
const jszip_1 = __importDefault(require("jszip"));
const { ccclass, property } = cc_1._decorator;
let ZipLoader = class ZipLoader extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.loadSceneName = '';
        this.stopLogAssetsUrl = false;
        this.recordAssetsUrlList = [];
        this.zipCache = new Map();
        this.resCache = new Map();
        this.isPressedLeftAlt = false;
    }
    //#region public methods
    downloadResCache(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url);
                const buffer = yield response.arrayBuffer();
                const zip = yield jszip_1.default.loadAsync(buffer);
                return zip;
            }
            catch (e) {
                (0, cc_1.error)(`${this.constructor.name}.downloadResCache`, e);
            }
        });
    }
    //#region lifecycle hooks
    onLoad() {
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
            const h5lbResZipList = window.h5lbResZipList;
            if (h5lbResZipList !== undefined && h5lbResZipList.length > 0) {
                const promises = [];
                for (let i = 0; i < h5lbResZipList.length; i++) {
                    promises.push(this.downloadResCache(h5lbResZipList[i]));
                }
                const zips = yield Promise.all(promises);
                for (const zip of zips) {
                    zip.forEach((relativePath, zipEntry) => {
                        if (zipEntry.dir)
                            return;
                        (0, cc_1.log)(`${this.constructor.name}.assetsInCache: ${relativePath}`);
                        this.zipCache.set(relativePath, zipEntry);
                    });
                }
            }
            if (this.loadSceneName.trim() !== '') {
                cc_1.director.loadScene(this.loadSceneName);
            }
        }))();
    }
    inject(extension) {
        if (extension === '.cconb') {
            this.injectXMLHttpRequest();
        }
        else if (extension === '.json') {
            cc_1.assetManager.downloader.register('.json', (url, options, onComplete) => __awaiter(this, void 0, void 0, function* () {
                this.recordUrl(url);
                if (this.zipCache.has(url)) {
                    const cache = this.zipCache.get(url);
                    const res = yield cache.async("text");
                    onComplete(null, JSON.parse(res));
                    return;
                }
                try {
                    const response = yield fetch(url);
                    const jsonStr = yield response.json();
                    onComplete(null, jsonStr);
                }
                catch (e) {
                    onComplete(new Error(e), null);
                }
            }));
        }
        else if (extension === '.png' || extension === '.jpg' || extension === '.webp') {
            cc_1.assetManager.downloader.register(extension, (url, options, onComplete) => __awaiter(this, void 0, void 0, function* () {
                this.recordUrl(url);
                if (this.zipCache.has(url)) {
                    const cache = this.zipCache.get(url);
                    const res = yield cache.async("blob");
                    onComplete(null, res);
                    return;
                }
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => { onComplete(null, img); };
                img.onerror = (e) => { onComplete(new Error(e instanceof Event ? e.type : e), null); };
                img.src = url;
            }));
        }
        else {
            (0, cc_1.error)(`${this.constructor.name}.inject`, `Unknown extension: ${extension}`);
        }
    }
    /**
     * Only record the url of the assets when DEBUG or DEV is true.
     * @param url
     */
    recordUrl(url) {
        if (env_1.DEBUG || env_1.DEV) {
            if (!this.stopLogAssetsUrl) {
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
            if (extension === 'cconb') {
                that.recordUrl(url);
            }
            // 檢查zip 加載時是否有這個url
            if (that.zipCache.has(url)) {
                this.zipCacheUrl = url;
            }
            else {
                this.zipCacheUrl = null;
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
                            //如果 responseType 是 "json"，以文本格式獲取資料，並解析為 JSON
                            const text = yield cache.async("text");
                            that.resCache.set(this.zipCacheUrl, text);
                        }
                        else {
                            //以原本的 responseType 獲取。
                            const res = yield cache.async(this.responseType);
                            that.resCache.set(this.zipCacheUrl, res);
                        }
                    }
                    // 解析完了直接调用 XMLHttpRequest 的 onload 事件，不做原有的真實請求了
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
        //Object.defineProperty 直接在對象上修改現有屬性，並返回這個對象
        Object.defineProperty((XMLHttpRequest.prototype), 'response', {
            get: function () {
                // 如果當前的動態zipCacheUrl有值代表有被設定過，直接從ResCache取值
                if (this.zipCacheUrl) {
                    const res = that.resCache.get(this.zipCacheUrl);
                    return this.responseType === "json" ? JSON.parse(res) : res;
                }
                // 調用原始的 getter，如果未定義，返回undefined，但前面已經判斷過了
                return accessor.get ? accessor.get.call(this) : undefined;
            },
            set: function () {
            },
            configurable: true
        });
        return true;
    }
};
__decorate([
    property
], ZipLoader.prototype, "loadSceneName", void 0);
ZipLoader = __decorate([
    ccclass('ZipLoader')
], ZipLoader);
exports.ZipLoader = ZipLoader;
