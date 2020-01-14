/* eslint-disable no-magic-numbers */
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Widget from '@/components/widgets/Widget';
import { getProp, setProp } from '../../src/util/nestedProperty';

import * as storeConfig from '~/store/pagebuilder';

describe('Widget.vue', () => {
    let store, localVue, context, nodeConfig, wrapper;

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
            wizardPageContent: {
                webNodes: {
                    [nodeId]: nodeConfig
                }
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
                SliderWidget: {
                    name: 'slider-widget',
                    template: '<div />',
                    ref: 'widget',
                    methods: {
                        onChange() { return true; }, // because hasValueGetter checks for it,
                        validate() { return true; }
                    }
                }
            }
        };
        wrapper = shallowMount(Widget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId
            }
        });
    });

    it('renders', () => {
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('detects correct widget type', () => {
        expect(wrapper.vm.type).toEqual('SliderWidget');
    });

    it('publishes update to store', () => {
        const expectedValue = 10;
        const newValue = 11;

        expect(wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation
            .currentValue.testValue).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            nodeId,
            update: {
                'viewRepresentation.currentValue.testValue': newValue
            }
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation
                .currentValue.testValue
        ).toEqual(newValue);
    });

    it('test getting deep properties with util', () => {
        const expectedValue = 10;
        const newValue = 12;

        expect(
            getProp(
                wrapper.vm.$store.state,
                'pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation.currentValue.testValue'
            )
        ).toEqual(expectedValue);
        setProp(
            wrapper.vm.$store.state,
            'pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation.currentValue.testValue', newValue
        );
        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
    });

    it('retrieves value as resolvable promise', () => {
        const expectedValue = 10;
        const newValue = 42;

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            nodeId,
            update: {
                'viewRepresentation.currentValue.testValue': newValue
            }
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
        let valPromise = wrapper.vm.getValue();
        return expect(valPromise).resolves.toStrictEqual({
            nodeId,
            value: { testValue: newValue }
        });
    });

    it('rejects value promise on error', () => {
        const expectedValue = 10;

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(expectedValue);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // avoid clutter

        wrapper.vm.publishUpdate({
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

    it('registers a value getter with the store', () => {
        expect(wrapper.vm.hasValueGetter).toBe(true);
        expect(typeof wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId]).toBe('function');
        expect(wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId])
            .toBe(wrapper.vm.getValue);
    });

    // test with an output widget to ensure the store does not register a getter
    it('prevents value getter registration for incompatible types', () => {
        let nodeId2 = 'node2';
        let newWrapper = shallowMount(Widget, {
            store,
            localVue,
            propsData: {
                nodeConfig: {
                    nodeInfo: {
                        '@class': 'org.knime.js.core.JSONWebNodeInfo',
                        nodeState: 'executed',
                        nodeName: 'Text Widget'
                    },
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.output.text.TextOutputRepresentation',
                        text: 'Test String to prevent TextWidget prop validation failure'
                    }
                },
                nodeId: nodeId2
            },
            stubs: {
                TextOutput: {
                    name: 'text-output-widget',
                    template: '<div />',
                    ref: 'widget',
                    methods: {
                        validate() { return true; }
                    }
                }
            }
        });

        expect(newWrapper.vm.hasValueGetter).toBe(false);
        expect(typeof newWrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId2]).toBe('undefined');
    });
});
