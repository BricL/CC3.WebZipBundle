module.exports = {
    title: "Web Zip Bundle",
    description: "Zip the bundle to accelerate the startup speed of web platform (mobile/desktop).",
    options: {
        enable: "Enable",
        downloadZipAtIndexHtml: "Download zip at index.html",
        selectPackSize: "Select Pack Size",
        selectPackSizeDescription: "Please select the pack size according to the network environment and the size of the project. The larger the pack size, generate the less number of files, but the larger the file size. The less number of files suitable for HTTP1.1 or low concurrency download.",
        selectPackSizeOptions: {
            option1: "500KB",
            option2: "1MB",
            option3: "2MB",
            option4: "3MB",
            option5: "4MB",
            option6: "Unlimited",
        }
    },  
};