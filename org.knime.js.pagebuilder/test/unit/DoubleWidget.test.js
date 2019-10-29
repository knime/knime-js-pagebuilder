import { shallowMount, mount } from '@vue/test-utils';

import DoubleWidget from '@/components/widgets/input/DoubleWidget.vue';
import NumberInput from '@/components/widgets/baseElements/input/NumberInput.vue';

describe('DoubleWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                namespace: 'knimeDoubleWidget',
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
                    description: 'This is the description. Now its super super super super super' +
                    ' super super super super super super super super super super super super super' +
                    ' super super super super super super super super super super super super super long.',
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
                    '/org/knime/js/base/node/widget/input/double/doubleWidget.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '9:0:16',
            isValid: false
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('has default (empty) props (expected failure)', () => {
        try {
            shallowMount(DoubleWidget);
        } catch (e) {
            expect(e.toString().split(':')[0]).toBe('TypeError');
        }
    });

    it('\'s children fail with empty props', () => {
        try {
            shallowMount(NumberInput);
        } catch (e) {
            expect(e.toString().split(':')[0]).toBe('TypeError');
        }
    });

    it('\'s children will change appearance when invalid', () => {
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        expect(numericInputComponent.vm.inputClass.indexOf('knime-input-invalid')).toBeGreaterThan(-1);
        numericInputComponent.setProps({ isValid: true });
        expect(numericInputComponent.vm.inputClass.indexOf('knime-input-invalid')).toBe(-1);
        numericInputComponent.setProps({ isValid: false });
        expect(numericInputComponent.vm.inputClass.indexOf('knime-input-invalid')).toBeGreaterThan(-1);
    });

    it('has validate logic to invalidate required values', () => {
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.validate(false)).toBe(false);
    });

    it('has validate logic to validate non-required values', () => {
        propsData.nodeConfig.viewRepresentation.required = false;
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.validate(false)).toBe(true);
    });

    it('has empty error message when valid', () => {
        propsData.isValid = true;
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('');
    });

    it('has default error message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Current double input value is invalid');
    });

    it('has warning message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        propsData.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        propsData.nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing error message');
    });
});
