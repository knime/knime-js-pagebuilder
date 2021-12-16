import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import PageBuilder from '@/components/PageBuilder';
import Page from '@/components/layout/Page';
import AlertGlobal from '@/components/ui/AlertGlobal';

describe('PageBuilder.vue', () => {
    let store, localVue, context;

    beforeEach(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
        store = new Vuex.Store();
        PageBuilder.initStore(store);
        const page = {
            wizardExecutionState: 'INTERACTION_REQUIRED',
            wizardPageContent: {}
        };
        store.commit('pagebuilder/setPage', page);
        context = {
            store,
            localVue
        };
    });

    it('initializes the pagebuilder store', () => {
        expect(store.state.pagebuilder).toBeDefined();
        expect(store.state['pagebuilder/interactivity']).toBeDefined();
        expect(store.state['pagebuilder/service']).toBeDefined();
        expect(store.state['pagebuilder/alert']).toBeDefined();
    });

    it('renders', () => {
        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Page).exists()).toBeTruthy();
        expect(wrapper.find(AlertGlobal).exists()).toBeTruthy();
    });

    it('does not render Page if called with unsupported wizardExecutionState', () => {
        const page = {
            wizardExecutionState: 'SOMEFAKESTATE'
        };
        store.commit('pagebuilder/setPage', page);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Page).exists()).toBeFalsy();
    });
});
