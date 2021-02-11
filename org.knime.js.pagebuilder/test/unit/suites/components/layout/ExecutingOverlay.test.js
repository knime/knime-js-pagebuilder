import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import ExecutingOverlay from '@/components/layout/ExecutingOverlay';

import * as storeConfig from '~/store/pagebuilder';

describe('ExecutingOverlay.vue', () => {
    let localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders nothing by default', () => {
        let store = new Vuex.Store({ modules: { pagebuilder: {
            ...storeConfig,
            getters: {
                nodesReExecuting: jest.fn()
            }
        } } });

        let wrapper = shallowMount(ExecutingOverlay, {
            store,
            localVue,
            propsData: {
                nodeId: '007'
            }
        });
        expect(wrapper.html()).toBeFalsy();
    });

    it('renders loading svg when nodeId re-executing', () => {
        let store = new Vuex.Store({ modules: { pagebuilder: {
            ...storeConfig,
            getters: {
                nodesReExecuting: () => ['007']
            }
        } } });

        let wrapper = shallowMount(ExecutingOverlay, {
            store,
            localVue,
            propsData: {
                nodeId: '007'
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.find('svg')).toBeTruthy();
    });
});
