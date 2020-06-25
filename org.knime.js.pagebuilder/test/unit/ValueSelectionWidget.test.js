/* eslint-disable max-lines */
import { shallowMount, mount } from '@vue/test-utils';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';

import ValueSelectionWidget from '@/components/widgets/selection/ValueSelectionWidget';

describe('ValueSelectionWidget.vue', () => {
    let propsDataRadioHorizontal,
        propsDataRadioVertical,
        propsDataDropdown,
        propsDataList,
        propsDataColumnLockedList;

    beforeEach(() => {
        propsDataColumnLockedList = {
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
                    '/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js'
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
                    nodeName: 'Value Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation',
                    label: 'Value Selection (List) Column Locked',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    columnType: 'All',
                    lockColumn: true,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    type: 'List',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership'
                    ]
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                    column: 'Cluster Membership',
                    value: 'Cluster_0'
                },
                customCSS: '',
                namespace: 'knimeValueSelectionWidget'
            },
            nodeId: '3:0:9',
            isValid: false
        };

        propsDataRadioHorizontal = {
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
                    '/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js'
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
                    nodeName: 'Value Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation',
                    label: 'Value Selection (Radio Horiz.) Column Locked',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    columnType: 'All',
                    lockColumn: true,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    type: 'Radio buttons (horizontal)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership'
                    ]
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                    column: 'Cluster Membership',
                    value: 'Cluster_0'
                },
                customCSS: '',
                namespace: 'knimeValueSelectionWidget'
            },
            nodeId: '4:0:7',
            isValid: false
        };

        propsDataRadioVertical = {
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
                    '/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js'
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
                    nodeName: 'Value Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation',
                    label: 'Value Selection (Radio Vert.)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    columnType: 'All',
                    lockColumn: false,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    type: 'Radio buttons (vertical)',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership'
                    ]
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                    column: 'Cluster Membership',
                    value: 'Cluster_0'
                },
                customCSS: '',
                namespace: 'knimeValueSelectionWidget'
            },
            nodeId: '4:0:6',
            isValid: false
        };

        propsDataDropdown = {
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
                    '/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js'
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
                    nodeName: 'Value Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation',
                    label: 'Value Selection Crazy Columns (Dropdown)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'LongStringColumnNameLongStringColumnNameLongStringColumnNameLongStringColumnNameLong',
                        value: 'semicolon;semicolon'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'LongStringColumnNameLongStringColumnNameLongStringColumnNameLongStringColumnNameLong',
                        value: 'semicolon;semicolon'
                    },
                    columnType: 'All',
                    lockColumn: false,
                    possibleValues: {
                        BooleanCol: [
                            'true',
                            'false'
                        ],
                        LongStringColumnNameLongStringColumnNameLongStringColumnNameLongStringColumnNameLong: [
                            'semicolon;semicolon',
                            'backslash\\bakslash',
                            'quotes"quotes',
                            'carriage return \r carriage return',
                            'new line \n new line',
                            'carriage return and new line \r\n carriage return and new line',
                            'tab\ttab',
                            'comma,comma',
                            'single quote\'single quote'
                        ],
                        StringCol: [
                            'semicolon;semicolon',
                            'backslash\\bakslash',
                            'quotes"quotes',
                            'carriage return \r carriage return',
                            'new line \n new line',
                            'carriage return and new line \r\n carriage return and new line',
                            'tab\ttab',
                            'comma,comma',
                            'single quote\'single quote',
                            '    ',
                            ''
                        ],
                        TimestampCol: [
                            '2020-03-21T15:31:19.130',
                            '1970-01-01T00:00:00.0',
                            '1600-01-31T23:00:00.0',
                            '0001-01-31T23:00:00.0',
                            '0007-11-22T01:59:15.385',
                            '1323-07-03T12:26:50.129',
                            '1638-11-05T18:39:11.34',
                            '2044-03-13T00:59:14.756',
                            '0396-05-12T21:57:42.548',
                            '2488-07-04T06:21:27.74',
                            '1106-06-14T23:02:44.54',
                            '2464-05-01T07:20:55.743',
                            '2330-04-05T09:22:14.289',
                            '2415-07-15T07:18:07.747',
                            '0643-07-22T00:19:56.227',
                            '2277-01-20T13:12:09.600',
                            '0210-05-11T12:53:40.640',
                            '0303-11-08T16:36:21.245',
                            '1303-10-31T00:42:02.947',
                            '1107-10-11T13:59:08.496',
                            '1540-11-13T00:13:19.996',
                            '2894-08-07T23:43:06.852',
                            '1752-09-19T18:06:40.444',
                            '1542-10-16T03:49:53.554',
                            '0040-09-30T00:08:29.428',
                            '1495-01-02T01:13:11.812',
                            '2563-10-02T01:13:31.162',
                            '2137-03-15T09:02:47.813',
                            '0255-03-03T23:35:33.488',
                            '0502-09-20T02:17:49.868',
                            '0795-11-30T11:00:22.515',
                            '2254-07-18T02:55:13.378',
                            '2344-01-02T11:17:36.820',
                            '0598-12-08T10:15:55.261',
                            '2423-03-16T20:06:39.371',
                            '1399-08-17T10:44:21.997',
                            '0506-12-07T23:34:56.167',
                            '1355-01-01T00:45:24.705',
                            '2943-08-31T19:43:51.300',
                            '1128-02-06T18:59:07.940',
                            '2266-05-31T11:28:55.947',
                            '0871-01-12T07:47:36.579'
                        ],
                        UriCol: [
                            'URI: http://cepetakagtksslf; EXT: ',
                            'URI: https://C:/tmkjqmplmrdvyqt.csv; EXT: csv'
                        ]
                    },
                    type: 'Dropdown',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'BooleanCol',
                        'LongStringColumnNameLongStringColumnNameLongStringColumnNameLongStringColumnNameLong',
                        'StringCol',
                        'TimestampCol',
                        'UriCol'
                    ]
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                    column: 'LongStringColumnNameLongStringColumnNameLongStringColumnNameLongStringColumnNameLong',
                    value: 'semicolon;semicolon'
                },
                customCSS: '',
                namespace: 'knimeValueSelectionWidget'
            },
            nodeId: '4:0:10',
            isValid: false
        };

        propsDataList = {
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
                    '/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js'
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
                    nodeName: 'Value Selection Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation',
                    label: 'Value Selection (List)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                        column: 'Cluster Membership',
                        value: 'Cluster_0'
                    },
                    columnType: 'All',
                    lockColumn: false,
                    possibleValues: {
                        'Cluster Membership': [
                            'Cluster_0',
                            'Cluster_1',
                            'Cluster_2',
                            'Cluster_3'
                        ]
                    },
                    type: 'List',
                    limitNumberVisOptions: false,
                    numberVisOptions: 10,
                    possibleColumns: [
                        'Cluster Membership'
                    ]
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue',
                    column: 'Cluster Membership',
                    value: 'Cluster_0'
                },
                customCSS: '',
                namespace: 'knimeValueSelectionWidget'
            },
            nodeId: '4:0:9',
            isValid: false
        };
    });

    describe('render', () => {
        it('renders as radio buttons horizontal', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as radio buttons vertical', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataRadioVertical
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as list', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as dropdown', () => {
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.findAll(Dropdown).length).toBe(2);
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as list with column locked', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataColumnLockedList
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });
    });

    it('sends @updateWidget if SingleSelect emits @input', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataRadioVertical
        });

        const testValue = 'VALUE';
        const lb = wrapper.find({ ref: 'form' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataRadioVertical.nodeId,
            type: 'value',
            value: testValue
        });
    });

    it('sends @updateWidget if column emits @input', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataRadioVertical
        });

        const testValue = 'MYCOL';
        const lb = wrapper.find({ ref: 'column' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataRadioVertical.nodeId,
            type: 'column',
            value: testValue
        });
    });

    it('has size set', () => {
        propsDataList.isValid = true;
        propsDataList.nodeConfig.viewRepresentation.limitNumberVisOptions = true;
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataList
        });
        let size = propsDataList.nodeConfig.viewRepresentation.numberVisOptions;
        expect(wrapper.find({ ref: 'form' }).props('numberVisOptions')).toBe(size);
    });

    it('does not render duplicate entries', () => {
        propsDataDropdown.nodeConfig.viewRepresentation.possibleColumns = ['1', '2', '3', '3', '3', '4'];

        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataDropdown
        });
        // duplicate column entry will not be shown twice
        // eslint-disable-next-line no-magic-numbers
        expect(wrapper.vm.possibleColumns.length).toBe(4);
    });

    it('passes isValid to component', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: {
                ...propsDataList,
                isValid: false
            }
        });
        expect(wrapper.find({ ref: 'form' }).props('isValid')).toBe(false);
    });

    describe('validation', () => {
        it('is always valid if not required', () => {
            propsDataList.nodeConfig.viewRepresentation.required = false;
            propsDataList.nodeConfig.viewRepresentation.currentValue.value = [];
            propsDataList.nodeConfig.viewRepresentation.defaultValue.value = [];
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('invalidates with unlocked column and invalid column selected', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.required = true;
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = false;
            propsDataDropdown.nodeConfig.viewRepresentation.currentValue.column = 'INVALID';
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });
            // invalid column should not display any possible or selected values
            expect(wrapper.vm.value).toStrictEqual('');
            expect(wrapper.vm.possibleValueList).toStrictEqual([]);
            // it should return the correct invalid response for validation
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Selected column is invalid.' });
        });

        it('is invalid if required and no selection was made', () => {
            propsDataList.nodeConfig.viewRepresentation.required = true;
            propsDataList.nodeConfig.viewRepresentation.lockColumn = true;
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataList
            });
            wrapper.setProps({ valuePair: {
                value: '',
                column: 'Cluster Membership'
            } });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: false, errorMessage: 'Selection is required.' });
        });

        it('is valid if required and a selection was made', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = true;
            propsDataDropdown.valuePair = { value: 'URI: http://cepetakagtksslf; EXT: ', column: 'UriCol' };
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: true, errorMessage: null });
        });

        it('handles child validation', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.required = true;
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = true;
            propsDataDropdown.valuePair = { value: 'URI: http://cepetakagtksslf; EXT: ', column: 'UriCol' };
            let childResponse = { isValid: false, errorMessage: 'test Error Message' };
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown,
                stubs: {
                    SingleSelect: {
                        template: '<div />',
                        methods: {
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
                .toStrictEqual({ isValid: false, errorMessage: 'Selection is invalid or missing.' });
        });
    });
});
