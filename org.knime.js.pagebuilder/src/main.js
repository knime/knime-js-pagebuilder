// Development app launcher. Not included in production build.

import Vue from 'vue';
import c from 'consola';
import { logToConsole as enable, level } from '../logger.config';
import DevApp from './dev/DevApp.vue';
import Vuex from 'vuex';
import iFrameResize from 'iframe-resizer/js/iframeResizer';

window.consola = c.create({
    level: enable ? level : -1
});

Vue.config.productionTip = false;
Vue.use(Vuex);

Vue.directive('resize', {
    bind(el, { value = {} }) {
        el.addEventListener('load', () => iFrameResize(value, el));
    }
});

new Vue({
    render: h => h(DevApp),
    store: new Vuex.Store({})
}).$mount('#app');
