import { expect, describe, beforeEach, beforeAll, it, vi } from "vitest";
/* eslint-disable max-lines */
import { mount } from "@vue/test-utils";

import DateTimeWidget from "@/components/widgets/input/DateTimeWidget.vue";
import { DateTimeInput } from "@knime/components/date-time-input";
import { format, differenceInCalendarDays } from "date-fns";
import ErrorMessage from "@/components/widgets/baseElements/text/ErrorMessage.vue";

describe("DateTimeWidget.vue", () => {
  let propsAll,
    propsNoTimeZone,
    propsNoNowButton,
    propsUseExecTimes,
    propsDateNoDate,
    context;

  beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  beforeEach(() => {
    context = {
      // this is required due to the bug: https://github.com/vuejs/vue-test-utils/issues/1130
      sync: false,
    };

    propsAll = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
          "/org/knime/js/base/node/widget/input/date/dateWidget.css",
        ],
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewValue: null,
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation",
          label: "Default (Time) (Default lastest)",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          shownowbutton: true,
          granularity: "show_minutes",
          usemin: false,
          usemax: true,
          useminexectime: false,
          usemaxexectime: false,
          usedefaultexectime: false,
          min: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          max: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          type: "TDZ",
          zones: ["Europe/Berlin", "Asia/Bangkok"],
        },
        customCSS: "",
        initMethodName: "init",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/js-lib/moment/2_17/moment.min.js",
          "/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js",
          "/org/knime/js/base/node/widget/input/date/dateWidget.js",
        ],
        validateMethodName: "validate",
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Date&Time Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        namespace: "knimeDateWidget",
      },
      nodeId: "2:0:28",
      isValid: false,
    };

    propsAll.valuePair = propsAll.nodeConfig.viewRepresentation.currentValue;

    propsDateNoDate = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
          "/org/knime/js/base/node/widget/input/date/dateWidget.css",
        ],
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewValue: null,
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation",
          label: "Default (Time) (Execution time lastest)",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          shownowbutton: true,
          granularity: "show_minutes",
          usemin: false,
          usemax: true,
          useminexectime: false,
          usemaxexectime: true,
          usedefaultexectime: false,
          min: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          max: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          type: "LT",
          zones: ["Europe/Berlin", "Asia/Bangkok"],
        },
        customCSS: "",
        initMethodName: "init",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/js-lib/moment/2_17/moment.min.js",
          "/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js",
          "/org/knime/js/base/node/widget/input/date/dateWidget.js",
        ],
        validateMethodName: "validate",
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Date&Time Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        namespace: "knimeDateWidget",
      },
      nodeId: "2:0:41",
      isValid: false,
    };

    propsDateNoDate.valuePair =
      propsDateNoDate.nodeConfig.viewRepresentation.currentValue;

    propsUseExecTimes = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
          "/org/knime/js/base/node/widget/input/date/dateWidget.css",
        ],
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewValue: null,
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation",
          // eslint-disable-next-line max-len
          label:
            "Default (Date) (Execution time earliest & latest)(Default must be execution time, else fails)",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          shownowbutton: true,
          granularity: "show_minutes",
          usemin: true,
          usemax: true,
          useminexectime: true,
          usemaxexectime: true,
          usedefaultexectime: true,
          min: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          max: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          type: "LD",
          zones: ["Europe/Berlin", "Asia/Bangkok"],
        },
        customCSS: "",
        initMethodName: "init",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/js-lib/moment/2_17/moment.min.js",
          "/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js",
          "/org/knime/js/base/node/widget/input/date/dateWidget.js",
        ],
        validateMethodName: "validate",
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Date&Time Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        namespace: "knimeDateWidget",
      },
      nodeId: "2:0:46",
      isValid: false,
    };

    propsUseExecTimes.valuePair =
      propsUseExecTimes.nodeConfig.viewRepresentation.currentValue;

    propsNoTimeZone = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
          "/org/knime/js/base/node/widget/input/date/dateWidget.css",
        ],
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewValue: null,
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation",
          label: "Default (Date) (Default earliest)",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          shownowbutton: true,
          granularity: "show_minutes",
          usemin: true,
          usemax: false,
          useminexectime: false,
          usemaxexectime: false,
          usedefaultexectime: false,
          min: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          max: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          type: "LD",
          zones: ["Europe/Berlin", "Asia/Bangkok"],
        },
        customCSS: "",
        initMethodName: "init",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/js-lib/moment/2_17/moment.min.js",
          "/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js",
          "/org/knime/js/base/node/widget/input/date/dateWidget.js",
        ],
        validateMethodName: "validate",
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Date&Time Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        namespace: "knimeDateWidget",
      },
      nodeId: "2:0:29",
      isValid: false,
    };
    propsNoTimeZone.valuePair =
      propsNoTimeZone.nodeConfig.viewRepresentation.currentValue;

    propsNoNowButton = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
          "/org/knime/js/base/node/widget/input/date/dateWidget.css",
        ],
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewValue: null,
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.input.date.DateWidgetNodeRepresentation",
          label: "Default (Date) (Default earliest)",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.date.DateNodeValue",
            datestring: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          },
          shownowbutton: false,
          granularity: "show_seconds",
          usemin: true,
          usemax: false,
          useminexectime: false,
          usemaxexectime: false,
          usedefaultexectime: false,
          min: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          max: "2020-05-03T09:54:55+02:00[Europe/Rome]",
          type: "LD",
          zones: ["Europe/Berlin", "Asia/Bangkok"],
        },
        customCSS: "",
        initMethodName: "init",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/js-lib/moment/2_17/moment.min.js",
          "/js-lib/moment/2_17/timezone/moment-timezone-with-data.min.js",
          "/org/knime/js/base/node/widget/input/date/dateWidget.js",
        ],
        validateMethodName: "validate",
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Date&Time Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        namespace: "knimeDateWidget",
      },
      nodeId: "2:0:29",
      isValid: false,
    };
    propsNoTimeZone.valuePair =
      propsNoTimeZone.nodeConfig.viewRepresentation.currentValue;
  });

  describe("renders", () => {
    it("renders with all fields", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(
        wrapper.findComponent({ ref: "dateInput" }).isVisible(),
      ).toBeTruthy();
      // timezone
      expect(
        wrapper.findComponent({ ref: "timezone" }).isVisible(),
      ).toBeTruthy();
      // now button
      expect(
        wrapper.findComponent({ ref: "nowButton" }).isVisible(),
      ).toBeTruthy();
    });

    it("renders without timezone", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsNoTimeZone,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(
        wrapper.findComponent({ ref: "dateInput" }).isVisible(),
      ).toBeTruthy();
      // timezone
      expect(wrapper.findComponent({ ref: "timezone" }).exists()).toBeFalsy();
      // now button
      expect(
        wrapper.findComponent({ ref: "nowButton" }).isVisible(),
      ).toBeTruthy();
    });

    it("renders without timezone and now button", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsNoNowButton,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(
        wrapper.findComponent({ ref: "dateInput" }).isVisible(),
      ).toBeTruthy();
      // timezone
      expect(wrapper.findComponent({ ref: "timezone" }).exists()).toBeFalsy();
      // now button
      expect(wrapper.findComponent({ ref: "nowButton" }).exists()).toBeFalsy();
    });

    it("uses exec time as value, min and max", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsUseExecTimes,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();

      // check for today
      const today = new Date();
      const compareDateFormat = "yyyy-MM-dd";
      expect(format(wrapper.vm.execTime, compareDateFormat)).toBe(
        format(today, compareDateFormat),
      );
      expect(format(wrapper.vm.dateObject, compareDateFormat)).toBe(
        format(today, compareDateFormat),
      );
      expect(format(wrapper.vm.minDate, compareDateFormat)).toBe(
        format(today, compareDateFormat),
      );
      expect(format(wrapper.vm.maxDate, compareDateFormat)).toBe(
        format(today, compareDateFormat),
      );

      // all 3 are exactly the same (this prevents milliseconds validation issues)
      expect(wrapper.vm.dateObject).toStrictEqual(wrapper.vm.minDate);
      expect(wrapper.vm.dateObject).toStrictEqual(wrapper.vm.maxDate);

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(
        wrapper.emitted("updateWidget")[0][0].update[
          "viewRepresentation.currentValue"
        ].zonestring,
      ).toBe("Europe/Berlin");
    });
  });

  describe("events and actions", () => {
    it("emits @updateWidget if timezone changes while keeping the local time", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      const input = wrapper.findComponent({ ref: "timezone" });
      input.vm.$emit("update:modelValue", "Asia/Bangkok");

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(
        wrapper.emitted("updateWidget")[1][0].update[
          "viewRepresentation.currentValue"
        ],
      ).toStrictEqual({
        zonestring: "Asia/Bangkok",
        datestring: "2020-05-03T09:54:55.000",
      });
    });

    it("now button sets date, time and timezone to current values and location", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      const input = wrapper.findComponent({ ref: "nowButton" });
      input.vm.$emit("click");

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      const eventData =
        wrapper.emitted("updateWidget")[1][0].update[
          "viewRepresentation.currentValue"
        ];

      const compareDateFormat = "yyyy-MM-dd";
      expect(format(new Date(eventData.datestring), compareDateFormat)).toBe(
        format(new Date(), compareDateFormat),
      );
      // eslint-disable-next-line new-cap
      expect(eventData.zonestring).toStrictEqual(
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
    });

    it("now button sets only time if date is hidden", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsDateNoDate,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      const input = wrapper.findComponent({ ref: "nowButton" });
      input.vm.$emit("click");

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      const eventData =
        wrapper.emitted("updateWidget")[1][0].update[
          "viewRepresentation.currentValue"
        ];
      // time is changed
      const compareDateFormat = "HH:mm";
      expect(format(new Date(eventData.datestring), compareDateFormat)).toBe(
        format(new Date(), compareDateFormat),
      );
      // date if self is not changed
      expect(
        differenceInCalendarDays(
          new Date("2020-05-03"),
          new Date(eventData.datestring),
        ),
      ).toBe(0);
    });

    it.each([
      {
        timezone: "UTC",
        offset: 0,
      },
      {
        timezone: "Europe/Rome",
        offset: 2,
      },
    ])(
      "emits @updateWidget if DateTimeInput emits @input",
      ({ timezone, offset }) => {
        let wrapper = mount(DateTimeWidget, {
          props: {
            ...propsAll,
            valuePair: {
              datestring: "2020-01-01T00:00:00.000",
              zonestring: timezone,
            },
          },
          stubs: {
            "client-only": "<div><slot /></div>",
          },
          ...context,
        });

        const input = wrapper.findComponent(DateTimeInput);
        const testHours = 13;
        input.vm.$emit(
          "update:modelValue",
          Date.UTC(2020, 9, 14, testHours, 32, 45, 153),
        );

        expect(wrapper.emitted("updateWidget")).toBeTruthy();
        expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
          nodeId: propsAll.nodeId,
          update: {
            "viewRepresentation.currentValue": {
              datestring: `2020-10-14T${testHours + offset}:32:45.153`,
              zonestring: timezone,
            },
          },
        });
      },
    );
  });

  describe("methods", () => {
    it.each(["+02:00", "+02", "+0200", "Z"])(
      "parses knime date and timezone strings",
      (offset) => {
        let wrapper = mount(DateTimeWidget, {
          props: propsAll,
          stubs: {
            "client-only": "<div><slot /></div>",
          },
          ...context,
        });
        const res = wrapper.vm.parseKnimeDateString(
          `2020-10-10T13:32:45.153${offset}[Europe/Rome]`,
        );
        expect(res.datestring).toBe("2020-10-10T13:32:45.153");
        expect(res.zonestring).toBe("Europe/Rome");
      },
    );

    it("parses broken knime date and timezone strings", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      const res = wrapper.vm.parseKnimeDateString(
        "2020-10-10T13:32:45.153[UTC]",
      );
      expect(res.datestring).toBe("");
      expect(res.zonestring).toBe("");
    });

    it("formats date to expected strings", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });
      const d = new Date("2020-10-10T13:32:45.153");
      const res = wrapper.vm.formatDate(d);
      expect(res).toBe("2020-10-10T13:32:45.153");
    });
  });

  describe("validate", () => {
    it("is valid if valid data is given", () => {
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });

      const val = wrapper.vm.validate();
      expect(val).toStrictEqual({
        isValid: true,
        errorMessage: null,
      });
    });

    it("invalidates if min bound is not kept", () => {
      propsAll.nodeConfig.viewRepresentation.usemin = true;
      propsAll.nodeConfig.viewRepresentation.min =
        "2020-10-10T13:32:45.153+02:00[Europe/Berlin]";
      propsAll.nodeConfig.viewRepresentation.usemax = false;
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });

      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage:
          "2020-05-03 09:54:55 is before minimum 2020-10-10 13:32:45",
      });
    });

    it("invalidates if max bound is not kept", () => {
      propsAll.nodeConfig.viewRepresentation.usemax = true;
      propsAll.nodeConfig.viewRepresentation.max =
        "2020-04-10T13:32:45.153+02:00[Europe/Berlin]";
      propsAll.nodeConfig.viewRepresentation.usemin = false;
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });

      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage:
          "2020-05-03 09:54:55 is after maximum 2020-04-10 13:32:45",
      });
    });

    it("show error message if provided via prop", () => {
      const testErrorMsg = "THIS IS A TEST";
      propsAll.errorMessage = testErrorMsg;
      propsAll.isValid = false;
      let wrapper = mount(DateTimeWidget, {
        props: propsAll,
        stubs: {
          "client-only": "<div><slot /></div>",
        },
        ...context,
      });

      expect(wrapper.findComponent(ErrorMessage).text()).toStrictEqual(
        testErrorMsg,
      );
    });
  });
});
