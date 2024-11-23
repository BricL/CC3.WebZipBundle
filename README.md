# CC3.WebZipBundle

![Static Badge](https://img.shields.io/badge/Version-1.0.0-blue) ![Static Badge](https://img.shields.io/badge/CocosCreator-3.8.x-green) ![Static Badge](https://img.shields.io/badge/Tested_On-web-yellow)

*EN | [中文](/README-CN.md)

<p align="center"><img src="doc/img/store_banner.png" width="256"></p>

In H5 games, launch time is a critical factor influencing user retention and conversion. Besides the `total package size`, the `number of network requests` is another key factor, especially in regions like Southeast Asia, where internet speeds and hardware capabilities are often limited.

The extension for Cocos Creator 3.x packages all resource files (e.g., PNG, JPG, ASTC, WebP, JSON, CCOBN) into a ZIP file to reduce network requests and speed up the game's loading time.

(*Note: Thie implementation is inspired by an article shared by `haiyoucuv` on the Cocos Chinese forum: [使用 Zip 加速 CocosWeb 加载](https://forum.cocos.org/t/topic/156256).*)

## Installation

1. Download ZIP package from github.

2. Decompress the file and copy the content to `${your_project_path}/extensions/web-zip-bundle`.

3. Open the terminal
     * Enter `cd ${your_project_path}/` and run `npm install jszip` to install jszip.

     * `cd ${your_project_path}/extensions/web-zip-bundle`

         * Enter `npm install`，install dependency packages.

         * Enter `npm run build`，build the extension.

4. Go to the Editor menu `Extension -> Extension Manager -> Installed` to activate the extension.

   <p align="center"><img src="doc/img/extension_manager.png" width="450"></p>

(*Note：You can also check out the official docs for installation instrucctions [【擴展 安装与分享】](https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/install.html) 。*)

## How to Use

1. Go to `Build Setting` and select the `web-zip-bundle` option from the dropdown.

   * Enable：Turn on/off the extension

        * After enabling, the extension will auto generate the folder `${your_project_path}/wzb-build-config` and the file `assetsUrlRecordList.json` in the project directory.
          
        * The `assetsUrlRecordList.json` contains a record of the assets required to launch the game. During the build process, all assets listed in this file will be packaged into a ZIP file. 
        
        The contents of `assetsUrlRecordList.json` need to be manually added. Refer to the ZipLoader documentation for details on `"How to get the assets required to launch the game"`.

   * Download ZIP at index.html：Start downloading the ZIP package in `index.html`.

        * The Default is `false`

        * This will move the ZIP download request to `index.html` and use async loading to further reduce the download time.

        * To check if the download is complete, you can `await ZipLoader.getDownloadZipPromise()`.
   
   * Select Pack Size (Choose zip split size)：Set the maximum size for a single zip file. If it goes over, it'll split into multiple files.

   <p align="center"><img src="doc/img/build_setting.png" width="450"></p>

2. In the `Assets Panel`, the new item, `web-zip-bundle` will appear.

    * In the `Build Setting`, set `zip-load-boot.scene` as the project's Start Scene.

    * Open `zip-load-boot.scene`.

        * In the ZipLoader component panel on the root node, enter the original name of the start scene.

    <p align="center"><img src="doc/img/asset_inspector.png" width="450"></p>

3. ZipLoader Component

    * One of the purposes is to record the download URLs of the assets required for game startup. The sceond purpose is to inject local cache functionality before the original download process.

    * How to get the asset request records for the game?

        * Set `Is Record Assets Url` to `true` in the ZipLoader inspector. This will record the URLs of every asset download request made by the engine. 

        * During gameplay, press `ALT + W (Debug Only)` to print the record to the browser console.

            <p align="center"><img src="doc/img/console_log.png" width="450"></p>
        
        * Copy and paste the content into `assetsUrlRecordList.json`, which will serve as the basis for the Zip packing resources.

            <p align="center"><img src="doc/img/assetsUrlRecordList.png" width="450"></p>

        * Set `isRecordAssetsUrl` to `false` to stop recording.

            Generally, we set a specific point in time to stop recording, and the recorded data representes the startup resources for the game.


## Description of Download Modes

Generally, the startup process for a Web Game is as follows:

```mermaid
flowchart LR
   A[Host Server] -->|Download| B(Index.html)
   B -->|Download| C(Game Engine JS)
   C -->|Download| D(Start Scene)
   D -->|Parse Start Scene & Run| E(Download Assets)
   E --> F(Game)
```

* All the initial assets associated with the start scene are downloaded on demand, resulting in a large number of scattered network requests.

This extension bundles the assets for the Start Scene into one or a few zip files, cutting down on network requests. On mid- to low-end Android devices or slower internet, it can speed up game startup by over 30%. We provide two methods:

### Method 1: Using `zip-load-boot.scene` (General)

```mermaid
flowchart LR
   C(Game Engine JS) -->|Download| D(ZipBundle Start Scene)
   subgraph ZipBundle Dwonload Flow
   D -->|Inject local cache functionality into the XMLHttpRequest| E(Download Zip)
   end
   E -->|Download & Run| F(Start Scene)
   F -->|Load Assets From Local Cache| G(Game Play)

   style D fill:#eb3434
```

* 在原流程 `起始場景 (Start Scene)` 前插入 `zip-load-boot.scene` 場景，該場景會對注入 Assets Local Cache 功能並啟動 Zip 包的下載。

* 此方法通用且易於客製化，可依專案需求進行修改。單純降低網路請求數量，已足夠讓啟動速度在中、低階安卓、網速較低的環境快上個 `20 ~ 30%`。

### Method 2：Download Zip At Index.html

```mermaid
flowchart LR
    subgraph Async Download
        C(Game Engine JS)
        D(ZipBundle Scene)
    end

    A[Host Server] -->|Download| B(Index.html)
    B --> C(Game Engine JS) & D(Zip Files)
    C --> |Dwonload| E(ZipBundle Start Scene)
    D --> E
    subgraph "Inject local cache functionality into the XMLHttpRequest"
    E -->|Dwonload & Run| F(Start Scene)
    end
    F -->|Load Assets From Local Cache| G(Game Play)

    style E fill:#eb3434
```

* 非同步下載 `Zip 檔案` 與 `遊戲引擎核心`，節省時間速度最快。

* 這個方法偷到了下載CC引擎與引擎初始化時間，就實驗 [Cocos UI Example](https://github.com/cocos/cocos-example-ui) 數據來看可在快 `10 ~ 20%`：

    | ZipBundle | Number of Zips | Browser | Connection Type | Network Speed | Startup Time | Network Reqs
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    | On 方法1 | 1 | Chrome | http1.1 | Fast 4G | 9.62s | 30 reqs |
    | On 方法2 | 1 | Chrome | http1.1 | Fast 4G | 11.98s | 30 reqs |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    | Off | 0 | Chrome | http1.1 | Fast 4G | 17.22s | 261 reqs |


## How to Determine the Number of Split Zip Files?

在 Build Setting 設定中有選項 `Select Pack Size` 可設定分包大小，將資源切割成多個 zip 包。但...

*`“將初始資源切割成越多、越小各zip包，下載速度就越快？”`*

### Under HTTP1.1

HTTP1.1 在 Chrome 下一個連線最多 6 各下載併發，當超過後續下載請求得排隊等待。

我們用官方的 UI 範例 [Cocos UI Example](https://github.com/cocos/cocos-example-ui) 進行測試，透過不同 Select Pack Size 的設定，將啟動資源包分隔成 1各、3各、6各、12各 Zip 測試速度結果如下：

| ZipBundle | Number of Zips | Browser | Connection Type | Network Speed | Startup Time | Network Reqs
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| On | 1 | Chrome | http1.1 | Fast 4G | 9.62s | 30 reqs |
| On | 3 | Chrome | http1.1 | Fast 4G | 11.40s | 32 reqs |
| On | 6 | Chrome | http1.1 | Fast 4G | 12.36s | 35 reqs |
| On | 12 | Chrome | http1.1 | Fast 4G | 12.47s | 41 reqs |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Off | 0 | Chrome | http1.1 | Fast 4G | 17.22s | 261 reqs |

(*Note: Fast 4G simulation is used because it’s closer to real-world internet speeds, especially in Southeast Asia.*)

從 12 各下載併發可觀察到當併發數達上限，後續的下載請求會排隊等待。若等待下載中有 CC 本體 (`_virtual_cc-8ed102a6.js`)，會更明顯導致啟動速度變慢，如下圖所示：

<p align="center"><img src="doc/img/12zips_boost_testing_result.png" width="800"></p>

### HTTP2

In theory, a single TCP connection can handle more than 6 concurrent downloads. However, in practice, this depends on the host server's configuration.

### Summary

The max number of concurrent downloads in a single connection decides how many splits the initial resource package should have. A good rule of thumb is: `"number of splits < max concurrent downloads"`.

## DEMO (Host on itch.io)

* [Enable-ziploader](https://bricl.itch.io/cc3webzipbundledemo)

* [Disable-Ziploader](https://bricl.itch.io/cc3webzipbundledemo-disable-ziploader)

<p align="center"><a href="https://bricl.itch.io/cc3webzipbundledemo"><img src="doc/img/itch.io_demo.png" width="450"></a></p>


## Versions

* v1.0.0

    * The First Available Version


## References

* [WebZipBundle Demo Project](https://github.com/BricL/CC3.WebZipBundle.DemoProject)

* [使用 Zip 加速 CocosWeb 加载](https://forum.cocos.org/t/topic/156256)

* [JSZip](https://stuk.github.io/jszip/)

* Cocos Creator 官方的 UI 範例 GitHub： [Cocos UI Example](https://github.com/cocos/cocos-example-ui)
