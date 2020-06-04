import { shallowMount, mount } from '@vue/test-utils';

import ListBoxInputWidget from '@/components/widgets/input/ListBoxInputWidget';
import TextArea from '~/webapps-common/ui/components/forms/TextArea';

describe('ListBoxInputWidget.vue', () => {
    let propsDataEmailRegexLineSplit, propsDataCharSplit, propsDataCSVSplit;

    beforeEach(() => {

        propsDataEmailRegexLineSplit = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeRepresentation',
                    label: 'Default with Email Regex (5 default values)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'Test1\ntest2\ntest3\ntest4\ntest5'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'Test1\ntest2\ntest3\ntest4\ntest5'
                    },
                    // eslint-disable-next-line max-len
                    regex: '^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$',
                    errormessage: 'The given input \'?\' is not a valid email address',
                    separator: '\\n',
                    separateeachcharacter: false,
                    omitempty: true,
                    separatorregex: '\\n',
                    numberVisOptions: 5
                },
                viewValue: null,
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeState: 'executed',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'List Box Widget',
                    nodeAnnotation: ''
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/listbox/listBoxWidget.js'
                ],
                customCSS: '',
                namespace: 'knimeListBoxWidget'
            },
            nodeId: '2:0:14',
            isValid: false
        };

        propsDataCharSplit = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeRepresentation',
                    label: 'Split by Char (limit 5)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'ABCD\nEFG'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'ABCD\nEFG'
                    },
                    regex: '',
                    errormessage: '',
                    separator: ',',
                    separateeachcharacter: true,
                    omitempty: true,
                    separatorregex: '',
                    numberVisOptions: 5
                },
                viewValue: null,
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeState: 'executed',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'List Box Widget',
                    nodeAnnotation: ''
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/listbox/listBoxWidget.js'
                ],
                customCSS: '',
                namespace: 'knimeListBoxWidget'
            },
            nodeId: '2:0:15',
            isValid: false
        };

        propsDataCSVSplit = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeRepresentation',
                    label: 'Split by comma (limit 16)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'Test 1,Test 2,Test3'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.listbox.ListBoxNodeValue',
                        string: 'Test 1,Test 2,Test3'
                    },
                    regex: '',
                    errormessage: '',
                    separator: ',',
                    separateeachcharacter: false,
                    omitempty: false,
                    separatorregex: '',
                    numberVisOptions: 16
                },
                viewValue: null,
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeState: 'executed',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'List Box Widget',
                    nodeAnnotation: ''
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/listbox/listBoxWidget.js'
                ],
                customCSS: '',
                namespace: 'knimeListBoxWidget'
            },
            nodeId: '2:0:16',
            isValid: false
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(ListBoxInputWidget, {
            propsData: propsDataEmailRegexLineSplit
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(TextArea)).toBeTruthy();
    });

    it('emits @updateWidget if child emits @input', () => {
        let wrapper = shallowMount(ListBoxInputWidget, {
            propsData: propsDataEmailRegexLineSplit
        });

        const testValue = 'VALUE';
        const input = wrapper.find(TextArea);
        input.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataEmailRegexLineSplit.nodeId,
            type: 'string',
            value: testValue
        });
    });

    describe('split values', () => {
        it('will split values by char', () => {
            let widget = mount(ListBoxInputWidget, {
                propsData: propsDataCharSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('ABCD\nEF')
                        }
                    }
                }
            });

            expect(widget.vm.getSplitValues()).toStrictEqual(['A', 'B', 'C', 'D', '\n', 'E', 'F']);
        });

        it('will split values by comma (CSV)', () => {
            let widget = mount(ListBoxInputWidget, {
                propsData: propsDataCSVSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('Test 1,,Test 2,Test 3')
                        }
                    }
                }
            });

            expect(widget.vm.getSplitValues()).toStrictEqual(['Test 1', '', 'Test 2', 'Test 3']);
        });

        it('will omit empty', () => {
            let widget = mount(ListBoxInputWidget, {
                propsData: propsDataEmailRegexLineSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('Test 1\n\nTest 2\nTest 3')
                        }
                    }
                }
            });

            expect(widget.vm.getSplitValues()).toStrictEqual(['Test 1', 'Test 2', 'Test 3']);
        });
    });

    describe('validation and errors', () => {
        it('will be invalid if widget is', () => {
            let widget = mount(ListBoxInputWidget, {
                propsData: {
                    ...propsDataEmailRegexLineSplit,
                    isValid: true
                }
            });

            let textComponent = widget.find(TextArea);
            expect(textComponent.props('isValid')).toBe(true);
            widget.setProps({ isValid: false });
            expect(textComponent.props('isValid')).toBe(false);
        });

        it('will return invalid when the value is required but missing', () => {
            let wrapper = mount(ListBoxInputWidget, {
                propsData: propsDataEmailRegexLineSplit
            });
            wrapper.find(TextArea).setProps({ value: '' });
            expect(wrapper.vm.validate()).toStrictEqual(
                {
                    errorMessage: 'Input is required.',
                    isValid: false
                }
            );
            wrapper.find(TextArea).setProps({ value: 'ab@example.com' });
            expect(wrapper.vm.validate().isValid).toBe(true);
        });


        it('has no error message when valid', () => {
            let wrapper = shallowMount(ListBoxInputWidget, {
                propsData: propsDataEmailRegexLineSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('abc@example.com')
                        }
                    }
                }
            });

            expect(wrapper.vm.validate().errorMessage).toBe(null);
        });

        it('has validation error message when not valid', () => {
            let wrapper = shallowMount(ListBoxInputWidget, {
                propsData: propsDataEmailRegexLineSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('test@example.com\nabc')
                        }
                    }
                }
            });

            expect(wrapper.vm.validate().errorMessage).toBe(
                'Value 2 is not valid. The given input \'abc\' is not a valid email address'
            );
        });

        it('has error message', () => {
            let wrapper = shallowMount(ListBoxInputWidget, {
                propsData: propsDataEmailRegexLineSplit,
                stubs: {
                    TextArea: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue(null)
                        }
                    }
                }
            });

            expect(wrapper.vm.validate().errorMessage).toBe('Input is required.');
        });
    });
});
