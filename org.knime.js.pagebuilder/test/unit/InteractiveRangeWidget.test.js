import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';

import * as interactiveConfig from '~/store/interactivity';

import InteractiveRangeWidget from '@/components/widgets/interactive/InteractiveRangeWidget';
import SliderWidget from '@/components/widgets/input/SliderWidget';

describe('InteractiveRangeWidget.vue', () => {
    let propsData, localVue, store, context;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                initMethodName: 'init',
                validateMethodName: 'validate',
                nodeInfo: {},
                javascriptLibraries: [],
                stylesheets: [],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                namespace: 'knimeQuickformFilterSlider',
                viewRepresentation: {
                    '@class':
                    'org.knime.js.base.node.quickform.filter.definition.rangeslider.RangeSliderFilterRepresentation',
                    label: '2nd',
                    disabled: false,
                    tableId: '359ffa64-a233-4f2e-bf2a-c264a4048573',
                    columnName: 'Universe_1_1',
                    filterId: '5052b399-1bf5-405a-8e7e-b2175a1382b6',
                    sliderSettings: {
                        '@class': 'org.knime.js.core.settings.slider.SliderSettings',
                        behaviour: 'drag-tap',
                        fix: [
                            false,
                            true,
                            false
                        ],
                        range: {
                            min: [
                                0
                            ],
                            max: [
                                1
                            ]
                        },
                        start: [
                            0,
                            1
                        ],
                        pips: {
                            '@class': 'org.knime.js.core.settings.slider.SliderPipsSettings',
                            density: 3,
                            format: {
                                '@class': 'org.knime.js.core.settings.numberFormat.NumberFormatSettings',
                                decimals: 2,
                                negative: '-',
                                mark: '.'
                            },
                            mode: 'range'
                        },
                        direction: 'ltr',
                        orientation: 'horizontal',
                        tooltips: [
                            {
                                decimals: 2,
                                negative: '-',
                                mark: '.'
                            },
                            {
                                decimals: 2,
                                negative: '-',
                                mark: '.'
                            }
                        ]
                    }
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.quickform.filter.definition.RangeFilterValue',
                    filter: {
                        type: 'range',
                        columns: [
                            {
                                type: 'numeric',
                                maximumInclusive: true,
                                minimumInclusive: true,
                                maximum: 1,
                                minimum: 0,
                                columnName: 'Universe_1_1'
                            }
                        ],
                        rows: null,
                        id: '5052b399-1bf5-405a-8e7e-b2175a1382b6'
                    }
                },
                customCSS: '',
                getViewValueMethodName: 'value'
            },
            nodeId: '3:0:52',
            isValid: true
        };

        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { 'pagebuilder/interactivity': interactiveConfig } });

        context = {
            store,
            localVue
        };
    });

    it('renders the SliderWidget', () => {
        let wrapper = mount(InteractiveRangeWidget, {
            ...context,
            propsData
        });
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(SliderWidget)).toBeTruthy();
    });

    it('handles range slider (2 value) widgets', () => {
        let wrapper = mount(InteractiveRangeWidget, {
            ...context,
            propsData
        });
        expect(wrapper.vm.isRangeSlider).toBe(true);
        expect(wrapper.vm.value).toStrictEqual([0, 1]);
    });
    
    it('handles single value slider widgets', () => {
        propsData.nodeConfig.viewValue.filter.columns[0].minimum = '-Infinity';
        let wrapper = mount(InteractiveRangeWidget, {
            ...context,
            propsData
        });
        expect(wrapper.vm.isRangeSlider).toBe(false);
        expect(wrapper.vm.value).toStrictEqual({
            double: 1
        });
    });

    it('modifies and propagates @updateWidget if child emits @updateWidget', () => {
        // test multivalue update
        let wrapper = shallowMount(InteractiveRangeWidget, {
            ...context,
            propsData
        });
        const NEW_MIN = .25;
        const NEW_MAX = .25;
        const testUpdate = {
            value: [NEW_MIN, NEW_MAX]
        };
        wrapper.find(SliderWidget).vm.$emit('updateWidget', testUpdate);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            callback: expect.anything(),
            nodeId: propsData.nodeId,
            update: {
                'viewValue.filter.columns.0.minimum': NEW_MIN,
                'viewValue.filter.columns.0.maximum': NEW_MAX
            }
        });
        // test single value update
        propsData.nodeConfig.viewValue.filter.columns[0].minimum = '-Infinity';
        let wrapper1 = shallowMount(InteractiveRangeWidget, {
            ...context,
            propsData
        });
        const testUpdate1 = {
            value: NEW_MAX
        };
        wrapper1.find(SliderWidget).vm.$emit('updateWidget', testUpdate1);
        expect(wrapper1.emitted().updateWidget).toBeTruthy();
        expect(wrapper1.emitted().updateWidget[0][0]).toStrictEqual({
            callback: expect.anything(),
            nodeId: propsData.nodeId,
            update: {
                'viewValue.filter.columns.0.maximum': NEW_MAX
            }
        });
    });

    it('rounds values when returning the value with the getValue method', () => {
        const originalMaximum = .9876543210123;
        const originalMinimum = .0123456789098;
        let highPrecisionNodeConfig = JSON.parse(JSON.stringify(propsData));
        highPrecisionNodeConfig.nodeConfig.viewValue.filter.columns[0].maximum = originalMaximum;
        highPrecisionNodeConfig.nodeConfig.viewValue.filter.columns[0].minimum = originalMinimum;
        let wrapper = shallowMount(InteractiveRangeWidget, {
            ...context,
            propsData: highPrecisionNodeConfig
        });
        let currentValue = wrapper.vm.getValue();
        expect(currentValue.filter.columns[0].maximum < originalMaximum).toBe(true);
        expect(currentValue.filter.columns[0].minimum > originalMinimum).toBe(true);
        // eslint-disable-next-line no-magic-numbers
        expect(currentValue.filter.columns[0].maximum).toBe(.9876543);
        // eslint-disable-next-line no-magic-numbers
        expect(currentValue.filter.columns[0].minimum).toBe(.0123457);
    });

    describe('validation', () => {
        it('is always valid get value method works', () => {
            let wrapper = shallowMount(InteractiveRangeWidget, {
                ...context,
                propsData
            });
            expect(wrapper.vm.validate().isValid).toBe(true);
            
            let wrapperBroken = shallowMount(InteractiveRangeWidget, {
                ...context,
                propsData
            });
            jest.spyOn(wrapperBroken.vm, 'getValue').mockImplementation(() => undefined); // eslint-disable-line no-undefined
            expect(wrapperBroken.vm.validate().isValid).toBe(false);
        });
    });
});
