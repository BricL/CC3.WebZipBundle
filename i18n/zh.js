module.exports = {
    title: "Web Zip Bundle",
    description: "压缩资源包以加速 web 平台（移动端/桌面端）的启动速度。",
    options: {
        enable: "启用",
        downloadZipAtIndexHtml: "在 index.html 下载压缩包",
        selectPackSize: "选择压缩包大小",
        selectPackSizeDescription: "请根据网络环境和项目大小选择打包大小。打包大小越大，生成的文件数量越少，但文件大小越大。文件数量较少适合 HTTP1.1 或低并发下载。",
        selectPackSizeOptions: {
            option0: "250KB",
            option1: "500KB",
            option2: "1MB",
            option3: "2MB",
            option4: "3MB",
            option5: "4MB",
            option6: "Unlimited",
        }
    },
};