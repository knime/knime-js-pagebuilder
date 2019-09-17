import PageBuilder from '@/components/PageBuilder';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Vuex from 'vuex';
import * as storeConfig from '../../store/pagebuilder';

describe('PageBuilder.vue', () => {

    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    it('renders nothing if no viewState set', () => {
        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });

        let context = {
            store,
            localVue
        };
        let mocks = { $store: store };

        let wrapper = shallowMount(PageBuilder, context, { mocks });

        expect(wrapper.html()).toBeUndefined();
    });

});
