"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const global_1 = require("./global");
const load = function () {
    (0, global_1.logDebug)(`${global_1.PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    (0, global_1.logDebug)(`${global_1.PACKAGE_NAME} unload`);
};
exports.unload = unload;
exports.configs = {
    'web-mobile': {
        hooks: './hooks',
        options: {
            enable: {
                label: `i18n:${global_1.PACKAGE_NAME}.options.enable`,
                description: `i18n:${global_1.PACKAGE_NAME}.options.enable`,
                default: true,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            downloadZipAtIndexHtml: {
                label: `i18n:${global_1.PACKAGE_NAME}.options.downloadZipAtIndexHtml`,
                description: `i18n:${global_1.PACKAGE_NAME}.options.downloadZipAtIndexHtml`,
                default: false,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            selectPackSize: {
                label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSize`,
                description: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeDescription`,
                default: 'option2',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option0`,
                            value: 'option0',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option1`,
                            value: 'option1',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option2`,
                            value: 'option2',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option3`,
                            value: 'option3',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option4`,
                            value: 'option4',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option5`,
                            value: 'option5',
                        },
                        {
                            label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSizeOptions.option6`,
                            value: 'option6',
                        },
                    ],
                },
            },
        },
    },
};
