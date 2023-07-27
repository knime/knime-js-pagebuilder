import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import ColumnSelectionWidget from "@/components/widgets/selection/ColumnSelectionWidget.vue";
import SingleSelect from "@/components/widgets/baseElements/selection/SingleSelect.vue";
import SingleSelectionWidget from "@/components/widgets/selection/SingleSelectionWidget.vue";

describe("ColumnSelectionWidget.vue", () => {
  let propsColumnSelectionList;

  beforeEach(() => {
    propsColumnSelectionList = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        initMethodName: "init",
        validateMethodName: "validate",
        setValidationErrorMethodName: "setValidationErrorMessage",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js",
          "/org/knime/js/base/dialog/selection/single/ListSingleSelection.js",
          "/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/widget/selection/column/columnSelectionWidget.js",
        ],
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
        ],
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Column Selection Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: "Auto-guessing default column.",
          displayPossible: true,
        },
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.base.selection.column.ColumnSelectionNodeRepresentation",
          label: "Column Selection Crazy Columns (List)",
          description: "Column Selection Widget",
          required: true,
          defaultValue: {
            "@class":
              "org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue",
            column: null,
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue",
            column: null,
          },
          possibleColumns: [
            "StringCol",
            "StringListCol",
            "StringSetCol",
            "IntCol",
            "IntListCol",
            "IntSetCol",
            "LongCol",
            "LongListCol",
            "LongSetCol",
            "DoubleCol",
            "DoubleListCol",
            "DoubleSetCol",
            "TimestampCol",
            "TimestampListCol",
            "TimestampSetCol",
            "BooleanCol",
            "BooleanListCol",
            "BooleanSetCol",
            "UriCol",
            "UriListCol",
            "UriSetCol",
            "MissingValStringCol",
            "MissingValStringListCol",
            "MissingValStringSetCol",
            "Local Date",
            "Local Time",
            "Local Date Time",
            "Zoned Date Time",
            "Period",
            "Duration",
          ],
          type: "List",
          limitNumberVisOptions: false,
          numberVisOptions: 10,
        },
        viewValue: {
          "@class":
            "org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue",
          column: null,
        },
        customCSS: "",
        namespace: "knimeColumnSelectionWidget",
      },
      nodeId: "3:0:9",
      isValid: false,
      // configure base single selection for column selection
      dataTypeKey: "column",
      possibleChoicesKey: "possibleColumns",
      valueIsArray: false,
    };
  });

  it("renders", () => {
    let wrapper = mount(SingleSelectionWidget, {
      props: propsColumnSelectionList,
    });

    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.findComponent(SingleSelect).exists()).toBeTruthy();
  });

  it("emits @updateWidget if child emits @input", () => {
    let wrapper = mount(ColumnSelectionWidget, {
      props: propsColumnSelectionList,
    });

    const testValue = "VALUE";
    const lb = wrapper.findComponent({ ref: "form" });
    lb.vm.$emit("update:modelValue", testValue);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: propsColumnSelectionList.nodeId,
      type: "column",
      value: testValue,
    });
  });

  it("has size set", () => {
    propsColumnSelectionList.isValid = true;
    let wrapper = mount(ColumnSelectionWidget, {
      props: propsColumnSelectionList,
    });
    let size =
      propsColumnSelectionList.nodeConfig.viewRepresentation.numberVisOptions;
    expect(wrapper.findComponent(SingleSelect).props("numberVisOptions")).toBe(
      size,
    );
  });

  describe("validation", () => {
    it("is valid if not required and no selection made", () => {
      propsColumnSelectionList.nodeConfig.viewRepresentation.required = false;
      let wrapper = mount(ColumnSelectionWidget, {
        props: {
          ...propsColumnSelectionList,
          valuePair: {
            value: [],
          },
        },
      });

      expect(wrapper.vm.validate().isValid).toBe(true);
    });

    it("is invalid/valid if required and no selection/a selection was made", () => {
      propsColumnSelectionList.nodeConfig.viewRepresentation.required = true;
      let wrapper = mount(ColumnSelectionWidget, {
        props: propsColumnSelectionList,
        global: {
          stubs: {
            SingleSelect: {
              template: "<div />",
              methods: {
                hasSelection: vi
                  .fn()
                  .mockReturnValueOnce(false)
                  .mockReturnValueOnce(true),
              },
            },
          },
        },
      });

      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage: "Selection is required.",
      });
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: true,
        errorMessage: null,
      });
    });

    it("handles child validation", () => {
      let childResponse = {
        isValid: false,
        errorMessage: "test Error Message",
      };
      let wrapper = mount(ColumnSelectionWidget, {
        props: propsColumnSelectionList,
        global: {
          stubs: {
            SingleSelect: {
              template: "<div />",
              methods: {
                hasSelection: vi.fn().mockReturnValue(true),
                validate: vi
                  .fn()
                  .mockReturnValueOnce(childResponse)
                  .mockReturnValueOnce({ isValid: false }),
              },
            },
          },
        },
      });
      // child message
      expect(wrapper.vm.validate()).toStrictEqual(childResponse);
      // default message
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage: "Current column is invalid.",
      });
    });
  });
});
