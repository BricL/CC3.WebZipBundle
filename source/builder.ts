import { BuildPlugin } from '../@types';
import { PACKAGE_NAME, logDebug } from './global';

const webZipBundleConfig = {
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
            description: `i18n:${PACKAGE_NAME}.options.selectPackSizeDescription`,
            default: 'option2',
            render: {
                ui: 'ui-select',
                items: [
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option0`,
                        value: 'option0',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option1`,
                        value: 'option1',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option2`,
                        value: 'option2',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option3`,
                        value: 'option3',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option4`,
                        value: 'option4',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option5`,
                        value: 'option5',
                    },
                    {
                        label: `i18n:${PACKAGE_NAME}.options.selectPackSizeOptions.option6`,
                        value: 'option6',
                    },
                ],
            },
        },
    },
};

export const load: BuildPlugin.load = function () {
    logDebug(`${PACKAGE_NAME} load`);
};
export const unload: BuildPlugin.load = function () {
    logDebug(`${PACKAGE_NAME} unload`);
};

export const configs: BuildPlugin.Configs = {
    'web-mobile': webZipBundleConfig,
    'web-desktop': webZipBundleConfig,
};