import { expect, describe, beforeEach, it, vi } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';

import MultipleSelectionWidget from '@/components/widgets/selection/MultipleSelectionWidget.vue';
import Multiselect from '@/components/widgets/baseElements/selection/Multiselect.vue';

describe('MultipleSelectionWidget.vue', () => {
    let propsTwinlist, propsCheckboxHorizontal, propsCheckboxVertical, propsMultiselectListBox;

    beforeEach(() => {
        propsTwinlist = {
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
        propsMultiselectListBox = {
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
        propsCheckboxVertical = {
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
        propsCheckboxHorizontal = {
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

    it('renders all different types', () => {
        let wrapper = shallowMount(MultipleSelectionWidget, {
            props: propsTwinlist
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();

        let wrapper2 = shallowMount(MultipleSelectionWidget, {
            props: propsCheckboxHorizontal
        });
        expect(wrapper2.html()).toBeTruthy();
        expect(wrapper2.isVisible()).toBeTruthy();

        let wrapper3 = shallowMount(MultipleSelectionWidget, {
            props: propsCheckboxVertical
        });
        expect(wrapper3.html()).toBeTruthy();
        expect(wrapper3.isVisible()).toBeTruthy();

        let wrapper4 = shallowMount(MultipleSelectionWidget, {
            props: propsMultiselectListBox
        });
        expect(wrapper4.html()).toBeTruthy();
        expect(wrapper4.isVisible()).toBeTruthy();
    });

    it('sends @updateWidget if Multiselect emits @input', () => {
        let props = propsMultiselectListBox;
        let wrapper = mount(MultipleSelectionWidget, {
            props
        });

        const testValue = ['VALUE1', 'VALUE2'];
        const comp = wrapper.findComponent(Multiselect);
        comp.vm.$emit('update:modelValue', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: props.nodeId,
            type: 'value',
            value: testValue
        });
    });

    describe('validation', () => {
        it('is valid if not required and no selection made', () => {
            propsMultiselectListBox.nodeConfig.viewRepresentation.required = false;
            let wrapper = mount(MultipleSelectionWidget, {
                props: {
                    ...propsMultiselectListBox,
                    valuePair: {
                        value: []
                    }
                }
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            propsMultiselectListBox.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(MultipleSelectionWidget, {
                props: propsMultiselectListBox,
                global: {
                    stubs: {
                        Multiselect: {
                            template: '<div />',
                            methods: {
                                hasSelection: vi.fn().mockReturnValueOnce(false)
                                    .mockReturnValueOnce(true)
                            }
                        }
                    }
                }
            });

            expect(wrapper.vm.validate()).toStrictEqual({ isValid: false, errorMessage: 'Selection is required.' });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: true, errorMessage: null });
        });

        it('handles child validation', () => {
            let childResponse = { isValid: false, errorMessage: 'test Error Message' };
            let wrapper = mount(MultipleSelectionWidget, {
                props: propsMultiselectListBox,
                global: {
                    stubs: {
                        Multiselect: {
                            template: '<div />',
                            methods: {
                                hasSelection: vi.fn().mockReturnValue(true),
                                validate: vi.fn().mockReturnValueOnce(childResponse)
                                    .mockReturnValueOnce({ isValid: false })
                            }
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
