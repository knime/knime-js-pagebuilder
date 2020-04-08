/* eslint-disable no-magic-numbers */
import { shallowMount, mount } from '@vue/test-utils';

import StringWidget from '@/components/widgets/input/StringWidget';
import InputField from '~/webapps-common/ui/components/forms/InputField';
import TextArea from '~/webapps-common/ui/components/forms/TextArea';

describe('StringWidget.vue', () => {
    let propsDataInput, propsDateTextArea;

    beforeEach(() => {
        propsDataInput = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                namespace: 'knimeStringWidget',
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
                    '@class': 'org.knime.js.base.node.base.input.string.StringNodeRepresentation',
                    label: 'This is the Label (single line)',
                    description: 'This is the description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.string.StringNodeValue',
                        string: 'This is the default value'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.string.StringNodeValue',
                        string: 'This is the default value'
                    },
                    regex: '',
                    editorType: 'Single-line',
                    multilineEditorWidth: 60,
                    multilineEditorHeight: 5,
                    errorMessage: 'This is the Validation Error Message'
                },
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'String Widget',
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
                    '/org/knime/js/base/node/widget/input/string/stringWidget.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '7:0:10',
            isValid: false
        };

        propsDateTextArea = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                namespace: 'knimeStringWidget',
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
                    '@class': 'org.knime.js.base.node.base.input.string.StringNodeRepresentation',
                    label: 'This is the Label (multiline half size)',
                    description: 'This is the description. width: 30, height: 2.',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.string.StringNodeValue',
                        string: 'This is the default value'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.string.StringNodeValue',
                        string: 'This is the default value'
                    },
                    regex: '',
                    editorType: 'Multi-line',
                    multilineEditorWidth: 30,
                    multilineEditorHeight: 2,
                    errorMessage: 'This is the Validation Error Message'
                },
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'String Widget',
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
                    '/org/knime/js/base/node/widget/input/string/stringWidget.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '7:0:16',
            isValid: false
        };
    });

    describe('input field', () => {
        it('renders', () => {
            let wrapper = shallowMount(StringWidget, {
                propsData: propsDataInput
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find(InputField)).toBeTruthy();
        });

        it('emits @updateWidget if child emits @input', () => {
            let wrapper = shallowMount(StringWidget, {
                propsData: propsDataInput
            });
    
            const testValue = 'VALUE';
            const input = wrapper.find(InputField);
            input.vm.$emit('input', testValue);
    
            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataInput.nodeId,
                type: 'string',
                value: testValue
            });
        });

        it('will be invalid if widget is', () => {
            let widget = mount(StringWidget, {
                propsData: { ...propsDataInput, isValid: true }
            });

            let textComponent = widget.find(InputField);
            expect(textComponent.props('isValid')).toBe(true);
            widget.setProps({ isValid: false });
            expect(textComponent.props('isValid')).toBe(false);
        });

        it('will return invalid when the value is required but missing', () => {
            let wrapper = mount(StringWidget, {
                propsData: propsDataInput
            });
            wrapper.find(InputField).setProps({ value: '' });
            expect(wrapper.vm.validate()).toBeFalsy();
            wrapper.find(InputField).setProps({ value: 'a' });
            expect(wrapper.vm.validate()).toBeTruthy();
        });

        it('defaults regex to null', () => {
            let wrapper = mount(StringWidget, {
                propsData: propsDataInput
            });
            expect(wrapper.find(InputField).props('pattern')).toEqual(null);
        });

        it('passes correct regex', () => {
            let wrapper = mount(StringWidget, {
                propsData: { ...propsDataInput,
                    nodeConfig: {
                        ...propsDataInput.nodeConfig,
                        viewRepresentation: { ...propsDataInput.nodeConfig.viewRepresentation,
                            regex: 'test' }
                    } }
            });
            expect(wrapper.find(InputField).props('pattern')).toEqual('test');
        });
    });

    describe('text area', () => {
        it('renders', () => {
            let wrapper = shallowMount(StringWidget, {
                propsData: propsDateTextArea
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find(TextArea)).toBeTruthy();
        });

        it('emits @updateWidget if child emits @input', () => {
            let wrapper = shallowMount(StringWidget, {
                propsData: propsDataInput
            });
    
            const testValue = 'VALUE';
            const input = wrapper.find(InputField);
            input.vm.$emit('input', testValue);
    
            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataInput.nodeId,
                type: 'string',
                value: testValue
            });
        });

        it('will be invalid if widget is', () => {
            let widget = mount(StringWidget, {
                propsData: { ...propsDateTextArea, isValid: true }
            });

            let textComponent = widget.find(TextArea);
            expect(textComponent.props('isValid')).toBe(true);
            widget.setProps({ isValid: false });
            expect(textComponent.props('isValid')).toBe(false);
        });

        it('will return invalid when the value is required but missing', () => {
            let wrapper = mount(StringWidget, {
                propsData: propsDateTextArea
            });
            wrapper.find(TextArea).setProps({ value: '' });
            expect(wrapper.vm.validate()).toBeFalsy();
            wrapper.find(TextArea).setProps({ value: 'a' });
            expect(wrapper.vm.validate()).toBeTruthy();
        });
    });

    it('has validate logic to validate non-required values', () => {
        propsDataInput.nodeConfig.viewRepresentation.required = false;
        let wrapper = mount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.validate()).toBe(true);
        wrapper.find(InputField).setProps({ value: '' });
        expect(wrapper.vm.validate()).toBe(true);
    });

    it('has no error message when valid', () => {
        propsDataInput.isValid = true;
        let wrapper = shallowMount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.errorMessage).toBe(null);
    });

    it('has error message when valid', () => {
        let wrapper = shallowMount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.errorMessage).toBe(propsDataInput.nodeConfig.viewRepresentation.errorMessage);
    });

    it('has default error message', () => {
        propsDataInput.nodeConfig.viewRepresentation.errorMessage = false;
        let wrapper = shallowMount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.errorMessage).toBe('Current string input value is invalid');
    });

    it('has warning message', () => {
        propsDataInput.nodeConfig.viewRepresentation.errorMessage = false;
        propsDataInput.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        propsDataInput.nodeConfig.viewRepresentation.errorMessage = false;
        propsDataInput.nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
        let wrapper = shallowMount(StringWidget, {
            propsData: propsDataInput
        });

        expect(wrapper.vm.errorMessage).toBe('Testing error message');
    });
});
