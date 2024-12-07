# Boost your web game startup!

In H5 games, launch time is a critical factor influencing user retention and conversion. Besides the `total package size`, the `number of network requests` is another key factor, especially in regions like Southeast Asia, where internet speeds and hardware capabilities are often limited.

The extension for Cocos Creator 3.x packages all resource files (e.g., PNG, JPG, ASTC, WebP, JSON, CCOBN) into a ZIP file to reduce network requests and speed up the game's loading time.

>*(Note：If you have any feedback on the plugin, please go to [Cocos 中文论坛](https://forum.cocos.org/t/topic/163849))*


## Optimization Data

<div align="center">

| ZipBundle | Number of Zips | Browser | Connection Type | Network Speed | Startup Time | Network Reqs
| - | - | - | - | - | - | - |
| On (Method 1) | 1 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: green;">9.62s</span> | <span style="font-weight: bold; color: green;">30 reqs</span> |
| On (Method 2) | 1 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: green;">11.98s</span> | <span style="font-weight: bold; color: green;">30 reqs</span> |
| --- | --- | --- | --- | --- | --- | --- |
| Off | 0 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: red;">17.22s</span> | <span style="font-weight: bold; color: red;">261 reqs</span> |

</div>


This extension provides two methods to accelerate game startup:

1. zip-load-boot.scene (More General)

   * Insert the new scene `zip-load-boot.scene` into the original startup process. The `ZipLoader` component in this scene handles downloading ZIP files and injecting a local caching mechanism for resources. Once completed, the original startup scene (Start Scene) will be launched.  

   * This method is general and easy to customize based on project requirements. Simply reducing the number of network requests is sufficient to boost startup speed by about 20-30% on low- to mid-range Android devices or in slow network environments.

2. Download Zip At Index.html (Stealing Download Time)

   * In the game's `index.html`, ZIP files are downloaded asynchronously in advance, parallel to the engine core downloads, saving time and achieving faster startup.  

   * According to experimental data, startup speed improves by about 30-40% on low- to mid-range Android devices or in slow network environments.


## How it Works

<p align="center"><a href="https://bricl.itch.io/cc3webzipbundledemo"><img src="doc/img/WZB.jpg" width="450"></a></p>


## How to Use

Please refer to the GitHub repository [CC3.WebZipBundle](https://github.com/BricL/CC3.WebZipBundle)

## DEMO Project

Please refer to the GitHub repository [CC3.WebZipBundle.DemoProject](https://github.com/BricL/CC3.WebZipBundle.DemoProject)