/* eslint-disable no-magic-numbers */
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Widget from '@/components/widgets/Widget';
import { getProp, setProp } from '../../src/util/nestedProperty';

import * as storeConfig from '~/store/pagebuilder';

describe('Widget.vue', () => {
    let store, localVue, context, nodeConfig;

    const nodeConfigBlueprint = {
        foo: 'bar',
        nodeInfo: {
            '@class': 'org.knime.js.core.JSONWebNodeInfo',
            nodeState: 'executed',
            nodeAnnotation: '',
            nodeErrorMessage: null,
            nodeWarnMessage: null,
            displayPossible: true,
            nodeName: 'Slider Widget'
        },
        viewRepresentation: {
            '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation',
            sliderSettings: {
                '@class': 'org.knime.js.core.settings.slider.SliderSettings',
                connect: [
                    false,
                    false
                ],
                tooltips: [
                    {
                        prefix: '$',
                        negative: '-',
                        thousand: ',',
                        decimals: 2,
                        postfix: '_',
                        mark: '.',
                        negativeBefore: '-'
                    }
                ],
                pips: {
                    '@class': 'org.knime.js.core.settings.slider.SliderPipsSettings',
                    format: {
                        '@class': 'org.knime.js.core.settings.numberFormat.NumberFormatSettings',
                        negative: '-',
                        decimals: 2,
                        mark: '.'
                    },
                    mode: 'positions',
                    values: [
                        0,
                        25,
                        50,
                        75,
                        100
                    ],
                    stepped: false,
                    density: 3
                },
                direction: 'ltr',
                orientation: 'vertical',
                range: {
                    min: [
                        5
                    ],
                    max: [
                        25
                    ]
                },
                start: [
                    5
                ]
            },
            useCustomMax: true,
            useCustomMin: true,
            customMax: 100,
            customMin: 0,
            defaultValue: {
                '@class': 'org.knime.js.base.node.base.input.slider.SliderNodeValue',
                double: 5
            },
            description: 'Enter Description',
            required: true,
            label: 'Testing Slider',
            currentValue: {
                testValue: 10
            }
        },
        viewValue: {
            testValue: 10
        }
    };
    let nodeId = 'id1';

    beforeEach(() => {
        nodeConfig = JSON.parse(JSON.stringify(nodeConfigBlueprint));
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        let page = {
            webNodes: {
                [nodeId]: nodeConfig
            }
        };
        store.commit('pagebuilder/setPage', page);
        context = {
            store,
            localVue,
            propsData: {
                nodeConfig
            },
            stubs: {
                SliderWidget: true
            }
        };
    });

    it('renders', () => {
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
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        expect(wrapper.vm.isValid).toBe(true);

        wrapper.vm.publishUpdate({
            isValid: false,
            nodeId,
            update: {
                'viewRepresentation.currentValue.testValue': 11
            }
        });

        expect(wrapper.vm.isValid).toBe(false);
    });

    // TODO AP-12850: update Widget component level validation
    it('validates all data received', () => {
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
        const expectedValue = 10;

        expect(wrapper.vm.validate()).toBe(true);
        expect(wrapper.vm.validate(null)).toBe(true);
        expect(wrapper.vm.validate({})).toBe(true);
        expect(wrapper.vm.validate('test')).toBe(true);
        expect(wrapper.vm.validate([])).toBe(true);
        expect(wrapper.vm.validate(0)).toBe(true);
        expect(wrapper.vm.validate(expectedValue)).toBe(true);
    });

    it('publishes update to store', () => {
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
        const expectedValue = 10;
        const newValue = 11;

        expect(wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation
            .currentValue.testValue).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                'viewRepresentation.currentValue.testValue': newValue
            }
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation
                .currentValue.testValue
        ).toEqual(newValue);
    });

    it('test getting deep properties with util', () => {
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
        const expectedValue = 10;
        const newValue = 12;

        expect(
            getProp(
                wrapper.vm.$store.state,
                'pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue'
            )
        ).toEqual(expectedValue);
        setProp(
            wrapper.vm.$store.state,
            'pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue', newValue
        );
        expect(
            wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
    });

    it('retrieves value as resolvable promise', () => {
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });

        const expectedValue = 10;
        const newValue = 42;

        expect(
            wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                'viewRepresentation.currentValue.testValue': newValue
            }
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
        let valPromise = wrapper.vm.getValue();
        return expect(valPromise).resolves.toStrictEqual({
            nodeId,
            value: { testValue: newValue }
        });
    });

    it('rejects value promise on error', () => {
        let wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
        const expectedValue = 10;

        expect(
            wrapper.vm.$store.state.pagebuilder.page.webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(expectedValue);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // avoid clutter

        wrapper.vm.publishUpdate({
            isValid: true,
            nodeId,
            update: {
                // wrong format
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation'
                }
            }
        });

        consoleSpy.mockRestore();

        let valPromise = wrapper.vm.getValue();
        return expect(valPromise).rejects.toStrictEqual(
            new Error('Value of widget could not be retrieved.')
        );
    });
});
