import { expect, describe, beforeAll, afterEach, it, vi } from 'vitest';
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';

import APWrapper from '@/components/APWrapper.vue';
import PageBuilder from '@/components/PageBuilder.vue';
import DebugButton from '@/components/ui/DebugButton.vue';
import RefreshButton from '@/components/ui/RefreshButton.vue';

import * as storeConfig from '@/store/pagebuilder';

describe('APWrapper.vue', () => {
    let context;

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
        let store = createStore({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: getWizardPageContent({ webNodes, nodeViews, webNodePageConfiguration })
        });

        return {
            global: {
                mocks: {
                    $store: store
                }
            }
        };
    };

    beforeAll(() => {
        context = createContext();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders PageBuilder if loaded', () => {
        const wrapper = shallowMount(APWrapper, context);
        expect(wrapper.findComponent(PageBuilder).exists()).toBeTruthy();
    });

    it('renders headless class', () => {
        let wrapper = shallowMount(APWrapper, context);
        expect(wrapper.classes()).not.toContain('headless');

        window.headless = true;
        wrapper = shallowMount(APWrapper, context);
        expect(wrapper.classes()).toContain('headless');

        delete window.headless;
    });

    describe('debug info and tooling', () => {
        it('hides debug/refresh buttons by default (without debug info)', () => {
            expect(window.getDebugInfo).toBeUndefined();
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toBeNull();
            expect(wrapper.findComponent(DebugButton).exists()).toBeFalsy();
            expect(wrapper.findComponent(RefreshButton).exists()).toBeFalsy();
        });

        it('conditionally shows debug button', () => {
            const debugInfo = { remoteDebuggingPort: '8888' };
            const debugMock = vi.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.findComponent(DebugButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });

        it('do not show debug button if no remoteDebuggingPort is set', () => {
            const debugInfo = { refreshRequired: true };
            const debugMock = vi.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.findComponent(DebugButton).exists()).toBeFalsy();
            delete window.getDebugInfo;
        });

        it('conditionally shows refresh button', () => {
            const debugInfo = { refreshRequired: true, remoteDebuggingPort: '8888' };
            const debugMock = vi.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.findComponent(RefreshButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });

        it('do not show refresh button if no remoteDebuggingPort is set', () => {
            const debugInfo = { refreshRequired: true };
            const debugMock = vi.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            const wrapper = shallowMount(APWrapper, context);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.findComponent(DebugButton).exists()).toBeFalsy();
            delete window.getDebugInfo;
        });

        it('handles non-critical errors loading debug info', () => {
            const debugMock = vi.fn(() => {
                throw Error('Something went wrong getting info');
            });
            window.getDebugInfo = debugMock;
            let wrapper;
            expect(() => {
                wrapper = shallowMount(APWrapper, context);
            }).not.toThrow();
            expect(wrapper.vm.debugInfo).toBeNull();
            delete window.getDebugInfo;
        });
    });
});
