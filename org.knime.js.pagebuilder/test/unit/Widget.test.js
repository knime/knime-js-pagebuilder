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
        store.commit('pagebuilder/setPage', {
            webNodes: {
                id1: {
                    foo: 'bar',
                    viewRepresentation: {
                        '@class': 'testing.notWidget'
                    },
                    viewValue: {
                        testValue: 10
                    }
                }
            }
        });

        context = {
            store,
            localVue
        };
    });

    it('has default props', () => {
        try {
            let wrapper = shallowMount(Widget, context);
        } catch (e) {
            expect(e.toString().split(':')[0] === 'TypeError').toEqual(true);
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

        let validity = wrapper.vm.isValid(wrapper.vm.nodeId);

        expect(validity).toEqual(false);
    });

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

        expect(wrapper.vm.validate()).toEqual(true);
        expect(wrapper.vm.validate(null)).toEqual(true);
        expect(wrapper.vm.validate({})).toEqual(true);
        expect(wrapper.vm.validate('test')).toEqual(true);
        expect(wrapper.vm.validate([])).toEqual(true);
        expect(wrapper.vm.validate(0)).toEqual(true);
        expect(wrapper.vm.validate(10)).toEqual(true);
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

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(10);

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                'viewValue.testValue': 11
            }
        });

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(11);
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

        expect(getProp(wrapper.vm.$store.state, 'pagebuilder.page.webNodes.id1.viewValue.testValue')).toEqual(11);

        setProp(wrapper.vm.$store.state, 'pagebuilder.page.webNodes.id1.viewValue.testValue', 10);

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewValue.testValue).toEqual(10);
    });

});
