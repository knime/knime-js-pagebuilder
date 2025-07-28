import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import { Fieldset, InputField, Label } from "@knime/components";

import ErrorMessage from "@/components/widgets/baseElements/text/ErrorMessage.vue";
import CredentialsWidget from "@/components/widgets/input/CredentialsWidget.vue";

describe("CredentialsWidget.vue", () => {
  let propsDefault, propsServer;

  beforeEach(() => {
    propsDefault = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        namespace: "knimeCredentialsWidget",
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
            "org.knime.js.base.node.base.input.credentials.CredentialsNodeRepresentation",
          label: "Default",
          description: "Enter Description",
          required: true,
          defaultValue: {
            "@class":
              "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
            username: "",
            isSavePassword: false,
            magicDefaultPassword: null,
            password: null,
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
            username: "",
            isSavePassword: false,
            magicDefaultPassword: null,
            password: null,
          },
          promptUsername: true,
          useServerLoginCredentials: false,
          errorMessage: "",
          noDisplay: false,
        },
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "Credentials Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/widget/input/credentials/credentialsWidget.js",
        ],
        getViewValueMethodName: "value",
      },
      nodeId: "2:0:1",
      isValid: false,
    };

    propsServer = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        initMethodName: "init",
        validateMethodName: "validate",
        setValidationErrorMethodName: "setValidationErrorMessage",
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/widget/input/credentials/credentialsWidget.js",
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
          nodeName: "Credentials Widget",
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          displayPossible: true,
        },
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.base.input.credentials.CredentialsNodeRepresentation",
          label:
            "Prompt, Save, Dialog user and Pass & Use KNIME Server Login (render Input)",
          description: "Enter Description",
          required: false,
          defaultValue: {
            "@class":
              "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
            username: "TestUsername",
            isSavePassword: true,
            magicDefaultPassword: "*************",
            password: "TestPassword",
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
            username: "TestUsername",
            isSavePassword: true,
            magicDefaultPassword: "*************",
            password: "TestPassword",
          },
          promptUsername: true,
          useServerLoginCredentials: true,
          errorMessage: "",
          noDisplay: false,
        },
        viewValue: {
          "@class":
            "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
          username: "TestUsername",
          isSavePassword: true,
          magicDefaultPassword: "*************",
          password: "TestPassword",
        },
        customCSS: "",
        namespace: "knimeCredentialsWidget",
      },
      nodeId: "2:0:7",
      isValid: false,
      valuePair: {
        "@class":
          "org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue",
        username: "TestUsername",
        isSavePassword: true,
        magicDefaultPassword: "*************",
        password: "TestPassword",
      },
    };
  });

  describe("credentials widget", () => {
    it("renders", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: propsDefault,
        global: {
          stubs: { Label, Fieldset },
        },
      });
      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
      expect(wrapper.findComponent(Fieldset)).toBeTruthy();
      expect(wrapper.findAllComponents(InputField).length).toBe(2);
    });

    it("adds hidden class if noDisplay is true", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: {
          ...propsDefault,
          nodeConfig: {
            ...propsDefault.nodeConfig,
            viewRepresentation: {
              ...propsDefault.nodeConfig.viewRepresentation,
              noDisplay: true,
            },
          },
        },
        global: {
          stubs: { Label, Fieldset },
        },
      });
      expect(wrapper.find(".hide").exists()).toBe(true);
    });

    it("renders no username input if promptUsername is false", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: {
          ...propsDefault,
          nodeConfig: {
            ...propsDefault.nodeConfig,
            viewRepresentation: {
              ...propsDefault.nodeConfig.viewRepresentation,
              promptUsername: false,
            },
          },
        },
        global: {
          stubs: { Label, Fieldset },
        },
      });
      expect(wrapper.findComponent({ ref: "usernameForm" }).exists()).toBe(
        false,
      );
      expect(wrapper.findComponent({ ref: "passwordForm" }).exists()).toBe(
        true,
      );
    });

    it("renders username and password default labels", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: propsDefault,
        global: {
          stubs: { Label, Fieldset },
        },
      });
      let labels = wrapper.findAllComponents(Label);
      expect(labels[0].vm.text).toBe("User");
      expect(labels[1].vm.text).toBe("Password");
    });

    it("renders username and password custom labels", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: {
          ...propsDefault,
          nodeConfig: {
            ...propsDefault.nodeConfig,
            viewRepresentation: {
              ...propsDefault.nodeConfig.viewRepresentation,
              usernameLabel: "Bond",
              passwordLabel: "007",
            },
          },
        },
        global: {
          stubs: { Label, Fieldset },
        },
      });
      let labels = wrapper.findAllComponents(Label);
      expect(labels[0].vm.text).toBe("Bond");
      expect(labels[1].vm.text).toBe("007");
    });

    it("emits @updateWidget on username if child emits @input", () => {
      let wrapper = mount(CredentialsWidget, {
        props: propsDefault,
        global: {
          stubs: { Label, Fieldset },
        },
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent(InputField);
      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsDefault.nodeId,
        type: "username",
        value: testValue,
      });
    });

    it("emits @updateWidget on password if child emits @input", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: propsDefault,
        global: {
          stubs: { Label, Fieldset },
        },
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent({ ref: "passwordForm" });
      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")).toBeTruthy();
      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsDefault.nodeId,
        type: "magicDefaultPassword",
        value: testValue,
      });
    });

    it("emits @updateWidget on password only if input differs from serverCredentials", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: propsServer,
        global: {
          stubs: { Label, Fieldset },
        },
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent({ ref: "passwordForm" });
      input.vm.$emit(
        "update:modelValue",
        propsServer.nodeConfig.viewRepresentation.defaultValue
          .magicDefaultPassword,
      );

      expect(wrapper.emitted("updateWidget")).toBeFalsy();

      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsServer.nodeId,
        type: "magicDefaultPassword",
        value: testValue,
      });
    });

    it("emits @updateWidget on username only if input differs from serverCredentials", () => {
      let wrapper = shallowMount(CredentialsWidget, {
        props: propsServer,
        global: {
          stubs: { Label, Fieldset },
        },
      });

      const testValue = "VALUE";
      const input = wrapper.findComponent({ ref: "usernameForm" });
      input.vm.$emit(
        "update:modelValue",
        propsServer.nodeConfig.viewRepresentation.defaultValue.username,
      );

      expect(wrapper.emitted("updateWidget")).toBeFalsy();

      input.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
        nodeId: propsServer.nodeId,
        type: "username",
        value: testValue,
      });
    });

    it("will be invalid if widget is", async () => {
      let widget = mount(CredentialsWidget, {
        props: { ...propsDefault, isValid: true },
      });

      let textComponent = widget.findComponent(InputField);
      expect(textComponent.props("isValid")).toBe(true);
      await widget.setProps({ isValid: false });
      expect(textComponent.props("isValid")).toBe(false);
    });

    it("takes specific error message over child error message", () => {
      let wrapper = mount(CredentialsWidget, {
        props: propsDefault,
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
      expect(wrapper.vm.validate().errorMessage).toBe(
        "Please correct input for username and password.",
      );
    });

    it("renders serverCredentials input correctly", () => {
      let wrapper = mount(CredentialsWidget, {
        props: propsServer,
        global: {
          stubs: { Label, Fieldset },
        },
      });
      expect(
        wrapper.findComponent({ ref: "usernameForm" }).props("modelValue"),
      ).toEqual(
        propsServer.nodeConfig.viewRepresentation.defaultValue.username,
      );

      expect(
        wrapper.findComponent({ ref: "passwordForm" }).props("modelValue"),
      ).toEqual(
        propsServer.nodeConfig.viewRepresentation.defaultValue
          .magicDefaultPassword,
      );
    });

    it("displays server error in correct hierarchy", async () => {
      let validate = vi.fn();
      let wrapper = mount(CredentialsWidget, {
        props: {
          ...propsServer,
          nodeConfig: {
            ...propsServer.nodeConfig,
            viewValue: null,
            viewRepresentation: {
              ...propsServer.nodeConfig.viewRepresentation,
              defaultValue: null,
              currentValue: null,
            },
          },
        },
        global: {
          stubs: {
            Label,
            Fieldset,
            InputField: {
              template: "<div />",
              methods: {
                getValue: vi.fn().mockReturnValue(null),
                validate,
              },
            },
          },
        },
      });

      // username and password invalid
      validate.mockReturnValueOnce({ isValid: false, errorMessage: null });
      validate.mockReturnValueOnce({ isValid: false, errorMessage: null });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "Please correct input for username and password.",
        isValid: false,
      });

      // username valid, password invalid
      validate.mockReturnValueOnce({ isValid: false, errorMessage: null });
      validate.mockReturnValueOnce({ isValid: true, errorMessage: null });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "Please correct input for password.",
        isValid: false,
      });

      // username invalid, password valid
      validate.mockReturnValueOnce({ isValid: true, errorMessage: null });
      validate.mockReturnValueOnce({ isValid: false, errorMessage: null });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "Please correct input for username.",
        isValid: false,
      });

      // username and password valid
      validate.mockReturnValueOnce({ isValid: true, errorMessage: null });
      validate.mockReturnValueOnce({ isValid: true, errorMessage: null });
      expect(wrapper.vm.validate()).toStrictEqual({
        errorMessage: "",
        isValid: true,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(ErrorMessage).props("error")).toBe(
        "KNIME Server login credentials could not be fetched!",
      );
    });

    it("renders server credentials error if no username gets prompted", async () => {
      let wrapper = mount(CredentialsWidget, {
        props: {
          ...propsServer,
          nodeConfig: {
            ...propsServer.nodeConfig,
            viewValue: null,
            viewRepresentation: {
              ...propsServer.nodeConfig.viewRepresentation,
              defaultValue: null,
              currentValue: null,
              promptUsername: false,
            },
          },
        },
        global: {
          stubs: { Label, Fieldset },
        },
      });

      expect(wrapper.findComponent({ ref: "usernameForm" }).exists()).toBe(
        false,
      );
      wrapper.vm.validate();
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(ErrorMessage).props("error")).toBe(
        "KNIME Server login credentials could not be fetched!",
      );
    });

    it("disables both username and password input fields when disabled prop is true", () => {
      let wrapper = mount(CredentialsWidget, {
        props: { ...propsDefault, disabled: true },
      });

      const inputComponents = wrapper.findAllComponents(InputField);
      inputComponents.forEach((component) => {
        expect(component.props("disabled")).toBe(true);
      });
    });
  });
});
