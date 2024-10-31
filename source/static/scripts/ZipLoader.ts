import { _decorator, assetManager, Component, director, error, Input, input, KeyCode, warn } from "cc";
// @ts-ignore
import { DEBUG, DEV } from 'cc/env';
import JSZip from "jszip";

const { ccclass, property } = _decorator;

@ccclass('ZipLoader')
export class ZipLoader extends Component {
    @property
    public isRecordAssetsUrl: boolean = true;
    @property
    public isAwaitResCacheDwonload: boolean = true;
    @property
    public loadSceneName: string = '';

    private static instance: ZipLoader = null;
    private downloadResCachePromise: Promise<void> = null;
    private recordAssetsUrlList = [];
    private zipCache = new Map<string, JSZip.JSZipObject>();
    private resCache = new Map();
    private isPressedLeftAlt = false;

    //#region public methods
    public static get inst(): ZipLoader {
        return ZipLoader.instance;
    }

    public get getDownloadResCachePromise(): Promise<void> {
        return this.downloadResCachePromise;
    }

    public async downloadResCache() {
        const wzbDownloadResCache = (window as any)['wzbDownloadResCache'];
        if (wzbDownloadResCache !== undefined) {
            const bufferArray = await Promise.all(wzbDownloadResCache);
            for (const buffer of bufferArray) {
                const zip = await JSZip.loadAsync(buffer);
                zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
                    if (zipEntry.dir)
                        return;
                    else
                        this.zipCache.set(relativePath, zipEntry);
                });
            }
        } else {
            const resZipList = (window as any).wzbResZipList;
            if (resZipList !== undefined && resZipList.length > 0) {
                const promises: Promise<JSZip>[] = [];
                for (let i = 0; i < resZipList.length; i++) {
                    promises.push(this.downloadZip(resZipList[i]));
                }

                const zips = await Promise.all(promises);

                for (const zip of zips) {
                    zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
                        if (zipEntry.dir)
                            return;
                        else
                            this.zipCache.set(relativePath, zipEntry);
                    });
                }
            }
        }
    }

    //#region private methods
    private async downloadZip(url: string) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const zip = await JSZip.loadAsync(buffer);
            return zip;
        } catch (e) {
            error(`[${this.constructor.name}].downloadZip`, e);
        }
    }

    /**
     * Only record the url of the assets when DEBUG or DEV is true.
     * @param url 
     */
    private recordUrl(url: string) {
        if (DEBUG || DEV) {
            if (this.isRecordAssetsUrl) {
                this.recordAssetsUrlList.push(url);
            }
        }
    }

    /**
     * Support the file formate was dwonloaded using Image, like .png, .jpg, .bmp, .jpeg, .gif, .ico, .tiff, .webp, .image.
     * @param extension 
     */
    private injectDownloadImage(extension: string) {
        assetManager.downloader.register(extension, async (url, options, onComplete) => {
            this.recordUrl(url);

            if (this.resCache.has(url)) {
                const res = this.resCache.get(url);
                onComplete(null, res);
            } else {
                if (this.zipCache.has(url)) {
                    const cache = this.zipCache.get(url);
                    const res = await cache.async("blob");
                    this.resCache.set(url, res);
                    this.zipCache.delete(url);

                    onComplete(null, res);
                    return;
                } else {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => { onComplete(null, img); };
                    img.onerror = (e) => { onComplete(new Error(e instanceof Event ? e.type : e), null); };
                    img.src = url;
                }
            }
        });
    }

    /**
     * Support the file formate was dwonloaded using XMLHttpRequest, like .cconb, .astc, .json.
     * @returns 
     */
    private injectXMLHttpRequest(): boolean {
        const accessor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
        if (accessor === undefined)
            return false;

        const that = this;

        // 注入新 open 方法
        const oldOpen = (XMLHttpRequest.prototype).open;
        // @ts-ignore
        (XMLHttpRequest.prototype).open = function (method: string, url: string, async: boolean, user: string, password: string) {
            const extension = url.split('.').pop();
            if (extension === 'cconb' || extension === 'astc' || extension === 'json') {
                that.recordUrl(url);
            }

            // 檢查zip 加載時是否有這個url
            if (that.zipCache.has(url)) {
                this.zipCacheUrl = url;
            } else {
                this.zipCacheUrl = null;
                warn(`[${that.constructor.name}] The requested asset not in cache: ${url}`);
            }

            return oldOpen.apply(this, [method, url, async, user, password]);
        }

        // 注入新 send 方法
        const oldSend = (XMLHttpRequest.prototype).send;
        (XMLHttpRequest.prototype).send = async function (data) {
            if (this.zipCacheUrl) {
                if (!that.resCache.has(this.zipCacheUrl)) {
                    const cache = that.zipCache.get(this.zipCacheUrl);
                    if (this.responseType === "json") {
                        const text = await cache.async("text");
                        that.resCache.set(this.zipCacheUrl, text);
                    } else {
                        const res = await cache.async(this.responseType);
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
        }

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
    protected onLoad(): void {
        ZipLoader.instance = this;
        this.injectXMLHttpRequest();
        this.injectDownloadImage('.png');
        this.injectDownloadImage('.jpg');
        this.injectDownloadImage('.bmp');
        this.injectDownloadImage('.jpeg');
        this.injectDownloadImage('.gif');
        this.injectDownloadImage('.ico');
        this.injectDownloadImage('.tiff');
        this.injectDownloadImage('.webp');
        this.injectDownloadImage('.image');
    }

    protected start(): void {
        director.addPersistRootNode(this.node);

        if (DEBUG || DEV) {
            input.on(Input.EventType.KEY_DOWN, (event) => {
                if (event.keyCode === KeyCode.ALT_LEFT) {
                    this.isPressedLeftAlt = true;
                } else if (event.keyCode === KeyCode.KEY_W && this.isPressedLeftAlt) {
                    console.log(this.recordAssetsUrlList);
                }
            });

            input.on(Input.EventType.KEY_UP, (event) => {
                if (event.keyCode === KeyCode.ALT_LEFT) {
                    this.isPressedLeftAlt = false;
                }
            });
        }

        (async () => {
            this.downloadResCachePromise = this.downloadResCache();

            if (this.isAwaitResCacheDwonload) {
                await this.downloadResCachePromise;
            }

            if (this.loadSceneName.trim() !== '') {
                director.loadScene(this.loadSceneName);
            }
        })();
    }
}