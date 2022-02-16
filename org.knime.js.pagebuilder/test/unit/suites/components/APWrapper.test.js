import Vue from 'vue';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import APWrapper from '@/components/APWrapper';
import PageBuilder from '@/components/PageBuilder';
import DebugButton from '@/components/ui/DebugButton';
import RefreshButton from '@/components/ui/RefreshButton';

import * as storeConfig from '~/store/pagebuilder';

describe('APWrapper.vue', () => {
    let localVue, context;

    const getWizardPageContent = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => ({
        webNodes: webNodes || {
            '1:0:1:0:0:7': {
                foo: 'bar',
                viewRepresentation: {
                    '@class': 'testing.notWidget'
                },
                nodeInfo: {
                    displayPossible: true
                }
            }
        },
        nodeViews: nodeViews || {
            DIALOG: {},
            VIEW: {}
        },
        webNodePageConfiguration: webNodePageConfiguration || {
            projectRelativePageIDSuffix: '1:0:1'
        }
    });

    const createContext = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => {
        let store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: getWizardPageContent({ webNodes, nodeViews, webNodePageConfiguration })
        });

        return {
            store,
            localVue
        };
    };

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        context = createContext();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders empty wrapper', () => {
        const wrapper = shallowMount(APWrapper, context);

        expect(wrapper.find(PageBuilder).exists()).toBeFalsy();
    });

    it('renders PageBuilder if loaded', () => {
        Vue.component('PageBuilder', PageBuilder);
        const wrapper = shallowMount(APWrapper, context);
        expect(wrapper.find(PageBuilder).exists()).toBeTruthy();
    });

    describe('debug info and tooling', () => {
        it('hides debug/refresh buttons by default (without debug info)', () => {
            expect(window.getDebugInfo).not.toBeDefined();
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toBe(null);
            expect(wrapper.find(DebugButton).exists()).toBeFalsy();
            expect(wrapper.find(RefreshButton).exists()).toBeFalsy();
        });

        it('conditionally shows debug button', () => {
            const debugInfo = { remoteDebuggingPort: '8888' };
            const debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(DebugButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });

        it('do not show debug button if no remoteDebuggingPort is set', () => {
            const debugInfo = { refreshRequired: true };
            const debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(DebugButton).exists()).toBeFalsy();
            delete window.getDebugInfo;
        });

        it('conditionally shows refresh button', () => {
            const debugInfo = { refreshRequired: true, remoteDebuggingPort: '8888' };
            const debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(RefreshButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });


        it('do not show refresh button if no remoteDebuggingPort is set', () => {
            const debugInfo = { refreshRequired: true };
            const debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(DebugButton).exists()).toBeFalsy();
            delete window.getDebugInfo;
        });

        it('handles non-critical errors loading debug info', () => {
            const debugMock = jest.fn(() => { throw Error('Something went wrong getting info'); });
            window.getDebugInfo = debugMock;
            let wrapper;
            expect(() => { wrapper = shallowMount(APWrapper, context); }).not.toThrow();
            expect(wrapper.vm.debugInfo).toBe(null);
            delete window.getDebugInfo;
        });
    });
});
