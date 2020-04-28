/* eslint-disable max-lines */
import { shallowMount, mount } from '@vue/test-utils';

import BaseSingleSelectionWidget from '@/components/widgets/BaseSingleSelectionWidget';
import RadioButtons from '~/webapps-common/ui/components/forms/RadioButtons';
import ListBox from '~/webapps-common/ui/components/forms/ListBox';
import Dropdown from '~/webapps-common/ui/components/forms/Dropdown';

describe('BaseSingleSelectionWidget.vue', () => {
    let propsDataRadioHorizontal, propsDataRadioVertical, propsDataDropdown, propsDataList,
        propsDataColumnSelectionList;

    beforeEach(() => {
        propsDataColumnSelectionList = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/ListSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/column/columnSelectionWidget.js'
                ],
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Column Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: 'Auto-guessing default column.',
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeRepresentation',
                    label: 'Column Selection Crazy Columns (List)',
                    description: 'Column Selection Widget',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue',
                        column: null
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue',
                        column: null
                    },
                    possibleColumns: [
                        'StringCol',
                        'StringListCol',
                        'StringSetCol',
                        'IntCol',
                        'IntListCol',
                        'IntSetCol',
                        'LongCol',
                        'LongListCol',
                        'LongSetCol',
                        'DoubleCol',
                        'DoubleListCol',
                        'DoubleSetCol',
                        'TimestampCol',
                        'TimestampListCol',
                        'TimestampSetCol',
                        'BooleanCol',
                        'BooleanListCol',
                        'BooleanSetCol',
                        'UriCol',
                        'UriListCol',
                        'UriSetCol',
                        'MissingValStringCol',
                        'MissingValStringListCol',
                        'MissingValStringSetCol',
                        'Local Date',
                        'Local Time',
                        'Local Date Time',
                        'Zoned Date Time',
                        'Period',
                        'Duration'
                    ],
                    type: 'List',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue',
                    column: null
                },
                customCSS: '',
                namespace: 'knimeColumnSelectionWidget'
            },
            nodeId: '3:0:9',
            isValid: false,
            // configure base single selection for column selection
            dataTypeKey: 'column',
            possibleChoicesKey: 'possibleColumns',
            valueIsArray: false
        };

        propsDataRadioHorizontal = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'Single Selection Widget',
                    nodeAnnotation: '',
                    nodeState: 'executed'
                },
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/ListSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/single/singleSelectionWidget.js'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                namespace: 'knimeSingleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                        'SingleMultipleSelectionNodeRepresentation',
                    label: 'Radio Hor',
                    description: 'Enter Description\t\t',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'O3'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'O3'
                        ]
                    },
                    possibleChoices: [
                        'O1 ',
                        'Option 2',
                        'O3'
                    ],
                    type: 'Radio buttons (horizontal)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: null,
                customCSS: ''
            },
            nodeId: '4:0:7',
            isValid: false
        };

        propsDataRadioVertical = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'Single Selection Widget',
                    nodeAnnotation: '',
                    nodeState: 'executed'
                },
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/ListSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/single/singleSelectionWidget.js'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                namespace: 'knimeSingleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                        'SingleMultipleSelectionNodeRepresentation',
                    label: 'Radio Vertical',
                    description: 'Enter Description\t\t',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'O3'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'O3'
                        ]
                    },
                    possibleChoices: [
                        'O1 ',
                        'Option 2',
                        'O3'
                    ],
                    type: 'Radio buttons (vertical)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: null,
                customCSS: ''
            },
            nodeId: '4:0:6',
            isValid: false
        };

        propsDataDropdown = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'Single Selection Widget',
                    nodeAnnotation: '',
                    nodeState: 'executed'
                },
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/ListSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/single/singleSelectionWidget.js'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                namespace: 'knimeSingleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.singleMultiple' +
                        '.SingleMultipleSelectionNodeRepresentation',
                    label: 'Dropdown',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.singleMultiple' +
                            '.SingleMultipleSelectionNodeValue',
                        value: [
                            'Option 2'
                        ]
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.singleMultiple' +
                            '.SingleMultipleSelectionNodeValue',
                        value: [
                            'Option 2'
                        ]
                    },
                    possibleChoices: [
                        'Option 1',
                        'Option 2',
                        'Option 3'
                    ],
                    type: 'Dropdown',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: null,
                customCSS: ''
            },
            nodeId: '4:0:10',
            isValid: false
        };

        propsDataList = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true,
                    nodeName: 'Single Selection Widget',
                    nodeAnnotation: '',
                    nodeState: 'executed'
                },
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/ListSingleSelection.js',
                    '/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/single/singleSelectionWidget.js'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                getViewValueMethodName: 'value',
                namespace: 'knimeSingleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                        'SingleMultipleSelectionNodeRepresentation',
                    label: 'List',
                    description: 'Enter Description\t',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                            'SingleMultipleSelectionNodeValue',
                        value: [
                            'List Item 3'
                        ]
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                            'SingleMultipleSelectionNodeValue',
                        value: [
                            'List Item 3'
                        ]
                    },
                    possibleChoices: [
                        'List Item 1',
                        'List Item 2',
                        'List Item 3',
                        'List Item 4',
                        'List Item 5',
                        'List Item 6',
                        'List Item 7',
                        'List Item 8',
                        'List Item 9',
                        'List Item 10',
                        'List Item 11',
                        'List Item 12',
                        'List Item 13',
                        'List Item 14',
                        'List Item 15',
                        'List Item 16'
                    ],
                    type: 'List',
                    limitNumberVisOptions: true,
                    numberVisOptions: 5
                },
                viewValue: null,
                customCSS: ''
            },
            nodeId: '4:0:9',
            isValid: false
        };
    });

    describe('radiobuttons', () => {
        it('renders horizontal', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            let rb = wrapper.find(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('horizontal');
        });

        it('fails on invalid type (alignment)', () => {
            propsDataRadioHorizontal.nodeConfig.viewRepresentation.type = 'Radio buttons (vulcano)';
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.vm.radioButtonsAlignment).toBe(null);
            expect(wrapper.find(RadioButtons).exists()).toBe(false);
        });

        it('renders vertical', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioVertical
            });

            let rb = wrapper.find(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('vertical');
        });

        it('emits @updateWidget if child emits @input', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioVertical
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(RadioButtons);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataRadioVertical.nodeId,
                type: 'value',
                value: [testValue]
            });
        });
    });

    describe('list', () => {
        it('renders', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.find(ListBox).exists()).toBe(true);
        });

        it('has size set', () => {
            propsDataList.isValid = true;
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataList
            });
            let size = propsDataList.nodeConfig.viewRepresentation.numberVisOptions;
            expect(wrapper.find(ListBox).props('size')).toBe(size);
        });

        it('defaults to 0 if no size is set', () => {
            const localThis = {
                viewRep: {
                    limitNumberVisOptions: false
                }
            };
            expect(BaseSingleSelectionWidget.computed.maxVisibleListEntries.call(localThis)).toBe(0);
        });

        it('passes isValid to component', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: {
                    ...propsDataList,
                    isValid: false
                }
            });
            expect(wrapper.find(ListBox).props('isValid')).toBe(false);
        });

        it('sends @updateWidget if child emits @input', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataList
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(ListBox);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataList.nodeId,
                type: 'value',
                value: [testValue]
            });
        });
    });

    describe('dropdown', () => {
        it('renders', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataDropdown
            });

            expect(wrapper.find(Dropdown).exists()).toBe(true);
        });

        it('passes isValid to component', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: {
                    ...propsDataDropdown,
                    isValid: false
                }
            });
            expect(wrapper.find(Dropdown).props('isValid')).toBe(false);
        });

        it('sends @updateWidget if child emits @input', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataDropdown
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(Dropdown);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataDropdown.nodeId,
                type: 'value',
                value: [testValue]
            });
        });
    });

    describe('validation', () => {
        it('is always valid if not required', () => {
            propsDataList.nodeConfig.viewRepresentation.required = false;
            propsDataList.nodeConfig.viewRepresentation.currentValue.value = [];
            propsDataList.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.vm.validate()).toBe(true);
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            propsDataList.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(BaseSingleSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.vm.validate()).toBe(false);

            // without this the sub component will never have a value in the test
            // we do not want to set it in html as this would violate the test scope
            wrapper.vm.$refs.form.$data.selectedIndex = 1;

            expect(wrapper.vm.validate()).toBe(true);
        });
    });

    describe('viewRep handling settings', () => {
        it('renders with column selection nodeConfig', () => {
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });

            expect(wrapper.find(ListBox).exists()).toBe(true);
        });
    });

    describe('error message', () => {

        it('is absent when valid', () => {
            propsDataRadioHorizontal.isValid = true;
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe(null);
        });

        it('is default if none is set', () => {
            propsDataRadioHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });
            wrapper.setData({ customValidationErrorMessage: null });
            expect(wrapper.vm.errorMessage).toBe('Selection is invalid or missing');
        });

        it('is custom required message', () => {
            propsDataRadioHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
            propsDataRadioHorizontal.nodeConfig.viewRepresentation.currentValue.value = [];
            let wrapper = mount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });
            wrapper.vm.validate();
            expect(wrapper.vm.errorMessage).toBe('Selection is required');
        });

        it('is error message if provided', () => {
            propsDataRadioHorizontal.nodeConfig.viewRepresentation.errorMessage = 'Test ERROR MSG';
            let wrapper = shallowMount(BaseSingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe('Test ERROR MSG');
        });
    });

});
