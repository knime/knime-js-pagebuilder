// Development app launcher. Not included in production build.
import Vue from 'vue';
import c from 'consola';
import { logToConsole as enable, level } from '../logger.config';
import DevApp from './dev/DevApp.vue';
import MockUIExtComponent from './dev/views/MockUIExtComponent.vue';
import Vuex from 'vuex';

window.consola = c.create({
    level: enable ? level : -1
});

Vue.config.productionTip = false;
Vue.use(Vuex);

new Vue({
    created() {
        // eslint-disable-next-line vue/component-definition-name-casing
        Vue.component('org.knime.base.views.MockUIExtComponent.MockUIExtComponent', MockUIExtComponent);
    },
    render: h => h(DevApp),
    store: new Vuex.Store({})
}).$mount('#app');
