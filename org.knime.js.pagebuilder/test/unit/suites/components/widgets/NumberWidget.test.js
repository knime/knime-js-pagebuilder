import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import NumberWidget from '@/components/widgets/NumberWidget.vue';
import NumberInput from 'webapps-common/ui/components/forms/NumberInput.vue';

describe('NumberWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                namespace: 'knimeNumberWidget',
                viewValue: null,
                customCSS: '',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation',
                    label: 'This is the label. ',
                    description: '',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeValue',
                        double: 0
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeValue',
                        double: 0
                    },
                    usemin: false,
                    usemax: false,
                    min: 0,
                    max: 1
                },
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'Double Widget',
                    nodeState: 'executed',
                    nodeWarnMessage: null,
                    nodeErrorMessage: null,
                    displayPossible: true
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/double/DoubleInput.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '9:0:16',
            isValid: false,
            type: 'double'
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(NumberWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('emits @updateWidget if child emits @input', () => {
        let wrapper = mount(NumberWidget, {
            propsData
        });

        const testValue = '5';
        const input = wrapper.find(NumberInput);
        input.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsData.nodeId,
            type: 'double',
            value: testValue
        });
    });

    it('\'s children will change appearance when invalid', () => {
        let wrapper = mount(NumberWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);

        wrapper.setProps({ isValid: true });
        expect(numericInputComponent.props('isValid')).toBe(true);
        wrapper.setProps({ isValid: false });
        expect(numericInputComponent.props('isValid')).toBe(false);
    });

    it('has validate logic to invalidate required values', () => {
        let wrapper = mount(NumberWidget, {
            propsData
        });

        wrapper.find(NumberInput).setProps({ value: null });

        expect(wrapper.vm.validate()).toStrictEqual({ errorMessage: 'Current value is not a number.', isValid: false });
    });

    it('takes child validation in favor of parent validation', () => {
        let wrapper = mount(NumberWidget, {
            propsData,
            stubs: {
                NumberInput: {
                    template: '<div />',
                    methods: {
                        getValue: vi.fn().mockReturnValue(null),
                        validate: vi.fn().mockReturnValue({ isValid: true, errorMessage: null })
                    }
                }
            }
        });
        expect(wrapper.vm.validate().isValid).toBe(true);
    });

    it('takes child error message over parent error message', () => {
        let wrapper = mount(NumberWidget, {
            propsData,
            stubs: {
                NumberInput: {
                    template: '<div />',
                    methods: {
                        getValue: vi.fn().mockReturnValue(null),
                        validate: vi.fn().mockReturnValue({ isValid: false, errorMessage: 'test Error Message' })
                    }
                }
            }
        });
        expect(wrapper.vm.validate().isValid).toBe(false);
        expect(wrapper.vm.validate().errorMessage).toBe('test Error Message');
    });


    it('has no error message when valid', () => {
        const validValue = 3;
        let wrapper = mount(NumberWidget, {
            propsData,
            stubs: {
                NumberInput: {
                    template: '<div />',
                    methods: {
                        getValue: vi.fn().mockReturnValue(validValue)
                    }
                }
            }
        });
        expect(wrapper.vm.validate().errorMessage).toBe(null);
    });

    it('has error message', () => {
        let wrapper = mount(NumberWidget, {
            propsData,
            stubs: {
                NumberInput: {
                    template: '<div />',
                    methods: {
                        getValue: vi.fn().mockReturnValue('abc')
                    }
                }
            }
        });
        expect(wrapper.vm.validate().errorMessage).toBe('Current value is not a number.');
    });

    it('validates min/max values', () => {
        const invalidValue = 9;
        propsData.nodeConfig.viewRepresentation.usemin = true;
        propsData.nodeConfig.viewRepresentation.min = 10;
        let wrapper = mount(NumberWidget, {
            propsData,
            stubs: {
                NumberInput: {
                    template: '<div />',
                    methods: {
                        getValue: vi.fn().mockReturnValue(invalidValue)
                    }
                }
            }
        });
        expect(wrapper.vm.validate().errorMessage).toBe('Current value is outside allowed range.');
    });
});
