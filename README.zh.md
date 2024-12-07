# 加速你的页游戏启动！

网页游戏的启动速度直接影响用户留存与转化。除了`"初始资源总大小"`这一因素外，`"网络请求数量"`也是一个不可忽视的关键，尤其在东南亚等网速及硬件较慢的地区

该扩展将 web 平台启动时所需的资源（如：PNG、JPG、ASTC、WebP、JSON、CCONB）打包为 zip 文件，从而减少启动时的网络请求数量，加快游戏加载速度。

>*（注：对插件的意见反馈请至 [Cocos 中文论坛](https://forum.cocos.org/t/topic/163849)。）*

## 優化數據

<div align="center">

| ZipBundle | Zip 数 | 浏览器 | 连接规格 | 网速 | 耗时启动 | 网络请求 |
| - | - | - | - | - | - | - |
| On (Method 1) | 1 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: green;">9.62s</span> | <span style="font-weight: bold; color: green;">30 reqs</span> |
| On (Method 2) | 1 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: green;">11.98s</span> | <span style="font-weight: bold; color: green;">30 reqs</span> |
| --- | --- | --- | --- | --- | --- | --- |
| Off | 0 | Chrome | http1.1 | Fast 4G | <span style="font-weight: bold; color: red;">17.22s</span> | <span style="font-weight: bold; color: red;">261 reqs</span> |

</div>


本擴展提共兩種方法進行加速：

1. zip-load-boot.scene（较通用）

   * 将新场景 `zip-load-boot.scene` 插入原启动流程中，让其中的 `ZipLoader` 组件负责下载 ZIP 文件并注入资源本地缓存机制。待完成后，再启动原始启动场景（Start Scene）。  

   * 此方法通用且易于定制，可以根据项目需求进行修改。单纯降低网络请求数量，已经足够让启动速度在中低端安卓设备和网速较慢的环境中提升约 20-30%。

2. Download Zip At Index.html（偷下载时间）

   * 在启动游戏的 `index.html` 中，提前异步下载 ZIP 文件，与引擎核心的下载并行进行，节省时间，从而实现更快的启动速度。  

   * 根据实验数据，在中低端安卓设备和网速较慢的环境中，启动速度提升约 30-40%。

## 如何使用

请参阅 Github [CC3.WebZipBundle](https://github.com/BricL/CC3.WebZipBundle)

## DEMO 项目

请参阅 Github [CC3.WebZipBundle.DemoProject](https://github.com/BricL/CC3.WebZipBundle.DemoProject)
