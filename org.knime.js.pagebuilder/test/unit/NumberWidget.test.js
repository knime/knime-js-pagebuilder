import { shallowMount, mount } from '@vue/test-utils';

import NumberWidget from '@/components/widgets/baseElements/input/NumberWidget';
import NumberInput from '~/webapps-common/ui/components/forms/NumberInput';

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

    it('\'s children will change appearance when invalid', () => {
        let wrapper = mount(NumberWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        expect(numericInputComponent.find('input').classes()).toContain('invalid');
        numericInputComponent.setProps({ isValid: true });
        expect(numericInputComponent.find('input').classes()).not.toContain('invalid');
        numericInputComponent.setProps({ isValid: false });
        expect(numericInputComponent.find('input').classes()).toContain('invalid');
    });

    it('has validate logic to invalidate required values', () => {
        let wrapper = mount(NumberWidget, {
            propsData
        });

        wrapper.find(NumberInput).setProps({ value: null });

        expect(wrapper.vm.validate()).toBe(false);
    });

    it('has validate logic to validate non-required values', () => {
        propsData.nodeConfig.viewRepresentation.required = false;
        let wrapper = mount(NumberWidget, {
            propsData
        });

        expect(wrapper.vm.validate()).toBe(true);
    });

    it('has no error message when valid', () => {
        propsData.isValid = true;
        let wrapper = shallowMount(NumberWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe(null);
    });

    it('has default error message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        let wrapper = shallowMount(NumberWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Current input value is invalid');
    });

    it('has warning message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        propsData.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(NumberWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        propsData.nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
        let wrapper = shallowMount(NumberWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing error message');
    });
});
