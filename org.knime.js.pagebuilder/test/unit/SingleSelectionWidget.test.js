import { shallowMount, mount } from '@vue/test-utils';

import SingleSelectionWidget from '@/components/widgets/selection/SingleSelectionWidget';
import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect';

describe('SingleSelectionWidget.vue', () => {
    let propsDataRadioHorizontal, propsDataRadioVertical, propsDataDropdown, propsDataList;

    beforeEach(() => {
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

    describe('render', () => {
        it('renders as radio buttons horizontal', () => {
            let wrapper = shallowMount(SingleSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as  radio buttons vertical', () => {
            let wrapper = shallowMount(SingleSelectionWidget, {
                propsData: propsDataRadioVertical
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as list', () => {
            let wrapper = shallowMount(SingleSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as dropdown', () => {
            let wrapper = shallowMount(SingleSelectionWidget, {
                propsData: propsDataDropdown
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });
    });

    it('has size set', () => {
        propsDataList.isValid = true;
        let wrapper = shallowMount(SingleSelectionWidget, {
            propsData: propsDataList
        });
        let size = propsDataList.nodeConfig.viewRepresentation.numberVisOptions;
        expect(wrapper.find(SingleSelect).props('numberVisOptions')).toBe(size);
    });


    it('passes isValid to component', () => {
        let wrapper = shallowMount(SingleSelectionWidget, {
            propsData: {
                ...propsDataDropdown,
                isValid: false
            }
        });
        expect(wrapper.find(SingleSelect).props('isValid')).toBe(false);
    });

    it('sends @updateWidget if SingleSelect emits @input', () => {
        let wrapper = shallowMount(SingleSelectionWidget, {
            propsData: propsDataDropdown
        });

        const testValue = 'VALUE';
        const lb = wrapper.find(SingleSelect);
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataDropdown.nodeId,
            type: 'value',
            value: [testValue]
        });
    });

    describe('validation', () => {
        it('is always valid if not required', () => {
            propsDataList.nodeConfig.viewRepresentation.required = false;
            propsDataList.nodeConfig.viewRepresentation.currentValue.value = [];
            propsDataList.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = shallowMount(SingleSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            propsDataList.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(SingleSelectionWidget, {
                propsData: propsDataList,
                stubs: {
                    SingleSelect: {
                        template: '<div />',
                        methods: {
                            hasSelection: jest.fn().mockReturnValueOnce(false)
                                .mockReturnValueOnce(true)
                        }
                    }
                }
            });

            expect(wrapper.vm.validate()).toStrictEqual({ isValid: false, errorMessage: 'Selection is required.' });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: true, errorMessage: null });
        });

        it('handles child validation', () => {
            let childResponse = { isValid: false, errorMessage: 'test Error Message' };
            let wrapper = mount(SingleSelectionWidget, {
                propsData: propsDataList,
                stubs: {
                    SingleSelect: {
                        template: '<div />',
                        methods: {
                            hasSelection: jest.fn().mockReturnValue(true),
                            validate: jest.fn().mockReturnValueOnce(childResponse)
                                .mockReturnValueOnce({ isValid: false })
                        }
                    }
                }
            });
            // child message
            expect(wrapper.vm.validate()).toStrictEqual(childResponse);
            // default message
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Current selection is invalid.' });
        });
    });
});
