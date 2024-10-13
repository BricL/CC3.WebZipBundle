'use strict';

import { ICustomPanelThis, ITaskOptions } from '../@types';
import { PACKAGE_NAME } from './global';
let panel: ICustomPanelThis;

export const style = ``;

export const template = `
<div class="build-plugin">
    <ui-prop>
        <ui-label slot="label" value="Hide Link"></ui-label>
        <ui-checkbox slot="content"></ui-checkbox>
    </ui-prop>
    <ui-prop id="link">
        <ui-label slot="label" value="Docs"></ui-label>
        <ui-link slot="content" value=${Editor.Utils.Url.getDocUrl('editor/publish/custom-build-plugin.html')}></ui-link>
    </ui-prop>
</div>
`;

export const $ = {
    root: '.build-plugin',
    hideLink: 'ui-checkbox',
    link: '#link',
};

/**
 * all change of options dispatched will enter here
 * @param options 
 * @param key 
 * @returns 
 */
export async function update(options: ITaskOptions, key: string) {
    if (key) {
        return;
    }
    // when import build options, key will bey ''
    init();
}

export function ready(options: ITaskOptions) {
    // @ts-ignore
    panel = this as ICustomPanelThis;
    panel.options = options;
    init();
}

export function close() {
    panel.$.hideLink.removeEventListener('change', onHideLinkChange);
}

function init() {
    panel.$.hideLink.value = panel.options.hideLink;
    updateLink();
    panel.$.hideLink.addEventListener('change', onHideLinkChange);
}

function onHideLinkChange(event: any) {
    panel.options.hideLink = event.target.value;
    // Note: dispatch the change to build panel
    panel.dispatch('update', `packages.${PACKAGE_NAME}.hideLink`, panel.options.hideLink);
    updateLink();
}

function updateLink() {
    if (panel.options.hideLink) {
        panel.$.link.style.display = 'none';
    } else {
        panel.$.link.style.display = 'block';
    }
}
