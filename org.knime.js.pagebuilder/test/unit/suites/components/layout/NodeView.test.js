import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView';
import NodeViewIFrame from '@/components/layout/NodeViewIFrame';
import NotAvailable from '@/components/layout/NotAvailable';

import * as storeConfig from '~/store/pagebuilder';

describe('NodeView.vue', () => {
    let store, localVue, context;

    const getWizardPageContent = () => ({
        webNodes: {
            id1: {
                foo: 'bar',
                viewRepresentation: {
                    '@class': 'testing.notWidget'
                },
                nodeInfo: {
                    displayPossible: true
                }
            },
            id2: {
                baz: 'qux',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
                },
                nodeInfo: {
                    displayPossible: true
                }
            }
        }
    });

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', { wizardPageContent: getWizardPageContent() });

        context = {
            store,
            localVue
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders', () => {
        let wrapper = shallowMount(NodeView, context);
        expect(wrapper.html()).toBeTruthy();
    });

    it('increments iframe key when nodeConfig updates', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    nodeID: 'id1',
                    resizeMethod: 'aspectRatio1by1'
                }
            }
        });
        expect(wrapper.vm.nodeViewIFrameKey).toBe(0);
        wrapper.setProps({
            viewConfig: {
                nodeID: 'id1',
                resizeMethod: 'aspectRatio1by1'
            }
        });
        expect(wrapper.vm.nodeViewIFrameKey).toBe(1);
    });

    it('respects resize classes', () => {
        let viewConfig = {
            nodeID: 'id1',
            resizeMethod: 'aspectRatio1by1'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.find('div').attributes('class')).toEqual('view aspectRatio1by1');
    });

    it('ignores resize classes when webnode missing', () => {
        let viewConfig = {
            nodeID: '123',
            resizeMethod: 'aspectRatio1by1'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.find('div').attributes('class')).toEqual('view');
    });

    it('passes the webNode config to the iframe', () => {
        let viewConfig = {
            nodeID: 'id1'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });
        let expectedNodeConfig = {
            foo: 'bar',
            viewRepresentation: {
                '@class': 'testing.notWidget'
            },
            nodeInfo: {
                displayPossible: true
            }
        };

        expect(wrapper.find(NodeViewIFrame).props('nodeConfig')).toEqual(expectedNodeConfig);
        expect(wrapper.find(NodeViewIFrame).props('viewConfig')).toEqual(viewConfig);
    });

    it('can detect widgets using the representation class', () => {
        let viewConfig = {
            nodeID: 'id2',
            useLegacyMode: false
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.isWidget).toBeTruthy();
    });

    it('does not detect widgets using the nodeName', () => {
        let viewConfig = {
            nodeID: 'id2',
            useLegacyMode: false
        };
        let localStore = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        localStore.commit('pagebuilder/setPage', {
            wizardPageContent: {
                webNodes: {
                    id2: {
                        baz: 'qux',
                        viewRepresentation: {
                            '@class': 'not a defined widget class'
                        },
                        nodeInfo: {
                            displayPossible: true,
                            nodeName: 'Interactive Value Filter Widget'
                        }
                    }
                }
            }
        });

        let wrapper = shallowMount(NodeView, {
            store: localStore,
            localVue,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.widgetComponentName).not.toBeDefined();
        expect(wrapper.vm.isWidget).toBeFalsy();
    });

    it('can detect non-widgets or widgets without a legacy mode flag set', () => {
        let viewConfig = {
            nodeID: 'id1'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.isWidget).toBeFalsy();
    });

    it('can detect legacy flags', () => {
        let viewConfig = {
            nodeID: 'id2',
            useLegacyMode: true
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.isWidget).toBeFalsy();
    });

    it('renders widgets in non-legacy mode when they are excluded from legacy rendering', () => {
        let viewConfig = {
            nodeID: 'id2',
            useLegacyMode: true
        };
        let localStore = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        localStore.commit('pagebuilder/setPage', {
            wizardPageContent: { webNodes: { id2: {
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewRepresentation'
                },
                nodeInfo: {
                    displayPossible: true,
                    nodeName: 'Refresh Button Widget'
                }
            } } }
        });

        let wrapper = shallowMount(NodeView, {
            store: localStore,
            localVue,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.widgetComponentName).not.toBeDefined();
        expect(wrapper.vm.legacyModeDisabled).toBeFalsy();
        expect(wrapper.vm.isWidget).toBeTruthy();
    });

    it('does not render iframe if webNode config is missing', () => {
        let viewConfig = {
            nodeID: '123'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.contains(NodeViewIFrame)).toBe(false);
    });

    it('renders with classes and styles', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    nodeID: 'id1',
                    resizeMethod: 'aspectRatio1by1',
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;']
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('view aspectRatio1by1 class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

    it('adds classes for min/max height & width', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    nodeID: 'id2',
                    useLegacyMode: false,
                    resizeMethod: 'viewLowestElement',
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;'],
                    minHeight: 100,
                    maxHeight: 200,
                    minWidth: 100,
                    maxWidth: 200
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('view class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green; max-height: 200px;' +
            ' max-width: 200px; min-height: 200px; min-width: 200px;');
    });

    it('ignores classes and styles when webnode missing', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    resizeMethod: 'aspectRatio1by1',
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;']
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('view');
        expect(wrapper.attributes('style')).not.toBeDefined();
    });

    it('renders not displayable nodes', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    nodeID: 'id1',
                    resizeMethod: 'viewLowestElement',
                    autoResize: true
                }
            }
        });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: {
                webNodes: {
                    id1: {
                        foo: 'bar',
                        viewRepresentation: {
                            '@class': 'testing.notWidget'
                        },
                        nodeInfo: {
                            displayPossible: false
                        }
                    }
                }
            }
        });
        let expectedNodeInfo = {
            displayPossible: false
        };

        expect(wrapper.find(NotAvailable).exists()).toBe(true);
        expect(wrapper.find(NotAvailable).props('nodeInfo')).toEqual(expectedNodeInfo);
        expect(wrapper.find(NotAvailable).props('nodeId')).toEqual('id1');

    });

});
