import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView';
import NodeViewIFrame from '@/components/layout/NodeViewIFrame';
import NotAvailable from '@/components/layout/NotAvailable';

import * as storeConfig from '~/store/pagebuilder';

describe('NodeView.vue', () => {
    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: {
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
            }
        });

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

    // temporarily disable widget detection for preview build
    /* ( it('can detect widgets', () => {
        let viewConfig = {
            nodeID: 'id2'
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        expect(wrapper.vm.isWidget).toBeTruthy();
    }); */

    it('can detect non-widgets', () => {
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
