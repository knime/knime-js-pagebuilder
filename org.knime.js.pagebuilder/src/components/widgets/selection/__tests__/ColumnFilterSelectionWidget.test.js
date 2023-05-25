import { expect, describe, beforeEach, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ColumnFilterWidget from '@/components/widgets/selection/ColumnFilterSelectionWidget.vue';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist.vue';

describe('ColumnFilterSelectionWidget.vue', () => {
    let props;

    beforeEach(() => {
        props = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/knime/knime_twinlist_1_0_0.js',
                    '/org/knime/js/base/dialog/selection/multiple/CheckBoxesMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/ListMultipleSelections.js',
                    '/org/knime/js/base/dialog/selection/multiple/TwinlistMultipleSelections.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/filter/column/columnFilterWidget.js'
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
                    nodeName: 'Column Filter Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.filter.column.ColumnFilterNodeRepresentation',
                    label: 'Crazy Columns (Limit 5)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.filter.column.ColumnFilterNodeValue',
                        columns: [
                            'StringCol',
                            'StringListCol',
                            'StringSetCol',
                            'IntCol',
                            'IntListCol',
                            'IntSetCol'
                        ]
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.filter.column.ColumnFilterNodeValue',
                        columns: [
                            'StringCol',
                            'StringListCol',
                            'StringSetCol',
                            'IntCol'
                        ]
                    },
                    possibleColumns: [
                        'StringCol',
                        'StringListCol',
                        'StringSetCol',
                        'IntCol'
                    ],
                    type: 'Twinlist',
                    limitNumberVisOptions: true,
                    numberVisOptions: 5
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.filter.column.ColumnFilterNodeValue',
                    columns: [
                        'StringCol',
                        'StringListCol',
                        'StringSetCol',
                        'IntCol',
                        'IntListCol'
                    ]
                },
                customCSS: '',
                namespace: 'knimeColumnFilterWidget'
            },
            nodeId: '3:0:9',
            isValid: false,
            leftLabel: 'Left Label',
            rightLabel: 'Right Label'
        };
    });

    it('renders', () => {
        let wrapper = mount(ColumnFilterWidget, {
            props
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findComponent(Twinlist).exists()).toBe(true);
    });

    it('sets default size to 0', () => {
        props.isValid = true;
        props.nodeConfig.viewRepresentation.limitNumberVisOptions = false;
        let wrapper = mount(ColumnFilterWidget, {
            props
        });

        let comp = wrapper.findComponent(Twinlist);
        expect(comp.props('size')).toBe(0);
    });

    it('honors size setting', () => {
        props.isValid = true;
        props.nodeConfig.viewRepresentation.limitNumberVisOptions = true;
        props.nodeConfig.viewRepresentation.numberVisOptions = 8;
        let wrapper = mount(ColumnFilterWidget, {
            props
        });

        let rb = wrapper.findComponent(Twinlist);
        expect(rb.props('size')).toBe(8);
    });

    it('sends @updateWidget if child emits @input', () => {
        let wrapper = mount(ColumnFilterWidget, {
            props
        });

        const testValue = ['VALUE1', 'VALUE2'];
        const comp = wrapper.findComponent(Twinlist);
        comp.vm.$emit('update:modelValue', testValue);

        expect(wrapper.emitted('updateWidget')).toBeTruthy();
        expect(wrapper.emitted('updateWidget')[0][0]).toStrictEqual({
            nodeId: props.nodeId,
            type: 'columns',
            value: testValue
        });
    });

    describe('validation', () => {
        it('is always valid if not required', () => {
            props.nodeConfig.viewRepresentation.required = false;
            props.nodeConfig.viewRepresentation.currentValue.value = [];
            props.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = mount(ColumnFilterWidget, {
                props
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            props.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(ColumnFilterWidget, {
                props,
                global: {
                    stubs: {
                        Twinlist: {
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
            let wrapper = mount(ColumnFilterWidget, {
                props,
                global: {
                    stubs: {
                        Twinlist: {
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

