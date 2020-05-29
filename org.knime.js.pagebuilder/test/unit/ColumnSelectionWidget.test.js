import { shallowMount, mount } from '@vue/test-utils';

import ColumnSelectionWidget from '@/components/widgets/selection/ColumnSelectionWidget';
import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect';
import SingleSelectionWidget from '@/components/widgets/selection/SingleSelectionWidget';

describe('ColumnSelectionWidget.vue', () => {
    let propsDataColumnSelectionList;

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
    });

    it('renders', () => {
        let wrapper = shallowMount(SingleSelectionWidget, {
            propsData: propsDataColumnSelectionList
        });

        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(SingleSelect).exists()).toBeTruthy();
    });

    it('emits @updateWidget if child emits @input', () => {
        let wrapper = shallowMount(ColumnSelectionWidget, {
            propsData: propsDataColumnSelectionList
        });

        const testValue = 'VALUE';
        const lb = wrapper.find({ ref: 'form' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataColumnSelectionList.nodeId,
            type: 'column',
            value: testValue
        });
    });

    it('has size set', () => {
        propsDataColumnSelectionList.isValid = true;
        let wrapper = shallowMount(ColumnSelectionWidget, {
            propsData: propsDataColumnSelectionList
        });
        let size = propsDataColumnSelectionList.nodeConfig.viewRepresentation.numberVisOptions;
        expect(wrapper.find(SingleSelect).props('numberVisOptions')).toBe(size);
    });

    describe('validation', () => {
        it('is always valid if not required', () => {
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.required = false;
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.currentValue.value = [];
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = shallowMount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });

            expect(wrapper.vm.validate()).toBe(true);
        });

        it('is invalid/valid if required and no selection/a selection was made', () => {
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.required = true;
            let wrapper = mount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });

            expect(wrapper.vm.validate()).toBe(false);

            // set a valid value
            wrapper.setProps({ nodeConfig: { viewRepresentation: { currentValue: { column: 'IntCol' } } } });

            expect(wrapper.vm.validate()).toBe(true);
        });
    });

    describe('error message', () => {
        it('is absent when valid', () => {
            propsDataColumnSelectionList.isValid = true;
            let wrapper = shallowMount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });

            expect(wrapper.vm.errorMessage).toBe(null);
        });

        it('is default if none is set', () => {
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.errorMessage = false;
            let wrapper = shallowMount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });
            wrapper.setData({ customValidationErrorMessage: null });
            expect(wrapper.vm.errorMessage).toBe('Selection is invalid or missing');
        });

        it('is custom required message', () => {
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.errorMessage = false;
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.currentValue.value = [];
            let wrapper = mount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });
            wrapper.vm.validate();
            expect(wrapper.vm.errorMessage).toBe('Selection is required');
        });

        it('is error message if provided', () => {
            propsDataColumnSelectionList.nodeConfig.viewRepresentation.errorMessage = 'Test ERROR MSG';
            let wrapper = shallowMount(ColumnSelectionWidget, {
                propsData: propsDataColumnSelectionList
            });

            expect(wrapper.vm.errorMessage).toBe('Test ERROR MSG');
        });
    });

});
