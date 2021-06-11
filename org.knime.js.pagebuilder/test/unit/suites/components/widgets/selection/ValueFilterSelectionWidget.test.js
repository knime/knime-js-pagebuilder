import { mount } from '@vue/test-utils';

import ValueFilterSelectionWidget from '@/components/widgets/selection/ValueFilterSelectionWidget';
import Multiselect from '@/components/widgets/baseElements/selection/Multiselect';

describe('ValueFilterSelectionWidget.vue', () => {
    let propsData, propsDataColumnLocked;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeRepresentation',
                    label: 'Default Twinlist (Include all Values)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeValue',
                        column: 'Cluster Membership',
                        values: [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeValue',
                        column: 'Cluster Membership',
                        values: [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    lockColumn: false,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    type: 'Twinlist',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership'
                    ]
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
                    nodeName: 'Nominal Row Filter Widget',
                    nodeAnnotation: ''
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
                    '/org/knime/js/base/node/widget/filter/value/valueFilterWidget.js'
                ],
                customCSS: '',
                namespace: 'knimeValueFilterWidget'
            },
            nodeId: '3:0:52',
            isValid: false
        };
        propsDataColumnLocked = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeRepresentation',
                    label: 'Default Twinlist (Include all Values)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeValue',
                        column: 'Cluster Membership',
                        values: [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.filter.value.ValueFilterNodeValue',
                        column: 'Cluster Membership',
                        values: [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    lockColumn: true,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ],
                        'Other Membership': [
                            'Other 1',
                            'Other 2'
                        ]
                    },
                    type: 'List',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership',
                        'Other Membership'
                    ]
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
                    nodeName: 'Nominal Row Filter Widget',
                    nodeAnnotation: ''
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
                    '/org/knime/js/base/node/widget/filter/value/valueFilterWidget.js'
                ],
                customCSS: '',
                namespace: 'knimeValueFilterWidget'
            },
            nodeId: '3:0:51',
            isValid: false
        };
    });

    it('renders all different types', () => {
        let wrapper = mount(ValueFilterSelectionWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();

        let wrapperLocked = mount(ValueFilterSelectionWidget, {
            propsData: propsDataColumnLocked
        });
        expect(wrapperLocked.html()).toBeTruthy();
        expect(wrapperLocked.isVisible()).toBeTruthy();
    });

    it('sends @updateWidget if Multiselect emits @input', () => {
        let wrapper = mount(ValueFilterSelectionWidget, {
            propsData
        });

        const testValue = ['VALUE1', 'VALUE2'];
        const comp = wrapper.find(Multiselect);
        comp.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsData.nodeId,
            type: 'values',
            value: testValue
        });
    });

    it('sends @updateWidget if column emits @input', () => {
        let wrapper = mount(ValueFilterSelectionWidget, {
            propsData
        });

        const testValue = 'MYCOL';
        const lb = wrapper.find({ ref: 'column' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsData.nodeId,
            type: 'column',
            value: testValue
        });
    });

    it('does not render duplicate entries', () => {
        propsData.nodeConfig.viewRepresentation.possibleColumns = ['1', '2', '3', '3', '3', '4'];
        let wrapper = mount(ValueFilterSelectionWidget, {
            propsData
        });
        // duplicate column entry will not be shown twice
        // eslint-disable-next-line no-magic-numbers
        expect(wrapper.vm.possibleColumns.length).toBe(4);
    });

    describe('validation', () => {
        it('is valid if not required and no selection made', () => {
            propsData.nodeConfig.viewRepresentation.required = false;
            let wrapper = mount(ValueFilterSelectionWidget, {
                propsData: {
                    ...propsData,
                    valuePair: {
                        value: [],
                        column: 'Cluster Membership'
                    }
                }
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('invalidates with unlocked column and invalid column selected', () => {
            propsData.nodeConfig.viewRepresentation.required = true;
            propsData.nodeConfig.viewRepresentation.lockColumn = false;
            propsData.nodeConfig.viewRepresentation.currentValue.column = 'INVALID';
            let wrapper = mount(ValueFilterSelectionWidget, {
                propsData,
                stubs: {
                    Multiselect: {
                        template: '<div />',
                        methods: {
                            hasSelection: jest.fn().mockReturnValueOnce(true)
                        }
                    }
                }
            });
            // invalid column should not display any possible or selected values
            expect(wrapper.vm.value).toStrictEqual([]);
            expect(wrapper.vm.possibleValues).toStrictEqual([]);
            // it should return the correct invalid response for validation
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Selected column is invalid.' });
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            propsData.nodeConfig.viewRepresentation.required = true;
            propsData.nodeConfig.viewRepresentation.lockColumn = true;
            let wrapper = mount(ValueFilterSelectionWidget, {
                propsData,
                stubs: {
                    Multiselect: {
                        template: '<div />',
                        methods: {
                            hasSelection: jest.fn().mockReturnValueOnce(false)
                                .mockReturnValueOnce(true)
                        }
                    }
                }
            });
            wrapper.setProps({ valuePair: {
                value: [],
                column: 'Cluster Membership'
            } });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: false, errorMessage: 'Selection is required.' });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: true, errorMessage: null });
        });

        it('handles child validation', () => {
            propsData.nodeConfig.viewRepresentation.required = true;
            propsData.nodeConfig.viewRepresentation.lockColumn = true;
            let childResponse = { isValid: false, errorMessage: 'test Error Message' };
            let wrapper = mount(ValueFilterSelectionWidget, {
                propsData,
                stubs: {
                    Multiselect: {
                        template: '<div />',
                        methods: {
                            hasSelection: jest.fn().mockReturnValue(true),
                            validate: jest.fn().mockReturnValueOnce(childResponse)
                                .mockReturnValueOnce({ isValid: false })
                        }
                    }
                }
            });
            wrapper.setProps({ valuePair: {
                value: [],
                column: 'Cluster Membership'
            } });
            // child message
            expect(wrapper.vm.validate()).toStrictEqual(childResponse);
            // default message
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Selection is invalid or missing.' });
        });
    });
});
