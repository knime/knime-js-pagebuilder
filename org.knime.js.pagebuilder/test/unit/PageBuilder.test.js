import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import PageBuilder from '@/components/PageBuilder';
import Page from '@/components/Page';

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
    });

    it('renders page component', () => {
        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Page).exists()).toBeTruthy();
    });

    it('renders nothing if called with unsupported wizardExecutionState', () => {
        const page = {
            wizardExecutionState: 'SOMEFAKESTATE'
        };
        store.commit('pagebuilder/setPage', page);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.html()).toBeUndefined();
    });

});
