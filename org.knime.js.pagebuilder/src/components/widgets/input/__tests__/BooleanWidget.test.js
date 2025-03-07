import { beforeEach, describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { Checkbox } from "@knime/components";

import BooleanWidget from "@/components/widgets/input/BooleanWidget.vue";

describe("BooleanWidget.vue", () => {
  let props;

  beforeEach(() => {
    props = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        viewValue: null,
        customCSS: "",
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.base.input.bool.BooleanNodeRepresentation",
          label: "This is the label (default true)",
          description: "This is the description.",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.bool.BooleanNodeValue",
            boolean: true,
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.bool.BooleanNodeValue",
            boolean: true,
          },
        },
        initMethodName: "init",
        setValidationErrorMethodName: "setValidationErrorMessage",
        validateMethodName: "validate",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeName: "Boolean Widget",
          nodeState: "executed",
          nodeAnnotation: "",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
        ],
        namespace: "knimeBooleanWidget",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/widget/input/bool/booleanWidget.js",
        ],
        getViewValueMethodName: "value",
      },
      nodeId: "15:0:19",
      isValid: true,
    };
  });

  it("renders", () => {
    let wrapper = shallowMount(BooleanWidget, {
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it("emits updateWidget events", () => {
    let mockChild = document.createElement("div");
    mockChild.setAttribute("class", "knime-boolean");
    let wrapper = shallowMount(BooleanWidget, {
      props,
      mocks: {
        $el: mockChild,
      },
    });
    expect(typeof wrapper.emitted("updateWidget")).toBe("undefined");
    wrapper.findComponent(Checkbox).vm.$emit("update:modelValue", false);
    expect(wrapper.emitted("updateWidget")).toBeTruthy();
  });

  describe("validation", () => {
    it("is valid if boolean", () => {
      props.nodeConfig.viewRepresentation.required = true;
      props.valuePair = { boolean: false };
      let wrapper = shallowMount(BooleanWidget, {
        props,
      });

      expect(wrapper.vm.validate().isValid).toBe(true);
    });

    it("is invalid if value is undefined", () => {
      props.nodeConfig.viewRepresentation.required = true;
      props.valuePair = {};
      let wrapper = shallowMount(BooleanWidget, {
        props,
      });

      expect(wrapper.vm.validate().isValid).toBe(false);
    });
  });
});
