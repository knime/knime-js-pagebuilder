import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import { InputField, TextArea } from "@knime/components";

import StringWidget from "@/components/widgets/input/StringWidget.vue";

describe("StringWidget.vue", () => {
  let propsInput, propsDateTextArea;

  beforeEach(() => {
    propsInput = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        namespace: "knimeStringWidget",
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
            "org.knime.js.base.node.base.input.string.StringNodeRepresentation",
          label: "This is the Label (single line)",
          description: "This is the description",
          required: true,
          defaultValue: {
            "@class":
              "org.knime.js.base.node.base.input.string.StringNodeValue",
            string: "This is the default value",
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.base.input.string.StringNodeValue",
            string: "This is the default value",
          },
          regex: "",
          editorType: "Single-line",
          multilineEditorWidth: 60,
          multilineEditorHeight: 5,
          errorMessage: "This is the Validation Error Message",
        },
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeName: "String Widget",
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
          "/org/knime/js/base/node/widget/input/string/stringWidget.js",
        ],
        getViewValueMethodName: "value",
      },
      nodeId: "7:0:10",
      isValid: false,
    };

    propsDateTextArea = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        namespace: "knimeStringWidget",
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
            "org.knime.js.base.node.base.input.string.StringNodeRepresentation",
          label: "This is the Label (multiline half size)",
          description: "This is the description. width: 30, height: 2.",
          required: true,
          defaultValue: {
            "@class":
              "org.knime.js.base.node.base.input.string.StringNodeValue",
            string: "This is the default value",
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.base.input.string.StringNodeValue",
            string: "This is the default value",
          },
          regex: "",
          editorType: "Multi-line",
          multilineEditorWidth: 30,
          multilineEditorHeight: 2,
          errorMessage: "This is the Validation Error Message",
        },
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeName: "String Widget",
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
          "/org/knime/js/base/node/widget/input/string/stringWidget.js",
        ],
        getViewValueMethodName: "value",
      },
      nodeId: "7:0:16",
      isValid: false,
    };
  });

  describe("input field", () => {
    it("renders", () => {
      let wrapper = shallowMount(StringWidget, {
        props: propsInput,
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(wrapper.findComponent(InputField)).toBeTruthy();
    });

    it("emits @updateWidget if child emits @input", () => {
      let wrapper = mount(StringWidget, {
        props: propsInput,
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent(InputField);
      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsInput.nodeId,
        type: "string",
        value: testValue,
      });
    });

    it("will be invalid if widget is", async () => {
      let widget = mount(StringWidget, {
        props: { ...propsInput, isValid: true },
      });

      let textComponent = widget.findComponent(InputField);
      expect(textComponent.props("isValid")).toBe(true);
      await widget.setProps({ isValid: false });
      expect(textComponent.props("isValid")).toBe(false);
    });

    it("will return invalid when the value is required but missing", () => {
      // will only apply if no custom message is provided
      propsInput.nodeConfig.viewRepresentation.errorMessage = "";
      let wrapper = mount(StringWidget, {
        props: propsInput,
        global: {
          stubs: {
            InputField: {
              template: "<div/>",
              methods: {
                getValue: () => "",
              },
            },
          },
        },
      });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "Input is required.",
        isValid: false,
      });
    });

    it("defaults regex to null", () => {
      let wrapper = mount(StringWidget, {
        props: propsInput,
      });
      expect(wrapper.findComponent(InputField).props("pattern")).toBeNull();
    });

    it("passes correct regex", () => {
      let wrapper = mount(StringWidget, {
        props: {
          ...propsInput,
          nodeConfig: {
            ...propsInput.nodeConfig,
            viewRepresentation: {
              ...propsInput.nodeConfig.viewRepresentation,
              regex: "test",
            },
          },
        },
      });
      expect(wrapper.findComponent(InputField).props("pattern")).toBe("test");
    });
  });

  describe("text area", () => {
    it("renders", () => {
      let wrapper = shallowMount(StringWidget, {
        props: propsDateTextArea,
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(wrapper.findComponent(TextArea)).toBeTruthy();
    });

    it("emits @updateWidget if child emits @input", () => {
      let wrapper = mount(StringWidget, {
        props: propsInput,
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent(InputField);
      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsInput.nodeId,
        type: "string",
        value: testValue,
      });
    });

    it("will be invalid if widget is", async () => {
      let widget = mount(StringWidget, {
        props: { ...propsDateTextArea, isValid: true },
      });

      let textComponent = widget.findComponent(TextArea);
      expect(textComponent.props("isValid")).toBe(true);
      await widget.setProps({ isValid: false });
      expect(textComponent.props("isValid")).toBe(false);
    });

    it("will return invalid when the value is required but missing", () => {
      let wrapper = mount(StringWidget, {
        props: propsDateTextArea,
        global: {
          stubs: {
            TextArea: {
              template: "<div/>",
              methods: {
                getValue: () => "",
              },
            },
          },
        },
      });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "Input is required.",
        isValid: false,
      });
    });
  });

  it("takes child validation in favor of parent validation", () => {
    let wrapper = mount(StringWidget, {
      props: propsInput,
      global: {
        stubs: {
          InputField: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue("test_string"),
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
    propsInput.nodeConfig.viewRepresentation.errorMessage = "";
    let wrapper = mount(StringWidget, {
      props: propsInput,
      global: {
        stubs: {
          InputField: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue("test_string"),
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

  it("shows custom error Message over other messages if one is set", () => {
    propsInput.nodeConfig.viewRepresentation.errorMessage = "custom message";
    let wrapper = mount(StringWidget, {
      props: propsInput,
      global: {
        stubs: {
          InputField: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue("test_string"),
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
    expect(wrapper.vm.validate().errorMessage).toBe("custom message");
  });

  it("has no error message when valid", () => {
    let wrapper = mount(StringWidget, {
      props: propsInput,
      global: {
        stubs: {
          InputField: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue("abc"),
            },
          },
        },
      },
    });

    expect(wrapper.vm.validate().errorMessage).toBeNull();
  });

  it("has error message", () => {
    let wrapper = mount(StringWidget, {
      props: propsInput,
      global: {
        stubs: {
          InputField: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue(null),
            },
          },
        },
      },
    });

    expect(wrapper.vm.validate().errorMessage).toBe("Input is required.");
  });
});
