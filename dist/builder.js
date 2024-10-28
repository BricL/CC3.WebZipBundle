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
            selectPackSize: {
                label: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSize`,
                description: `i18n:${global_1.PACKAGE_NAME}.options.selectPackSize`,
                default: 'option2',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: `500kb`,
                            value: 'option1',
                        },
                        {
                            label: `1Mb`,
                            value: 'option2',
                        },
                        {
                            label: `2Mb`,
                            value: 'option3',
                        },
                        {
                            label: `3Mb`,
                            value: 'option4',
                        },
                        {
                            label: `4Mb`,
                            value: 'option5',
                        },
                        {
                            label: `Unlimited`,
                            value: 'option6',
                        },
                    ],
                },
            },
        },
    },
};
