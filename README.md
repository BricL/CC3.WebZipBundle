# Web Zip Bundle
用於將 `web platform` 用到的資源，如：圖檔(png、jpg、astc、webp)、json、cconb，打包成單個 Zip 檔案下載，減少對網路的請求數量 (web requests) 加速遊戲啟動速度。

## 安裝方法

1. 下載專案成 zip。

2. 解壓縮後將內容複製到 `your_project_path/extensions/web-zip-bundle` 中。

3. 至 Editor menu 裡 `Extension/Extension Manager/Installed` 中，找到 web-zip-bunld 並啟動。

   <p align="center"><img src="doc/img/extension_manager.png" width="450"></p>

4. 至 `Build Setting` 中，下拉至最底會看到 web-zip-bundle 的參數選項。

   * Enable (啟動)：啟動或關閉功能。

   * Select Pack Size (選擇zip分割大小)：設定單一包 zip 檔案大小的約略上限，超過就會分包。

   <p align="center"><img src="doc/img/build_setting.png" width="450"></p>

## [itch.io Demo](https://bricl.itch.io/cc3webzipbundledemo)

修改官方 [cocos-example-ui](https://github.com/cocos/cocos-example-ui)，建置為 `Web Platform` 應用，並匯入擴展 `Web Zip Bundle` 量測遊戲啟動速度的改進。

<p align="center"><img src="doc/img/itch.io_demo.png" width="450"></p>

## 版本
* v1.0.0
    * 第一個可用版本
