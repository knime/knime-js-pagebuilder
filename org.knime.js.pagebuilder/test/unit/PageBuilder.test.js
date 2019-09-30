import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import PageBuilder from '@/components/PageBuilder';
import Page from '@/components/Page';
import Progress from '@/components/Progress';
import Result from '@/components/Result';

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

        expect(wrapper.find(Page).exists()).toBeTruthy();
    });

    it('renders Execution if viewState is "executing"', () => {
        store.commit('pagebuilder/setViewState', 'executing');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Progress).exists()).toBeTruthy();
    });

    it('renders Result if viewState is "result"', () => {
        store.commit('pagebuilder/setViewState', 'result');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Result).exists()).toBeTruthy();
    });

});
