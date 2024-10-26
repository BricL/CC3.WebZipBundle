"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const global_1 = require("./global");
const load = function () {
    console.debug(`${global_1.PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    console.debug(`${global_1.PACKAGE_NAME} unload`);
};
exports.unload = unload;
// const complexTestItems = {
//     number: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestNumber`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestNumber`,
//         default: 80,
//         render: {
//             ui: 'ui-num-input',
//             attributes: {
//                 step: 1,
//                 min: 0,
//             },
//         },
//     },
//     string: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestString`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestString`,
//         default: 'cocos',
//         render: {
//             ui: 'ui-input',
//             attributes: {
//                 placeholder: `i18n:${PACKAGE_NAME}.options.enterCocos`,
//             },
//         },
//         verifyRules: ['ruleTest'],
//     },
//     boolean: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestBoolean`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestBoolean`,
//         default: true,
//         render: {
//             ui: 'ui-checkbox',
//         },
//     },
// };
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
            // remoteAddress: {
            //     label: `i18n:${PACKAGE_NAME}.options.remoteAddress`,
            //     default: 'https://www.cocos.com/',
            //     render: {
            //         ui: 'ui-input',
            //         attributes: {
            //             placeholder: 'Enter remote address...',
            //         },
            //     },
            //     verifyRules: ['required'],
            // },
            // enterCocos: {
            //     label: `i18n:${PACKAGE_NAME}.options.enterCocos`,
            //     description: `i18n:${PACKAGE_NAME}.options.enterCocos`,
            //     default: '',
            //     render: {
            //         /**
            //          * @en Please refer to Developer -> UI Component for a list of all supported UI components
            //          * @zh 请参考 开发者 -> UI 组件 查看所有支持的 UI 组件列表
            //          */
            //         ui: 'ui-input',
            //         attributes: {
            //             placeholder: `i18n:${PACKAGE_NAME}.options.enterCocos`,
            //         },
            //     },
            //     verifyRules: ['ruleTest'],
            //     verifyLevel: 'warn',
            // },
            selectPackSize: {
                label: `Set size limit per zip`,
                description: `Set the maximum size for individual zip archives.`,
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
            // objectTest: {
            //     label: `i18n:${PACKAGE_NAME}.options.objectTest`,
            //     description: `i18n:${PACKAGE_NAME}.options.objectTest`,
            //     type: 'object',
            //     default: {
            //         number: complexTestItems.number.default,
            //         string: complexTestItems.string.default,
            //         boolean: complexTestItems.boolean.default,
            //     },
            //     itemConfigs: complexTestItems,
            // },
            // arrayTest: {
            //     label: `i18n:${PACKAGE_NAME}.options.arrayTest`,
            //     description: `i18n:${PACKAGE_NAME}.options.arrayTest`,
            //     type: 'array',
            //     default: [complexTestItems.number.default, complexTestItems.string.default, complexTestItems.boolean.default],
            //     itemConfigs: JSON.parse(JSON.stringify(Object.values(complexTestItems))),
            // },
        },
        // panel: './panel',
        // verifyRuleMap: {
        //     ruleTest: {
        //         message: `i18n:${PACKAGE_NAME}.options.ruleTest_msg`,
        //         func(val, buildOptions) {
        //             if (val === 'cocos') {
        //                 return true;
        //             }
        //             return false;
        //         },
        //     },
        // },
    },
};
// export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
