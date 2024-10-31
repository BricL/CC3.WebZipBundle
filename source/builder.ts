import { BuildPlugin } from '../@types';
import { PACKAGE_NAME, logDebug } from './global';

export const load: BuildPlugin.load = function() {
    logDebug(`${PACKAGE_NAME} load`);
};
export const unload: BuildPlugin.load = function() {
    logDebug(`${PACKAGE_NAME} unload`);
};

export const configs: BuildPlugin.Configs = {
    'web-mobile': {
        hooks: './hooks',
        options: {
            enable: {
                label: `i18n:${PACKAGE_NAME}.options.enable`,
                description: `i18n:${PACKAGE_NAME}.options.enable`,
                default: true,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            downloadZipAtIndexHtml: {
                label: `i18n:${PACKAGE_NAME}.options.downloadZipAtIndexHtml`,
                description: `i18n:${PACKAGE_NAME}.options.downloadZipAtIndexHtml`,
                default: false,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            selectPackSize: {
                label: `i18n:${PACKAGE_NAME}.options.selectPackSize`,
                description: `i18n:${PACKAGE_NAME}.options.selectPackSize`,
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