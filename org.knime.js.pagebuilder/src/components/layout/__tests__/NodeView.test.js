import { expect, describe, beforeAll, it, vi, afterEach } from 'vitest';
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView.vue';
import WebNode from '@/components/views/WebNode.vue';
import UIExtension from '@/components/views/UIExtension.vue';
import NotDisplayable from '@/components/views/NotDisplayable.vue';
import ViewExecutable from '@/components/views/ViewExecutable.vue';
import ExecutingOverlay from '@/components/ui/ExecutingOverlay.vue';

import * as pagebuilderConfig from '@/store/pagebuilder';
import * as dialogConfig from '@/store/dialog';

describe('NodeView.vue', () => {
    let context;

    const getWebNodeProps = () => ({ viewConfig: { nodeID: '0:0:7' } });
    const getUIExtProps = () => ({ viewConfig: { nodeID: '0:0:9' } });
    const getSingleUIExtProps = () => ({ viewConfig: { nodeID: 'SINGLE' } });
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
        let store = createStore({ modules: {
            pagebuilder: pagebuilderConfig,
            'pagebuilder/dialog': dialogConfig
        } });
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

    it('renders', () => {
        let wrapper = shallowMount(NodeView, context);
        expect(wrapper.html()).toBeTruthy();
    });

    it('composes nodeIds conditionally based on the projectRelativePageIDSuffix', () => {
        let { viewConfig } = getWebNodeProps();
        let localContext = createContext({ webNodePageConfiguration: {} });

        let wrapper = shallowMount(NodeView, {
            ...localContext,
            props: getWebNodeProps()
        });

        expect(wrapper.vm.nodeId).toEqual(viewConfig.nodeID);

        localContext = createContext();

        wrapper = shallowMount(NodeView, {
            ...localContext,
            props: {
                viewConfig
            }
        });

        expect(wrapper.vm.nodeId).toEqual('1:0:1:0:0:7');
    });

    describe('conditional rendering', () => {
        it('renders views as WebNodes', () => {
            let wrapper = shallowMount(NodeView, { ...context, props: getWebNodeProps() });
            expect(wrapper.findComponent(WebNode).exists()).toBeTruthy();
            expect(wrapper.findComponent(UIExtension).exists()).toBeFalsy();
            expect(wrapper.findComponent(NotDisplayable).exists()).toBeFalsy();
        });

        it('renders views as UI extension', () => {
            let wrapper = shallowMount(NodeView, { ...context, props: getUIExtProps() });
            expect(wrapper.findComponent(UIExtension).exists()).toBeTruthy();
            expect(wrapper.findComponent(WebNode).exists()).toBeFalsy();
            expect(wrapper.findComponent(NotDisplayable).exists()).toBeFalsy();
        });

        it('checks that UI extensions in single view have the singleView class', () => {
            let localContext = createContext({
                nodeViews: { SINGLE: mockNodeViewConfig }
            });

            let wrapper = shallowMount(NodeView, { ...localContext, props: getSingleUIExtProps() });
            expect(wrapper.findComponent(UIExtension).exists()).toBeTruthy();
            expect(wrapper.findComponent(UIExtension).classes()).toContain('single-view');
        });

        it('Make sure single-view class is not set on preview', () => {
            let localContext = createContext({
                nodeViews: { VIEW: mockNodeViewConfig, DIALOG: mockNodeDialogConfig }
            });

            let wrapper = shallowMount(NodeView, { ...localContext, props: getUIExtDialogProps() });
            expect(wrapper.findComponent(UIExtension).exists()).toBeTruthy();
            expect(wrapper.findComponent(UIExtension).classes()).not.toContain('single-view');
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
                props: getWebNodeProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(false);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(true);
            expect(wrapper.findComponent(NotDisplayable).props('nodeInfo')).toEqual(expectedNodeInfo);
            expect(wrapper.findComponent(NotDisplayable).props('nodeId')).toEqual('1:0:1:0:0:7');
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
                props: { viewConfig: { nodeID: 'SINGLE' } }
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(true);
            expect(wrapper.findComponent(ViewExecutable).exists()).toBe(true);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(false);
            expect(wrapper.findComponent(UIExtension).exists()).toBe(false);
        });

        it('renders view executable when model settings are dirty', async () => {
            let localContext = createContext({
                nodeViews: { SINGLE: mockNodeViewConfig, DIALOG: mockNodeDialogConfig }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                props: { viewConfig: { nodeID: 'SINGLE' } }
            });
            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(false);
            expect(wrapper.findComponent(ViewExecutable).exists()).toBe(false);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(false);
            expect(wrapper.findComponent(UIExtension).exists()).toBe(true);

            await wrapper.vm.$store.dispatch('pagebuilder/dialog/dirtySettings', true);

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(true);
            expect(wrapper.findComponent(ViewExecutable).exists()).toBe(true);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(false);
            expect(wrapper.findComponent(UIExtension).exists()).toBe(false);
        });

        it('always renders the node dialog', () => {
            let localContext = createContext({
                nodeViews: { DIALOG: mockNodeDialogConfig }
            });
            let wrapper = shallowMount(NodeView, {
                ...localContext,
                props: getUIExtDialogProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(true);
            expect(wrapper.vm.showViewExecutable).toBe(false);
            expect(wrapper.findComponent(ViewExecutable).exists()).toBe(false);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(false);
            expect(wrapper.findComponent(UIExtension).exists()).toBe(true);
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
                props: getUIExtProps()
            });

            expect(wrapper.vm.viewAvailable).toBe(true);
            expect(wrapper.vm.viewDisplayable).toBe(false);
            expect(wrapper.findComponent(NotDisplayable).exists()).toBe(true);
        });

        it('renders nothing if no view available', () => {
            let wrapper = shallowMount(NodeView, {
                ...createContext({
                    webNodes: {},
                    nodeViews: {}
                }),
                props: getWebNodeProps()
            });
            expect(wrapper.findComponent(UIExtension).exists()).toBeFalsy();
            expect(wrapper.findComponent(WebNode).exists()).toBeFalsy();
            expect(wrapper.findComponent(NotDisplayable).exists()).toBeFalsy();
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
                props: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.findComponent(ExecutingOverlay).vm.show).toBe(true);
        });

        it('detects if the node is currently (re)executing via re-executing node ids', () => {
            let localContext = createContext();
            localContext.global.mocks.$store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            let wrapper = shallowMount(NodeView, {
                ...localContext,
                props: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.findComponent(ExecutingOverlay).vm.show).toBe(true);
        });

        it('decides when to show a spinner on executing content via updateCount', () => {
            let localContext = createContext();
            localContext.global.mocks.$store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            let wrapper = shallowMount(NodeView, {
                ...localContext,
                props: getWebNodeProps()
            });

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.findComponent(ExecutingOverlay).vm.show).toBe(true);
            expect(wrapper.vm.showSpinner).toBe(false);

            localContext.global.mocks.$store.commit('pagebuilder/setNodesReExecuting', ['1:0:1:0:0:7']);

            expect(wrapper.vm.showExecutionOverlay).toBe(true);
            expect(wrapper.findComponent(ExecutingOverlay).vm.show).toBe(true);
            expect(wrapper.vm.showSpinner).toBe(true);
        });
    });
});
