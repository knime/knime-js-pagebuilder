import PageBuilder from '@/components/PageBuilder';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Vuex from 'vuex';

describe('PageBuilder.vue', () => {

    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    it('renders', () => {

        store = new Vuex.Store({});

        let context = {
            store,
            localVue,
            propsData: {
                actions: {
                    messageToParent: jest.fn()
                }
            }
        };
        let mocks = { $store: store };

        let wrapper = shallowMount(PageBuilder, context, { mocks });

        expect(wrapper.html()).toBeTruthy();
    });

});
