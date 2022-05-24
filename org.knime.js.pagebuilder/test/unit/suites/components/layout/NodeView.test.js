import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView';
import WebNode from '@/components/views/WebNode';
import UIExtension from '@/components/views/UIExtension';
import NotDisplayable from '@/components/views/NotDisplayable';
import ViewExecutable from '@/components/views/ViewExecutable';
import ExecutingOverlay from '@/components/ui/ExecutingOverlay';

import * as pagebuilderConfig from '~/store/pagebuilder';
import * as dialogConfig from '~/store/dialog';

describe('NodeView.vue', () => {
    let localVue, context;

    const getWebNodeProps = () => ({ viewConfig: { nodeID: '0:0:7' } });
    const getUIExtProps = () => ({ viewConfig: { nodeID: '0:0:9' } });
    const getUIExtDialogProps = () => ({ viewConfig: { nodeID: 'DIALOG' } });

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
            nodeState: 'executed'
        }
    };
    const mockNodeDialogConfig = {
        projectId: '1:0:1',
        workflowId: 'root',
        extensionType: 'dialog',
        nodeInfo: {
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
            // eslint-disable-next-line no-extra-parens
            projectRelativePageIDSuffix: (nodeViews?.DIALOG || nodeViews?.SINGLE) ? '' : '1:0:1'
        }
    });

    const createContext = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => {
        let store = new Vuex.Store({ modules: {
            pagebuilder: pagebuilderConfig,
            'pagebuilder/dialog': dialogConfig
        } });
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

        it('renders view executable when nodeView is not executed', () => {
            let localContext = createContext({
                nodeViews: {
                    SINGLE: {
                        ...mockNodeViewConfig,
                        nodeInfo: {
                            displayPossible: true,
                            nodeState: 'idle'
                        }
                    },
                    DIALOG: mockNodeDialogConfig
                }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: { viewConfig: { nodeID: 'SINGLE' } }
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(true);
            expect(wrapper.find(ViewExecutable).exists()).toBe(true);
            expect(wrapper.find(NotDisplayable).exists()).toBe(false);
            expect(wrapper.find(UIExtension).exists()).toBe(false);
        });

        it('renders view executable when model settings are dirty', () => {
            let localContext = createContext({
                nodeViews: { SINGLE: mockNodeViewConfig, DIALOG: mockNodeDialogConfig }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: { viewConfig: { nodeID: 'SINGLE' } }
            });
            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(false);
            expect(wrapper.find(ViewExecutable).exists()).toBe(false);
            expect(wrapper.find(NotDisplayable).exists()).toBe(false);
            expect(wrapper.find(UIExtension).exists()).toBe(true);

            wrapper.vm.$store.dispatch('pagebuilder/dialog/dirtySettings', true);

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(true);
            expect(wrapper.find(ViewExecutable).exists()).toBe(true);
            expect(wrapper.find(NotDisplayable).exists()).toBe(false);
            expect(wrapper.find(UIExtension).exists()).toBe(false);
        });

        it('always renders the node dialog', () => {
            let localContext = createContext({
                nodeViews: { DIALOG: mockNodeDialogConfig }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                propsData: getUIExtDialogProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(false);
            expect(wrapper.find(ViewExecutable).exists()).toBe(false);
            expect(wrapper.find(NotDisplayable).exists()).toBe(false);
            expect(wrapper.find(UIExtension).exists()).toBe(true);
        });

        it('renders notDisplayable component for UI-Extensions when in configured state on Webportal', () => {
            let expectedNodeInfo = {
                nodeState: 'configured'
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
            expect(wrapper.vm.viewDisplayable).toBe(false);
            expect(wrapper.find(NotDisplayable).exists()).toBe(true);
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
