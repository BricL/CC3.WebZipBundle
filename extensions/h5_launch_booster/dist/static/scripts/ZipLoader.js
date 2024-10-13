"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipLoader = void 0;
const cc_1 = require("cc");
// @ts-ignore
const env_1 = require("cc/env");
const { ccclass, property } = cc_1._decorator;
let ZipLoader = class ZipLoader extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.loadSceneName = '';
        this.stopLogAssetsUrl = false;
        this.zipLoaderUrlList = [];
        this.zipCache = new Map();
        this.resCache = new Map();
        this.isPressedLeftAlt = false;
    }
    onLoad() {
        this.inject('.cconb');
        this.inject('.json');
        this.inject('.png');
        this.inject('.jpg');
        this.inject('.webp');
    }
    start() {
        cc_1.input.on(cc_1.Input.EventType.KEY_DOWN, (event) => {
            if (event.keyCode === cc_1.KeyCode.ALT_LEFT) {
                this.isPressedLeftAlt = true;
            }
            else if (event.keyCode === cc_1.KeyCode.KEY_W && this.isPressedLeftAlt) {
                if (env_1.DEBUG)
                    console.log(this.zipLoaderUrlList);
            }
        });
        cc_1.input.on(cc_1.Input.EventType.KEY_UP, (event) => {
            if (event.keyCode === cc_1.KeyCode.ALT_LEFT) {
                this.isPressedLeftAlt = false;
            }
        });
        if (this.loadSceneName.trim() !== '') {
            cc_1.director.loadScene(this.loadSceneName);
        }
        cc_1.director.addPersistRootNode(this.node);
    }
    inject(extension) {
        if (extension === '.cconb') {
            this.injectXMLHttpRequest();
        }
        else if (extension === '.json') {
            cc_1.assetManager.downloader.register('.json', (url, options, onComplete) => {
                this.recordUrl(url);
                fetch(url).then((response) => { return response.json(); }).then((jsonStr) => {
                    onComplete(null, jsonStr);
                }).catch((e) => {
                    onComplete(new Error(e), null);
                });
            });
        }
        else if (extension === '.png' || extension === '.jpg' || extension === '.webp') {
            cc_1.assetManager.downloader.register(extension, (url, options, onComplete) => {
                this.recordUrl(url);
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    onComplete(null, img);
                };
                img.onerror = (e) => {
                    onComplete(new Error(e instanceof Event ? e.type : e), null);
                };
                img.src = url;
            });
        }
        else {
            (0, cc_1.error)(`${this.constructor.name}.inject`, `Unknown extension: ${extension}`);
        }
    }
    recordUrl(url) {
        if (!this.stopLogAssetsUrl) {
            this.zipLoaderUrlList.push(url);
            // const searchPatternForMd5Code = /\.\w+\./;
            // if (searchPatternForMd5Code.test(url)) {
            //     const outputUrl = url.replace(/\.\w+/, '');
            //     log(`${this.constructor.name}.downloader`, url);
            //     log(`${this.constructor.name}.downloader`, outputUrl);
            //     this.zipLoaderUrlList.push(outputUrl);
            // } else {
            //     const outputUrl = url;
            //     log(`${this.constructor.name}.downloader`, url);
            //     log(`${this.constructor.name}.downloader`, outputUrl);
            //     this.zipLoaderUrlList.push(url);
            // }
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
            // // 檢查zip 加載時是否有這個url
            // if (that.zipCache.has(url)) {
            //     this.zipCacheUrl = url;
            // } else {
            //     this.zipCacheUrl = null;
            // }
            return oldOpen.apply(this, [method, url, async, user, password]);
        };
        // // 注入新 send 方法
        // const oldSend = (XMLHttpRequest.prototype).send;
        // (XMLHttpRequest.prototype).send = async function (data) {
        //     if (this.zipCacheUrl) {
        //         if (!that.resCache.has(this.zipCacheUrl)) {
        //             const cache = that.zipCache.get(this.zipCacheUrl);
        //             if (this.responseType === "json") {
        //                 //如果 responseType 是 "json"，以文本格式獲取資料，並解析為 JSON
        //                 const text = await cache.async("text");
        //                 that.resCache.set(this.zipCacheUrl, text);
        //             } else {
        //                 //以原本的 responseType 獲取。
        //                 const res = await cache.async(this.responseType);
        //                 that.resCache.set(this.zipCacheUrl, res);
        //             }
        //         }
        //         // 解析完了直接调用 XMLHttpRequest 的 onload 事件，不做原有的真實請求了
        //         if (typeof this.onload === "function") {
        //             const event = new ProgressEvent('load', {
        //                 lengthComputable: false,
        //                 loaded: 0,
        //                 total: 0
        //             });
        //             this.onload(event);
        //         }
        //         return;
        //     }
        //     return oldSend.apply(this, [data]);
        // }
        // //Object.defineProperty 直接在對象上修改現有屬性，並返回這個對象
        // Object.defineProperty((XMLHttpRequest.prototype), 'response', {
        //     get: function () {
        //         // 如果當前的動態zipCacheUrl有值代表有被設定過，直接從ResCache取值
        //         if (this.zipCacheUrl) {
        //             const res = that.resCache.get(this.zipCacheUrl);
        //             return this.responseType === "json" ? JSON.parse(res) : res;
        //         }
        //         // 調用原始的 getter，如果未定義，返回undefined，但前面已經判斷過了
        //         return accessor.get ? accessor.get.call(this) : undefined;
        //     },
        //     set: function () {
        //     },
        //     configurable: true
        // });
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
