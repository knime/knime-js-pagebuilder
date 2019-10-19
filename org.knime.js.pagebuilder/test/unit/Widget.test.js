import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Widget from '@/components/widgets/Widget';
import { getProp, setProp } from '../../src/util/nestedProperty';

import * as storeConfig from '@/../store/pagebuilder';

describe('Widget.vue', () => {
    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        let page = {
            webNodes: {
                id1: {
                    foo: 'bar',
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
                    },
                    viewValue: {
                        testValue: 10
                    }
                }
            }
        };
        store.commit('pagebuilder/setPage', page);
        store.commit('pagebuilder/setNodeValidity', page);
        context = {
            store,
            localVue
        };
    });

    it('has default props', () => {
        try {
            shallowMount(Widget, context);
        } catch (e) {
            expect(e.toString().split(':')[0]).toBe('TypeError');
        }
    });

    it('renders', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('detects correct widget type', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        expect(wrapper.vm.type).toEqual('SliderWidget');
    });

    it('correctly queries store for node validity', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        expect(wrapper.vm.isValid).toBe(false);

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                'viewValue.testValue': 11
            }
        });

        expect(wrapper.vm.isValid).toBe(true);
    });

    // TODO AP-12850: update Widget component level validation
    it('validates all data received', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        expect(wrapper.vm.validate()).toBe(true);
        expect(wrapper.vm.validate(null)).toBe(true);
        expect(wrapper.vm.validate({})).toBe(true);
        expect(wrapper.vm.validate('test')).toBe(true);
        expect(wrapper.vm.validate([])).toBe(true);
        expect(wrapper.vm.validate(0)).toBe(true);
        expect(wrapper.vm.validate(10)).toBe(true);
    });

    it('publishes update to store', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        // previously modified to be 11
        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(11);

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                'viewValue.testValue': 10
            }
        });

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(10);
    });

    it('test getting deep properties with util', () => {
        let nodeConfig = {
            viewRepresentation: {
                '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
            }
        };
        let nodeId = 'id1';
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        expect(getProp(wrapper.vm.$store.state, 'pagebuilder.page.webNodes.id1.viewValue.testValue')).toEqual(10);

        setProp(wrapper.vm.$store.state, 'pagebuilder.page.webNodes.id1.viewValue.testValue', 11);

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(11);
    });

});
