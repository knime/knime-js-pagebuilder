import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView';
import WebNode from '@/components/views/WebNode';
import UIExtension from '@/components/views/UIExtension';
import NotDisplayable from '@/components/views/NotDisplayable';
import ViewExecutable from '@/components/views/ViewExecutable';
import ExecutingOverlay from '@/components/ui/ExecutingOverlay';

import * as storeConfig from '~/store/pagebuilder';

describe('NodeView.vue', () => {
    let localVue, context;

    const getWebNodeProps = () => ({ viewConfig: { nodeID: '0:0:7' } });
    const getUIExtProps = () => ({ viewConfig: { nodeID: '0:0:9' } });

    const mockWebNodeConfig = {
        foo: 'bar',
        viewRepresentation: {
            '@class': 'testing.notWidget'
        },
        nodeInfo: {
            displayPossible: true
        }
    };
    const mockNodeViewConfig = {
        baz: 'qux',
        resourceInfo: {},
        initialData: '{}',
        projectId: '1:0:1',
        workflowId: 'root',
        extensionType: 'VIEW',
        nodeInfo: {
            displayPossible: true,
            nodeState: 'executed'
        }
    };

    const getWizardPageContent = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => ({
        webNodes: webNodes || {
            '1:0:1:0:0:7': { ...mockWebNodeConfig }
        },
        nodeViews: nodeViews || {
            '1:0:1:0:0:9': { ...mockNodeViewConfig }
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

    it('renders', () => {
        let wrapper = shallowMount(NodeView, context);
        expect(wrapper.html()).toBeTruthy();
    });

    it('composes nodeIds conditionally based on the projectRelativePageIDSuffix', () => {
        let { viewConfig } = getWebNodeProps();
        let localContext = createContext({ webNodePageConfiguration: {} });

        let wrapper = shallowMount(NodeView, {
            ...localContext,
            propsData: getWebNodeProps()
        });

        expect(wrapper.vm.nodeId).toEqual(viewConfig.nodeID);

        localContext = createContext();

        wrapper = shallowMount(NodeView, {
            ...localContext,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.nodeId).toEqual('1:0:1:0:0:7');
    });

    describe('conditional rendering', () => {
        it('renders views as WebNodes', () => {
            let wrapper = shallowMount(NodeView, { ...context, propsData: getWebNodeProps() });
            expect(wrapper.find(WebNode).exists()).toBeTruthy();
            expect(wrapper.find(UIExtension).exists()).toBeFalsy();
            expect(wrapper.find(NotDisplayable).exists()).toBeFalsy();
        });

        it('renders views as UI extension', () => {
            let wrapper = shallowMount(NodeView, { ...context, propsData: getUIExtProps() });
            expect(wrapper.find(UIExtension).exists()).toBeTruthy();
            expect(wrapper.find(WebNode).exists()).toBeFalsy();
            expect(wrapper.find(NotDisplayable).exists()).toBeFalsy();
        });

        it('renders not displayable web nodes', () => {
            let expectedNodeInfo = {
                displayPossible: false
            };
            let localContext = createContext({
                webNodes: {
                    '1:0:1:0:0:7': { ...mockWebNodeConfig, nodeInfo: expectedNodeInfo }
                }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: getWebNodeProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(false);
            expect(wrapper.find(NotDisplayable).exists()).toBe(true);
            expect(wrapper.find(NotDisplayable).props('nodeInfo')).toEqual(expectedNodeInfo);
            expect(wrapper.find(NotDisplayable).props('nodeId')).toEqual('1:0:1:0:0:7');
        });

        xit('renders not displayable ui extensions', () => {
            // TODO: UIEXT-110 Handle displayability of UIExtensions
        });

        it('renders execute component for UI-Extensions', () => {
            let expectedNodeInfo = {
                displayPossible: true,
                nodeState: 'idle'
            };
            let localContext = createContext({
                nodeViews: {
                    '1:0:1:0:0:9': { ...mockNodeViewConfig, nodeInfo: expectedNodeInfo }
                }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: getUIExtProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.find(ViewExecutable).exists()).toBe(true);
        });

        it('renders nothing if no view available', () => {
            let wrapper = shallowMount(NodeView, {
                ...createContext({
                    webNodes: {},
                    nodeViews: {}
                }),
                propsData: getWebNodeProps()
            });
            expect(wrapper.find(UIExtension).exists()).toBeFalsy();
            expect(wrapper.find(WebNode).exists()).toBeFalsy();
            expect(wrapper.find(NotDisplayable).exists()).toBeFalsy();
        });
    });

    describe('re-execution handling', () => {
        it('detects if the node is currently (re)executing via node state', () => {
            let wrapper = shallowMount(NodeView, {
                ...createContext({
                    webNodes: {
                        '1:0:1:0:0:7': {
                            baz: 'qux',
                            viewRepresentation: {
                                '@class': 'not a defined widget class'
                            },
                            nodeInfo: {
                                displayPossible: true,
                                nodeState: 'executing'
                            }
                        }
                    }
                }),
                propsData: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.find(ExecutingOverlay).vm.show).toBe(true);
        });

        it('detects if the node is currently (re)executing via re-executing node ids', () => {
            let localContext = createContext();
            localContext.store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.find(ExecutingOverlay).vm.show).toBe(true);
        });

        it('decides when to show a spinner on executing content via updateCount', () => {
            let localContext = createContext();
            localContext.store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.find(ExecutingOverlay).vm.show).toBe(true);
            expect(wrapper.vm.showSpinner).toBe(false);

            localContext.store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.find(ExecutingOverlay).vm.show).toBe(true);
            expect(wrapper.vm.showSpinner).toBe(true);
        });
    });
});
