'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.$ = exports.template = exports.style = void 0;
const global_1 = require("./global");
let panel;
exports.style = ``;
exports.template = `
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
exports.$ = {
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
function update(options, key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (key) {
            return;
        }
        // when import build options, key will bey ''
        init();
    });
}
exports.update = update;
function ready(options) {
    // @ts-ignore
    panel = this;
    panel.options = options;
    init();
}
exports.ready = ready;
function close() {
    panel.$.hideLink.removeEventListener('change', onHideLinkChange);
}
exports.close = close;
function init() {
    panel.$.hideLink.value = panel.options.hideLink;
    updateLink();
    panel.$.hideLink.addEventListener('change', onHideLinkChange);
}
function onHideLinkChange(event) {
    panel.options.hideLink = event.target.value;
    // Note: dispatch the change to build panel
    panel.dispatch('update', `packages.${global_1.PACKAGE_NAME}.hideLink`, panel.options.hideLink);
    updateLink();
}
function updateLink() {
    if (panel.options.hideLink) {
        panel.$.link.style.display = 'none';
    }
    else {
        panel.$.link.style.display = 'block';
    }
}
