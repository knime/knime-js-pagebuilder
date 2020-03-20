/* eslint-disable no-magic-numbers */
import { mount, shallowMount } from '@vue/test-utils';

import MultiSelectWidget from '@/components/widgets/input/MultiSelectWidget';
import Checkboxes from '~/webapps-common/ui/components/forms/Checkboxes';
import MultiselectListBox from '~/webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from '~/webapps-common/ui/components/forms/Twinlist';
import Vue from 'vue';


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

    it('renders all different types', () => {
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

    describe('checkboxes', () => {
        it('render horizontal', () => {
            propsDataCheckboxHorizontal.isValid = true;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            let rb = wrapper.find(Checkboxes);
            expect(rb).toBeTruthy();
            expect(rb.props('alignment')).toBe('horizontal');
        });

        it('render vertical', () => {
            propsDataCheckboxVertical.isValid = true;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxVertical
            });

            let rb = wrapper.find(Checkboxes);
            expect(rb).toBeTruthy();
            expect(rb.props('alignment')).toBe('vertical');
        });

        it('fail on invalid type (alignment)', () => {
            propsDataCheckboxVertical.nodeConfig.viewRepresentation.type = 'Check boxes (vulcano)';
            let wrapper = mount(MultiSelectWidget, {
                propsData: propsDataCheckboxVertical
            });

            expect(wrapper.vm.checkBoxesAlignment).toBe(null);
            expect(wrapper.find(Checkboxes).exists()).toBe(false);
        });

        it('send @updateWidget if child emits @input', () => {
            let propsData = propsDataCheckboxVertical;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.find(Checkboxes);
            comp.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsData.nodeId,
                type: 'value',
                value: testValue
            });
        });

    });

    describe('multiselect', () => {
        it('renders list box component', () => {
            propsDataMultiselectListBox.isValid = true;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataMultiselectListBox
            });

            let rb = wrapper.find(MultiselectListBox);
            expect(rb).toBeTruthy();
        });

        it('sends @updateWidget if child emits @input', () => {
            let propsData = propsDataMultiselectListBox;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.find(MultiselectListBox);
            comp.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsData.nodeId,
                type: 'value',
                value: testValue
            });
        });
    });

    describe('validation', () => {
        it('is always positive if not required', () => {
            propsDataMultiselectListBox.nodeConfig.viewRepresentation.required = false;
            propsDataMultiselectListBox.nodeConfig.viewRepresentation.currentValue.value = [];
            propsDataMultiselectListBox.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataMultiselectListBox
            });

            expect(wrapper.vm.validate()).toBe(true);
        });

        it('is positive if it has a value', async () => {
            propsDataMultiselectListBox.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(MultiSelectWidget, {
                propsData: propsDataMultiselectListBox
            });
            // without this the sub component will never have a value in the test
            // we do not want to set it in html as this would violate the test scope
            wrapper.vm.$refs.form.setSelected(['test1']);
            await Vue.nextTick();

            expect(wrapper.vm.validate()).toBe(true);
        });
    });


    describe('twinlist', () => {
        it('renders component', () => {
            propsDataTwinlist.isValid = true;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataTwinlist
            });

            let rb = wrapper.find(Twinlist);
            expect(rb).toBeTruthy();
        });

        it('size defaults to 8', () => {
            propsDataTwinlist.isValid = true;
            propsDataTwinlist.nodeConfig.viewRepresentation.limitNumberVisOptions = false;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataTwinlist
            });

            let rb = wrapper.find(Twinlist);
            expect(rb.props('size')).toBe(8);
        });

        it('sends @updateWidget if child emits @input', () => {
            let propsData = propsDataTwinlist;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.find(Twinlist);
            comp.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsData.nodeId,
                type: 'value',
                value: testValue
            });
        });
    });

    describe('error message', () => {
        it('is not set when valid', () => {
            propsDataCheckboxHorizontal.isValid = true;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe(null);
        });

        it('is default if not set', () => {
            propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe('Current selected item is invalid');
        });

        it('is warning message if set', () => {
            propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
            propsDataCheckboxHorizontal.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe('Testing warning message');
        });

        it('is nodeErrorMessage if set', () => {
            propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = false;
            propsDataCheckboxHorizontal.nodeConfig.nodeInfo.nodeErrorMessage = 'Testing error message';
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe('Testing error message');
        });

        it('is errorMessage if set (viewRep)', () => {
            propsDataCheckboxHorizontal.nodeConfig.viewRepresentation.errorMessage = 'Test ERROR MSG';
            let wrapper = shallowMount(MultiSelectWidget, {
                propsData: propsDataCheckboxHorizontal
            });

            expect(wrapper.vm.errorMessage).toBe('Test ERROR MSG');
        });
    });
});
