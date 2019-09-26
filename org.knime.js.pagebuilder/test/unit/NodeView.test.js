import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeView from '@/components/layout/NodeView';
import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';

describe('NodeView.vue', () => {
    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', {
            webNodes: {
                id1: {
                    foo: 'bar'
                },
                id2: {
                    baz: 'qux'
                }
            }
        });

        context = {
            store,
            localVue
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(NodeView, context);
        expect(wrapper.html()).toBeTruthy();
    });

    it('respects resize classes', () => {
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

        expect(wrapper.find('div').attributes('class')).toEqual('view aspectRatio1by1');
    });

    it('respects min/max size configuration', () => {
        let viewConfig = {
            nodeID: '123',
            minWidth: 42,
            minHeight: 12,
            maxWidth: 200,
            maxHeight: 1000
        };
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig
            }
        });

        let style = wrapper.find('div').attributes('style');
        expect(style).toContain('min-width: 42px;');
        expect(style).toContain('min-height: 12px;');
        expect(style).toContain('max-width: 200px;');
        expect(style).toContain('max-height: 1000px;');
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

        expect(wrapper.find(NodeViewIFrame).props('nodeConfig')).toEqual({ foo: 'bar' });
    });

    it('detects autoHeight', () => {
        let wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    resizeMethod: 'somethingIrrelevant',
                    autoResize: false
                }
            }
        });
        expect(wrapper.find(NodeViewIFrame).props('autoHeight')).toBe(false);
        expect(wrapper.find(NodeViewIFrame).props('pollHeight')).toBe(false);

        wrapper = shallowMount(NodeView, {
            ...context,
            propsData: {
                viewConfig: {
                    resizeMethod: 'viewLowestElement',
                    autoResize: true
                }
            }
        });
        expect(wrapper.find(NodeViewIFrame).props('autoHeight')).toBe(true);
        expect(wrapper.find(NodeViewIFrame).props('pollHeight')).toBe(true);
    });


    it('renders with classes and styles', () => {
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
        expect(wrapper.attributes('class')).toEqual('view aspectRatio1by1 class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

});
