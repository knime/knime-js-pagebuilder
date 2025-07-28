import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import { NumberInput } from "@knime/components";

import NumberWidget from "@/components/widgets/NumberWidget.vue";

describe("NumberWidget.vue", () => {
  let props;

  beforeEach(() => {
    props = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        namespace: "knimeNumberWidget",
        viewValue: null,
        customCSS: "",
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
        ],
        initMethodName: "init",
        validateMethodName: "validate",
        setValidationErrorMethodName: "setValidationErrorMessage",
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation",
          label: "This is the label. ",
          description: "",
          required: true,
          defaultValue: {
            "@class": "org.knime.js.base.node.base.input.dbl.DoubleNodeValue",
            double: 0,
          },
          currentValue: {
            "@class": "org.knime.js.base.node.base.input.dbl.DoubleNodeValue",
            double: 0,
          },
          usemin: false,
          usemax: false,
          min: 0,
          max: 1,
        },
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeName: "Double Widget",
          nodeState: "executed",
          nodeWarnMessage: null,
          nodeErrorMessage: null,
          displayPossible: true,
        },
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/widget/input/double/DoubleInput.js",
        ],
        getViewValueMethodName: "value",
      },
      nodeId: "9:0:16",
      isValid: false,
      type: "double",
    };
  });

  it("renders", () => {
    let wrapper = shallowMount(NumberWidget, {
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it("calls the correct method to get the current value", () => {
    let wrapper = mount(NumberWidget, {
      props,
    });
    const input = wrapper.findComponent(NumberInput);
    expect(typeof input.vm.getParsedValue).toBe("function");
  });

  it("emits @updateWidget if child emits @input", () => {
    let wrapper = mount(NumberWidget, {
      props,
    });

    const testValue = "5";
    const input = wrapper.findComponent(NumberInput);
    input.vm.$emit("update:modelValue", testValue);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: props.nodeId,
      type: "double",
      value: testValue,
    });
  });

  it("'s children will change appearance when invalid", async () => {
    let wrapper = mount(NumberWidget, {
      props,
    });

    let numericInputComponent = wrapper.findComponent(NumberInput);

    await wrapper.setProps({ isValid: true });
    expect(numericInputComponent.props("isValid")).toBe(true);
    await wrapper.setProps({ isValid: false });
    expect(numericInputComponent.props("isValid")).toBe(false);
  });

  it("has validate logic to invalidate required values", () => {
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div/>",
            methods: {
              getParsedValue: vi.fn().mockReturnValue(NaN),
            },
          },
        },
      },
    });

    expect(wrapper.vm.validate()).toStrictEqual({
      errorMessage: "Current value is not a number.",
      isValid: false,
    });
  });

  it("takes child validation in favor of parent validation", () => {
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div />",
            methods: {
              getParsedValue: vi.fn().mockReturnValue(null),
              validate: vi
                .fn()
                .mockReturnValue({ isValid: true, errorMessage: null }),
            },
          },
        },
      },
    });
    expect(wrapper.vm.validate().isValid).toBe(true);
  });

  it("takes child error message over parent error message", () => {
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div />",
            methods: {
              getParsedValue: vi.fn().mockReturnValue(null),
              validate: vi.fn().mockReturnValue({
                isValid: false,
                errorMessage: "test Error Message",
              }),
            },
          },
        },
      },
    });
    expect(wrapper.vm.validate().isValid).toBe(false);
    expect(wrapper.vm.validate().errorMessage).toBe("test Error Message");
  });

  it("has no error message when valid", () => {
    const validValue = 3;
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div />",
            methods: {
              getParsedValue: vi.fn().mockReturnValue(validValue),
            },
          },
        },
      },
    });
    expect(wrapper.vm.validate().errorMessage).toBeNull();
  });

  it("has error message", () => {
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div />",
            methods: {
              getParsedValue: vi.fn().mockReturnValue("abc"),
            },
          },
        },
      },
    });
    expect(wrapper.vm.validate().errorMessage).toBe(
      "Current value is not a number.",
    );
  });

  it("validates min/max values", () => {
    const invalidValue = 9;
    props.nodeConfig.viewRepresentation.usemin = true;
    props.nodeConfig.viewRepresentation.min = 10;
    let wrapper = mount(NumberWidget, {
      props,
      global: {
        stubs: {
          NumberInput: {
            template: "<div />",
            methods: {
              getParsedValue: vi.fn().mockReturnValue(invalidValue),
            },
          },
        },
      },
    });
    expect(wrapper.vm.validate().errorMessage).toBe(
      "Current value is outside allowed range.",
    );
  });

  it("is disabled when disabled property is true", () => {
    let wrapper = mount(NumberWidget, {
      props: { ...props, disabled: true },
    });

    expect(wrapper.findComponent(NumberInput).props("disabled")).toBe(true);
  });
});
