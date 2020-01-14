/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';

import SliderWidget from '@/components/widgets/input/SliderWidget';
import Slider from '@/components/widgets/baseElements/input/Slider';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import { addKnimeClasses } from '../../src/util/widgetUtil/slider/knimeClasses';

describe('SliderWidget.vue', () => {
    let context, nodeConfig, nodeId, isValid, wrapper;

    beforeEach(() => {
        nodeConfig = {
            '@class': 'org.knime.js.core.JSONWebNode',
            nodeInfo: {
                '@class': 'org.knime.js.core.JSONWebNodeInfo',
                nodeState: 'executed',
                nodeAnnotation: '',
                nodeErrorMessage: null,
                nodeWarnMessage: null,
                displayPossible: true,
                nodeName: 'Slider Widget'
            },
            namespace: 'knimeSliderWidget',
            validateMethodName: 'validate',
            setValidationErrorMethodName: 'setValidationErrorMessage',
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
                    '@class': 'org.knime.js.base.node.base.input.slider.SliderNodeValue',
                    double: 5
                }
            },
            initMethodName: 'init',
            getViewValueMethodName: 'value',
            javascriptLibraries: [
                '/js-lib/knime/service/knime_service_1_0_0.js',
                '/js-lib/jQuery/jquery-1.11.0.min.js',
                '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                '/js-lib/wNumb/wNumb.js',
                '/js-lib/noUiSlider/12_1_0/nouislider.min.js',
                '/org/knime/js/base/node/widget/input/slider/sliderWidget.js'
            ],
            viewValue: null,
            customCSS: '',
            stylesheets: [
                '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                '/js-lib/knime/service/knime.css',
                '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                '/org/knime/js/base/util/quickform/quickformStyles.css',
                '/js-lib/noUiSlider/12_1_0/nouislider.min.css',
                '/org/knime/js/base/node/widget/input/slider/sliderWidget.css'
            ]
        };
        nodeId = 'id1';
        isValid = true;
        wrapper = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid,
                valuePair: nodeConfig.viewRepresentation.currentValue
            }
        });
    });

    it('renders', () => {
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('has a Slider component', () => {
        expect(wrapper.find(Slider)).toBeTruthy();
    });

    it('has correct data properties', () => {
        expect(wrapper.vm.viewRep).toBe(nodeConfig.viewRepresentation);
        expect(wrapper.vm.sliderSettings).toBe(nodeConfig.viewRepresentation.sliderSettings);
    });

    it('has correct computed properties', () => {
        // tooltip format and marks and labels tested separately
        expect(wrapper.vm.label).toBe('Testing Slider');
        expect(wrapper.vm.min).toBe(5);
        expect(wrapper.vm.max).toBe(25);
        expect(wrapper.vm.value).toBe(5);
        expect(wrapper.vm.direction).toBe('ttb');
        expect(wrapper.vm.stepSize).toBe(.000001);
        expect(wrapper.vm.height).toBe(533);
        expect(wrapper.vm.tooltips).toBe('always');
        expect(wrapper.vm.connect).toBe('none');
    });

    it('uses custom max and min if present and appropriate', () => {
        expect(wrapper.vm.min).toBe(5);
        expect(wrapper.vm.max).toBe(25);

        nodeConfig.viewRepresentation['@class'] = 'org.knime.js.base.node.widget' +
            '.rangeSlider.InteractiveFilterRangeSliderDefinition';
        
        expect(wrapper.vm.min).toBe(0);
        expect(wrapper.vm.max).toBe(100);

        nodeConfig.viewRepresentation.useCustomMin = false;
        nodeConfig.viewRepresentation.useCustomMax = false;

        expect(wrapper.vm.min).toBe(5);
        expect(wrapper.vm.max).toBe(25);
    });

    it('sets height if slider is vertical', () => {
        expect(wrapper.vm.height).toBe(533);

        nodeConfig.viewRepresentation.sliderSettings.orientation = 'horizontal';

        expect(wrapper.vm.height).toBe(null);
    });

    it('creates tooltip formatting function if present', () => {
        expect(typeof wrapper.vm.tooltipFormat).toBe('function');
        expect(wrapper.vm.tooltipFormat(1.234)).toBe('$1.23_');

        nodeConfig.viewRepresentation.sliderSettings.tooltips = [];

        expect(typeof wrapper.vm.tooltipFormat).toBe('function');
        expect(wrapper.vm.tooltipFormat(1.234, {})).toBe('1.234');
    });

    // determines if the slider bar is filled, half (w/ orientation) or none
    it('correctly interprets the "none" connect configuration', () => {
        expect(wrapper.vm.connect).toBe('none');
    });

    // determines if the slider bar is filled, half (w/ orientation) or none
    it('correctly interprets the "bottom" connect configuration', () => {
        nodeConfig.viewRepresentation.sliderSettings.connect[1] = true;
        let wrapper2 = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid
            }
        });

        expect(wrapper2.vm.connect).toBe('bottom');
    });

    // determines if the slider bar is filled, half (w/ orientation) or none
    it('correctly interprets the "top" connect configuration', () => {
        nodeConfig.viewRepresentation.sliderSettings.connect[0] = true;
        let wrapper2 = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid
            }
        });

        expect(wrapper2.vm.connect).toBe('top');
    });

    // determines if the slider bar is filled, half (w/ orientation) or none
    it('correctly interprets the "both" connect configuration', () => {
        nodeConfig.viewRepresentation.sliderSettings.connect[0] = true;
        nodeConfig.viewRepresentation.sliderSettings.connect[1] = true;
        let wrapper2 = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid
            }
        });

        expect(wrapper2.vm.connect).toBe('both');
    });

    // cannot test fully without DOM, but method is failsafe
    it('trys to apply KNIME class styles to the Slider', () => {
        expect(addKnimeClasses(wrapper.vm.$el.childNodes[1].childNodes[0])).toBeUndefined();
    });

    it('correctly emits the updateWidget Payload', () => {
        wrapper.find(Slider).vm.$emit('input', 10);
        const { updateWidget } = wrapper.emitted();
        expect(updateWidget[0][0]).toBeTruthy();
        expect(updateWidget[0][0].type).toBe('double');
        expect(updateWidget[0][0].value).toBe(10);
    });

    it('has no error message when valid', () => {
        expect(wrapper.vm.errorMessage).toBe('');
    });

    it('has default error message', () => {
        let wrapper2 = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid: false
            },
            stubs: {
                form: {
                    ref: 'form',
                    name: 'slider',
                    template: '<div />',
                    methods: {
                        getValue() { return true; },
                        validate() { return true; }
                    }
                }
            }
        });

        expect(wrapper2.vm.errorMessage).toBe('Current slider value is invalid');
    });

    it('has warning message', () => {
        nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid: false
            }
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
        let wrapper2 = shallowMount(SliderWidget, {
            ...context,
            propsData: {
                nodeConfig,
                nodeId,
                isValid: false
            }
        });

        expect(wrapper2.vm.errorMessage).toBe('Testing error message');
    });

    it('only displays error message when invalid', () => {
        expect(wrapper.find(ErrorMessage).isVisible()).toBe(true);
        expect(wrapper.find(ErrorMessage).vm.error).toBe('');

        wrapper.setProps({ isValid: false });

        expect(wrapper.find(ErrorMessage).vm.error).not.toBe('');
        expect(wrapper.find(ErrorMessage).vm.error).toBe('Current slider value is invalid');
    });
});
