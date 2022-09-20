/* eslint-disable max-lines */
import { mount } from '@vue/test-utils';

import DateTimeWidget from '@/components/widgets/input/DateTimeWidget';
import DateTimeInput from 'webapps-common/ui/components/forms/DateTimeInput';
import { format, differenceInCalendarDays } from 'date-fns';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

describe('DateTimeWidget.vue', () => {
    let propsDataAll, propsDataNoTimeZone, propsDataNoNowButton,
        propsUseExecTimes, propsDateNoDate, context;

    beforeEach(() => {
        context = {
            // this is required due to the bug: https://github.com/vuejs/vue-test-utils/issues/1130
            sync: false
        };

        propsDataAll = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.css'
                ],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewValue: null,
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation',
                    label: 'Default (Time) (Default lastest)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    shownowbutton: true,
                    granularity: 'show_minutes',
                    usemin: false,
                    usemax: true,
                    useminexectime: false,
                    usemaxexectime: false,
                    usedefaultexectime: false,
                    min: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    max: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    type: 'TDZ',
                    zones: ['Europe/Berlin', 'Asia/Bangkok']
                },
                customCSS: '',
                initMethodName: 'init',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/js-lib/moment/2_17/moment.min.js',
                    '/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.js'
                ],
                validateMethodName: 'validate',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Date&Time Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                namespace: 'knimeDateWidget'
            },
            nodeId: '2:0:28',
            isValid: false
        };

        propsDataAll.valuePair = propsDataAll.nodeConfig.viewRepresentation.currentValue;

        propsDateNoDate = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.css'
                ],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewValue: null,
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation',
                    label: 'Default (Time) (Execution time lastest)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    shownowbutton: true,
                    granularity: 'show_minutes',
                    usemin: false,
                    usemax: true,
                    useminexectime: false,
                    usemaxexectime: true,
                    usedefaultexectime: false,
                    min: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    max: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    type: 'LT',
                    zones: ['Europe/Berlin', 'Asia/Bangkok']
                },
                customCSS: '',
                initMethodName: 'init',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/js-lib/moment/2_17/moment.min.js',
                    '/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.js'
                ],
                validateMethodName: 'validate',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Date&Time Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                namespace: 'knimeDateWidget'
            },
            nodeId: '2:0:41',
            isValid: false
        };

        propsDateNoDate.valuePair = propsDateNoDate.nodeConfig.viewRepresentation.currentValue;

        propsUseExecTimes = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.css'
                ],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewValue: null,
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation',
                    // eslint-disable-next-line max-len
                    label: 'Default (Date) (Execution time earliest & latest)(Default must be execution time, else fails)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    shownowbutton: true,
                    granularity: 'show_minutes',
                    usemin: true,
                    usemax: true,
                    useminexectime: true,
                    usemaxexectime: true,
                    usedefaultexectime: true,
                    min: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    max: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    type: 'LD',
                    zones: ['Europe/Berlin', 'Asia/Bangkok']
                },
                customCSS: '',
                initMethodName: 'init',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/js-lib/moment/2_17/moment.min.js',
                    '/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.js'
                ],
                validateMethodName: 'validate',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Date&Time Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                namespace: 'knimeDateWidget'
            },
            nodeId: '2:0:46',
            isValid: false
        };

        propsUseExecTimes.valuePair = propsUseExecTimes.nodeConfig.viewRepresentation.currentValue;

        propsDataNoTimeZone = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.css'
                ],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewValue: null,
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation',
                    label: 'Default (Date) (Default earliest)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    shownowbutton: true,
                    granularity: 'show_minutes',
                    usemin: true,
                    usemax: false,
                    useminexectime: false,
                    usemaxexectime: false,
                    usedefaultexectime: false,
                    min: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    max: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    type: 'LD',
                    zones: ['Europe/Berlin', 'Asia/Bangkok']
                },
                customCSS: '',
                initMethodName: 'init',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/js-lib/moment/2_17/moment.min.js',
                    '/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.js'
                ],
                validateMethodName: 'validate',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Date&Time Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                namespace: 'knimeDateWidget'
            },
            nodeId: '2:0:29',
            isValid: false
        };
        propsDataNoTimeZone.valuePair = propsDataNoTimeZone.nodeConfig.viewRepresentation.currentValue;

        propsDataNoNowButton = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.css'
                ],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewValue: null,
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation',
                    label: 'Default (Date) (Default earliest)',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.date.DateNodeValue',
                        datestring: '2020-05-03T09:54:55+02:00[Europe/Rome]'
                    },
                    shownowbutton: false,
                    granularity: 'show_seconds',
                    usemin: true,
                    usemax: false,
                    useminexectime: false,
                    usemaxexectime: false,
                    usedefaultexectime: false,
                    min: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    max: '2020-05-03T09:54:55+02:00[Europe/Rome]',
                    type: 'LD',
                    zones: ['Europe/Berlin', 'Asia/Bangkok']
                },
                customCSS: '',
                initMethodName: 'init',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/js-lib/moment/2_17/moment.min.js',
                    '/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js',
                    '/org/knime/js/base/node/widget/input/date/dateWidget.js'
                ],
                validateMethodName: 'validate',
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Date&Time Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                namespace: 'knimeDateWidget'
            },
            nodeId: '2:0:29',
            isValid: false
        };
        propsDataNoTimeZone.valuePair = propsDataNoTimeZone.nodeConfig.viewRepresentation.currentValue;
    });

    describe('renders', () => {
        it('renders with all fields', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find({ ref: 'dateInput' }).isVisible()).toBeTruthy();
            // timezone
            expect(wrapper.find({ ref: 'timezone' }).isVisible()).toBeTruthy();
            // now button
            expect(wrapper.find({ ref: 'nowButton' }).isVisible()).toBeTruthy();
        });

        it('renders without timezone', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataNoTimeZone,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find({ ref: 'dateInput' }).isVisible()).toBeTruthy();
            // timezone
            expect(wrapper.find({ ref: 'timezone' }).exists()).toBeFalsy();
            // now button
            expect(wrapper.find({ ref: 'nowButton' }).isVisible()).toBeTruthy();
        });

        it('renders without timezone and now button', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataNoNowButton,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find({ ref: 'dateInput' }).isVisible()).toBeTruthy();
            // timezone
            expect(wrapper.find({ ref: 'timezone' }).exists()).toBeFalsy();
            // now button
            expect(wrapper.find({ ref: 'nowButton' }).exists()).toBeFalsy();
        });

        it('uses exec time as value, min and max', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsUseExecTimes,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();

            // check for today
            const today = new Date();
            const compareDateFormat = 'yyyy-MM-dd';
            expect(format(wrapper.vm.execTime, compareDateFormat)).toBe(format(today, compareDateFormat));
            expect(format(wrapper.vm.dateObject, compareDateFormat)).toBe(format(today, compareDateFormat));
            expect(format(wrapper.vm.minDate, compareDateFormat)).toBe(format(today, compareDateFormat));
            expect(format(wrapper.vm.maxDate, compareDateFormat)).toBe(format(today, compareDateFormat));

            // all 3 are exactly the same (this prevents milliseconds validation issues)
            expect(wrapper.vm.dateObject).toStrictEqual(wrapper.vm.minDate);
            expect(wrapper.vm.dateObject).toStrictEqual(wrapper.vm.maxDate);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0].update['viewRepresentation.currentValue'].zonestring)
                .toStrictEqual('Europe/Berlin');
        });
    });

    describe('events and actions', () => {
        it('emits @updateWidget if timezone changes', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const input = wrapper.find({ ref: 'timezone' });
            input.vm.$emit('input', 'Asia/Bangkok');

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[1][0].update['viewRepresentation.currentValue'].zonestring)
                .toStrictEqual('Asia/Bangkok');
        });

        it('now button sets date, time and timezone to current values and location', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const input = wrapper.find({ ref: 'nowButton' });
            input.vm.$emit('click');

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            const eventData = wrapper.emitted().updateWidget[1][0].update['viewRepresentation.currentValue'];

            const compareDateFormat = 'yyyy-MM-dd';
            expect(format(new Date(eventData.datestring), compareDateFormat))
                .toBe(format(new Date(), compareDateFormat));
            // eslint-disable-next-line new-cap
            expect(eventData.zonestring).toStrictEqual(Intl.DateTimeFormat().resolvedOptions().timeZone);
        });

        it('now button sets only time if date is hidden', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDateNoDate,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const input = wrapper.find({ ref: 'nowButton' });
            input.vm.$emit('click');

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            const eventData = wrapper.emitted().updateWidget[1][0].update['viewRepresentation.currentValue'];
            // time is changed
            const compareDateFormat = 'HH:mm';
            expect(format(new Date(eventData.datestring), compareDateFormat))
                .toBe(format(new Date(), compareDateFormat));
            // date if self is not changed
            expect(differenceInCalendarDays(new Date('2020-05-03'), new Date(eventData.datestring))).toBe(0);
        });

        it('emits @updateWidget if DateTimeInput emits @input', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            const testValue = '2020-10-14T13:32:45.153';
            const input = wrapper.find(DateTimeInput);
            input.vm.$emit('input', new Date(testValue));

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[1][0]).toStrictEqual({
                nodeId: propsDataAll.nodeId,
                update: {
                    'viewRepresentation.currentValue': {
                        datestring: testValue,
                        zonestring: 'Europe/Rome'
                    }
                }
            });
        });
    });

    describe('methods', () => {
        it('parses knime date and timezone strings', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const res = wrapper.vm.parseKnimeDateString('2020-10-10T13:32:45.153[Europe/Berlin]');
            expect(res.datestring).toBe('2020-10-10T13:32:45.153');
            expect(res.zonestring).toBe('Europe/Berlin');
        });

        it('parses broken knime date and timezone strings', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const res = wrapper.vm.parseKnimeDateString('2020-10-10T13:32:45.153[');
            expect(res.datestring).toBe('');
            expect(res.zonestring).toBe('');
        });

        it('formats date to expected strings', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });
            const d = new Date('2020-10-10T13:32:45.153');
            const res = wrapper.vm.formatDate(d);
            expect(res).toBe('2020-10-10T13:32:45.153');
        });
    });

    describe('validate', () => {
        it('is valid if valid data is given', () => {
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            const val = wrapper.vm.validate();
            expect(val).toStrictEqual({
                isValid: true,
                errorMessage: null
            });
        });

        it('invalidates if min bound is not kept', () => {
            propsDataAll.nodeConfig.viewRepresentation.usemin = true;
            propsDataAll.nodeConfig.viewRepresentation.min = '2020-10-10T13:32:45.153[Europe/Berlin]';
            propsDataAll.nodeConfig.viewRepresentation.usemax = false;
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            expect(wrapper.vm.validate()).toStrictEqual({
                isValid: false,
                errorMessage: '2020-05-03 09:54:55 is before minimum 2020-10-10 13:32:45'
            });
        });

        it('invalidates if max bound is not kept', () => {
            propsDataAll.nodeConfig.viewRepresentation.usemax = true;
            propsDataAll.nodeConfig.viewRepresentation.max = '2020-04-10T13:32:45.153[Europe/Berlin]';
            propsDataAll.nodeConfig.viewRepresentation.usemin = false;
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            expect(wrapper.vm.validate()).toStrictEqual({
                isValid: false,
                errorMessage: '2020-05-03 09:54:55 is after maximum 2020-04-10 13:32:45'
            });
        });

        it('show error message if provided via prop', () => {
            const testErrorMsg = 'THIS IS A TEST';
            propsDataAll.errorMessage = testErrorMsg;
            propsDataAll.isValid = false;
            let wrapper = mount(DateTimeWidget, {
                propsData: propsDataAll,
                stubs: {
                    'client-only': '<div><slot /></div>'
                },
                ...context
            });

            expect(wrapper.find(ErrorMessage).text()).toStrictEqual(testErrorMsg);
        });
    });
});
