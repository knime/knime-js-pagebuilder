import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import PageBuilder from '@/components/PageBuilder';
import PageFrame from '@/components/frames/PageFrame';
import ExecutionFrame from '@/components/frames/ExecutionFrame';
import ResultFrame from '@/components/frames/ResultFrame';

describe('PageBuilder.vue', () => {

    let store, localVue, context;

    beforeEach(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
        store = new Vuex.Store();
        PageBuilder.initStore({
            nextPage: () => {},
            previousPage: () => {}
        }, store);
        context = {
            store,
            localVue
        };
    });

    it('initializes the pagebuilder store', () => {
        expect(store.state.pagebuilder).toBeDefined();
    });

    it('renders nothing if no viewState set', () => {
        store.commit('pagebuilder/setViewState', null);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.html()).toBeUndefined();
    });

    it('renders Page if viewState is "page"', () => {
        store.commit('pagebuilder/setViewState', 'page');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(PageFrame).exists()).toBeTruthy();
    });

    it('renders Execution if viewState is "executing"', () => {
        store.commit('pagebuilder/setViewState', 'executing');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(ExecutionFrame).exists()).toBeTruthy();
    });

    it('renders Result if viewState is "result"', () => {
        store.commit('pagebuilder/setViewState', 'result');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(ResultFrame).exists()).toBeTruthy();
    });

});
