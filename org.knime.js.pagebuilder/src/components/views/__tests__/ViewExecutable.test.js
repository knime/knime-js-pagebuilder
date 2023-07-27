import { expect, describe, beforeAll, afterEach, it, vi } from "vitest";
import { createStore } from "vuex";
import { shallowMount, mount } from "@vue/test-utils";
import * as serviceStoreConfig from "@/store/service";
import * as apiStoreConfig from "@/store/wrapperApi";
import * as alertStoreConfig from "@/store/alert";
import ViewExecutable from "@/components/views/ViewExecutable.vue";
import ExecutingOverlay from "@/components/ui/ExecutingOverlay.vue";
import Button from "webapps-common/ui/components/Button.vue";
import { componentExtensionConfig } from "@@/test/assets/views/extensionConfig";

describe("ViewExecutable.vue", () => {
  it("renders", () => {
    const wrapper = shallowMount(ViewExecutable, {
      props: {
        extensionConfig: { nodeInfo: { canExecute: true } },
      },
    });
    expect(wrapper.exists()).toBeTruthy();
    const executeButton = wrapper.findComponent(Button);
    expect(executeButton.exists()).toBeTruthy();
    expect(executeButton.attributes().disabled).toBe("false");
  });

  describe("props validation", () => {
    it("accepts a valid extensionConfig", () => {
      const wrapper = shallowMount(ViewExecutable, {
        props: {
          extensionConfig: {
            nodeId: null,
            workflowId: null,
            projectId: null,
            nodeInfo: { nodeState: "executed" },
          },
        },
      });
      const extensionConfigValidator =
        wrapper.vm.$options.props.extensionConfig.validate;
      expect(
        extensionConfigValidator({
          nodeId: null,
          workflowId: null,
          projectId: null,
          nodeInfo: null,
        }),
      ).toBe(true);
    });

    it("declines an invalid extensionConfig", () => {
      const wrapper = shallowMount(ViewExecutable, {
        props: {
          extensionConfig: {
            nodeId: null,
            workflowId: null,
            projectId: null,
            nodeInfo: { nodeState: "executed" },
          },
        },
      });
      const extensionConfigValidator =
        wrapper.vm.$options.props.extensionConfig.validate;
      expect(
        extensionConfigValidator({ workflowId: null, projectId: null }),
      ).toBe(false);
      expect(extensionConfigValidator(["id1", "id2"])).toBe(false);
    });
  });

  describe("save & execute on button click", () => {
    const getMockComponentProps = () => ({
      extensionConfig: { ...componentExtensionConfig },
    });
    let context, applySettingsMock, changeNodeStatesMock, showAlertMock;

    beforeAll(() => {
      applySettingsMock = vi.fn();
      changeNodeStatesMock = vi.fn();
      showAlertMock = vi.fn();

      context = {
        global: {
          mocks: {
            $store: createStore({
              modules: {
                "pagebuilder/dialog": {
                  ...serviceStoreConfig,
                  actions: {
                    callApplySettings: applySettingsMock,
                  },
                },
                api: {
                  ...apiStoreConfig,
                  actions: {
                    changeNodeStates: changeNodeStatesMock,
                  },
                },
                "pagebuilder/alert": {
                  ...alertStoreConfig,
                  actions: {
                    showAlert: showAlertMock,
                  },
                },
              },
            }),
          },
        },
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("shows the executing overlay", async () => {
      let props = getMockComponentProps();
      props.extensionConfig.nodeInfo.nodeState = "executing";
      let wrapper = mount(ViewExecutable, {
        ...context,
        props,
      });
      await wrapper.vm.executeViewSaveSettings();
      expect(wrapper.vm.isExecuting).toBeTruthy();
      expect(wrapper.findComponent(ExecutingOverlay).exists()).toBeTruthy();
    });

    it("dispatches the applySettings call to the pagebuilder/service store", async () => {
      let props = getMockComponentProps();
      let wrapper = shallowMount(ViewExecutable, {
        ...context,
        props,
      });
      await wrapper.vm.executeViewSaveSettings();
      expect(applySettingsMock).toHaveBeenCalled();
    });

    it("dispatches the changeNodeState call to the api store", async () => {
      let props = getMockComponentProps();
      let wrapper = shallowMount(ViewExecutable, {
        ...context,
        props,
      });
      await wrapper.vm.executeViewSaveSettings();
      expect(changeNodeStatesMock).toHaveBeenCalled();
    });

    it("save & Execute button is disabled if node cannot be executed", () => {
      let props = getMockComponentProps();
      props.extensionConfig.nodeInfo.canExecute = false;
      let wrapper = shallowMount(ViewExecutable, {
        ...context,
        props,
      });
      expect(wrapper.findComponent(Button).attributes().disabled).toBeTruthy();
      expect(wrapper.find(".message").text()).toContain("cannot be executed");
    });

    it("dispatches calls to the pagebuilder/alert store", () => {
      let props = getMockComponentProps();
      props.extensionConfig.nodeInfo.nodeWarnMessage = "warning message";
      shallowMount(ViewExecutable, {
        ...context,
        props,
      });
      expect(showAlertMock).toHaveBeenCalledWith(expect.anything(), {
        message: "warning message",
        nodeId: "0:0:7",
        subtitle: "",
        type: "warn",
      });
    });
  });
});
