import { mount } from '@vue/test-utils';

import DoubleWidget from '@/components/widgets/input/DoubleWidget.vue';
import NumberInput from '@/components/widgets/baseElements/input/NumberInput.vue';

describe('NumberInput.vue', () => {
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
        let wrapper = mount(DoubleWidget, {
            propsData
        });
        expect(wrapper.find(NumberInput).html()).toBeTruthy();
        expect(wrapper.find(NumberInput).isVisible()).toBeTruthy();
    });

    it('invalidates string values', () => {
        propsData.nodeConfig.viewRepresentation.currentValue.double = 'notNumber';
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        expect(numericInputComponent.vm.validate()).toBe(false);
    });

    it('invalidates values lower than its min', () => {
        propsData.nodeConfig.viewRepresentation.currentValue.double = -1;
        propsData.nodeConfig.viewRepresentation.usemin = true;
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        expect(numericInputComponent.vm.validate()).toBe(false);
    });

    it('invalidates values higher than its max', () => {
        propsData.nodeConfig.viewRepresentation.currentValue.double = 1.6;
        propsData.nodeConfig.viewRepresentation.usemax = true;
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        expect(numericInputComponent.vm.validate()).toBe(false);
    });

    it('handles mouseup events', () => {
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        let event = {
            type: 'mouseup'
        };
        let originalValue = 0;
        const newValue = 0.1;

        expect(numericInputComponent.vm.getValue()).toBe(originalValue);

        numericInputComponent.vm.mouseEvent(event, 'increase');

        expect(numericInputComponent.vm.getValue()).toBe(newValue);
        expect(numericInputComponent.emitted().updateValue).toBeTruthy();
    });

    it('handles mousedown events', () => {
        let wrapper = mount(DoubleWidget, {
            propsData
        });

        let numericInputComponent = wrapper.find(NumberInput);
        let event = {
            type: 'mousedown'
        };
        let originalValue = 0;
        const intervalCheckTimeout = 201;
        const newValueCheckTimeout = 201;

        expect(numericInputComponent.vm.getValue()).toBe(originalValue);
        expect(numericInputComponent.vm.arrowManipulationDebouncer).toBeFalsy();
        expect(numericInputComponent.vm.arrowManipulationInterval).toBeFalsy();
        
        numericInputComponent.vm.mouseEvent(event, 'increase');
        
        expect(numericInputComponent.vm.arrowManipulationDebouncer).toBeTruthy();
        
        setTimeout(() => {
            expect(numericInputComponent.vm.arrowManipulationInterval).toBeTruthy();
        }, intervalCheckTimeout);

        setTimeout(() => {
            expect(numericInputComponent.vm.getValue()).toBeGreaterThan(originalValue);
        }, newValueCheckTimeout);
    });
});
