/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';

import MultiSelectWidget from '@/components/widgets/input/MultiSelectWidget';
import Checkboxes from '~/webapps-common/ui/components/forms/Checkboxes';
import MultiselectListBox from '~/webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from '~/webapps-common/ui/components/forms/Twinlist';


describe('MultiSelectWidget.vue', () => {
    let propsDataTwinlist, propsDataCheckboxHorizontal, propsDataCheckboxVertical, propsDataMultiselectListBox;

    beforeEach(() => {
        propsDataTwinlist = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'Multiple Selection Widget',
                    nodeState: 'executed',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/knime/knime_twinlist_1_0_0.js',
                    '/org/knime/js/base/dialog/selection/multiple/CheckBoxesMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/ListMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/TwinlistMultipleSelections.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/multiple/multipleSelectionWidget.js'
                ],
                getViewValueMethodName: 'value',
                namespace: 'knimeMultipleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation',
                    label: 'Label',
                    description: 'Some Text...',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'TwinList 3',
                            'TwinList 5'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'TwinList 3',
                            'TwinList 5'
                        ]
                    },
                    possibleChoices: [
                        'TwinList 1',
                        'TwinList 2',
                        'TwinList 3',
                        'TwinList 4',
                        'TwinList 5',
                        'TwinList 6',
                        'TwinList 7'
                    ],
                    type: 'Twinlist',
                    limitNumberVisOptions: true,
                    numberVisOptions: 4
                },
                viewValue: null,
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage'
            },
            nodeId: '5:0:6',
            isValid: false
        };
        propsDataMultiselectListBox = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'Multiple Selection Widget',
                    nodeState: 'executed',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/knime/knime_twinlist_1_0_0.js',
                    '/org/knime/js/base/dialog/selection/multiple/CheckBoxesMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/ListMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/TwinlistMultipleSelections.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/multiple/multipleSelectionWidget.js'
                ],
                getViewValueMethodName: 'value',
                namespace: 'knimeMultipleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation',
                    label: 'Label List',
                    description: 'Desc List',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'List 3',
                            'List 4',
                            'List 7'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'List 3',
                            'List 4',
                            'List 7'
                        ]
                    },
                    possibleChoices: [
                        'List 1',
                        'List 2',
                        'List 3',
                        'List 4',
                        'List 5',
                        'List 6',
                        'List 7',
                        'List 8'
                    ],
                    type: 'List',
                    limitNumberVisOptions: true,
                    numberVisOptions: 5
                },
                viewValue: null,
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage'
            },
            nodeId: '5:0:8',
            isValid: false
        };
        propsDataCheckboxVertical = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'Multiple Selection Widget',
                    nodeState: 'executed',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/knime/knime_twinlist_1_0_0.js',
                    '/org/knime/js/base/dialog/selection/multiple/CheckBoxesMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/ListMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/TwinlistMultipleSelections.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/multiple/multipleSelectionWidget.js'
                ],
                getViewValueMethodName: 'value',
                namespace: 'knimeMultipleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation',
                    label: 'Label Checkbox Vertical',
                    description: 'Enter Description CHV',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'CBV 2',
                            'CBV 4',
                            'CBV 6'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'CBV 2',
                            'CBV 4',
                            'CBV 6'
                        ]
                    },
                    possibleChoices: [
                        'CBV 1',
                        'CBV 2',
                        'CBV 3',
                        'CBV 4',
                        'CBV 5',
                        'CBV 6'
                    ],
                    type: 'Check boxes (vertical)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: null,
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage'
            },
            nodeId: '5:0:7',
            isValid: false
        };
        propsDataCheckboxHorizontal = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeName: 'Multiple Selection Widget',
                    nodeState: 'executed',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/knime/knime_twinlist_1_0_0.js',
                    '/org/knime/js/base/dialog/selection/multiple/CheckBoxesMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/ListMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/TwinlistMultipleSelections.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/selection/multiple/multipleSelectionWidget.js'
                ],
                getViewValueMethodName: 'value',
                namespace: 'knimeMultipleSelectionWidget',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation',
                    label: 'Label Checkbox Horiziontal',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'CBH 1',
                            'CBH 4'
                        ]
                    },
                    currentValue: {
                        '@class':
                            'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                        value: [
                            'CBH 1',
                            'CBH 4'
                        ]
                    },
                    possibleChoices: [
                        'CBH 1',
                        'CBH 2',
                        'CBH 3',
                        'CBH 4',
                        'CBH 5',
                        'CBH 6',
                        'CBH 7'
                    ],
                    type: 'Check boxes (horizontal)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10
                },
                viewValue: null,
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage'
            },
            nodeId: '5:0:9',
            isValid: false
        };

    });

    it('renders', () => {
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataTwinlist
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();

        let wrapper2 = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });
        expect(wrapper2.html()).toBeTruthy();
        expect(wrapper2.isVisible()).toBeTruthy();

        let wrapper3 = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxVertical
        });
        expect(wrapper3.html()).toBeTruthy();
        expect(wrapper3.isVisible()).toBeTruthy();

        let wrapper4 = shallowMount(MultiSelectWidget, {
            propsData: propsDataMultiselectListBox
        });
        expect(wrapper4.html()).toBeTruthy();
        expect(wrapper4.isVisible()).toBeTruthy();
    });

    it('renders checkboxes horizontal', () => {
        propsDataCheckboxHorizontal.isValid = true;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });

        let rb = wrapper.find(Checkboxes);
        expect(rb).toBeTruthy();
        expect(rb.props('alignment')).toBe('horizontal');
    });

    it('renders checkboxes vertical', () => {
        propsDataCheckboxVertical.isValid = true;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxVertical
        });

        let rb = wrapper.find(Checkboxes);
        expect(rb).toBeTruthy();
        expect(rb.props('alignment')).toBe('vertical');
    });

    it('renders multiselect list box component', () => {
        propsDataMultiselectListBox.isValid = true;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataMultiselectListBox
        });

        let rb = wrapper.find(MultiselectListBox);
        expect(rb).toBeTruthy();
    });

    it('renders twinlist component', () => {
        propsDataTwinlist.isValid = true;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataTwinlist
        });

        let rb = wrapper.find(Twinlist);
        expect(rb).toBeTruthy();
    });

    it('has no error message when valid', () => {
        propsDataCheckboxHorizontal.isValid = true;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });

        expect(wrapper.vm.errorMessage).toBe(null);
    });

    it('has default error message', () => {
        propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });

        expect(wrapper.vm.errorMessage).toBe('Current selected item is invalid');
    });

    it('has warning message', () => {
        propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
        propsDataCheckboxHorizontal.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
        propsDataCheckboxHorizontal.nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
        let wrapper = shallowMount(MultiSelectWidget, {
            propsData: propsDataCheckboxHorizontal
        });

        expect(wrapper.vm.errorMessage).toBe('Testing error message');
    });
});
