import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";

import AlertGlobal from "@/components/ui/AlertGlobal.vue";
import Popover from "@/components/ui/Popover.vue";
import PopoverMessage from "@/components/ui/PopoverMessage.vue";
import * as storeConfig from "@/store/alert";

const SAMPLE_ALERT = {
  nodeId: "1:2:3:4",
  type: "error",
  nodeInfo: {
    nodeName: "KNIME Node",
  },
  message: "Sample error.",
};

let closeAlertMock = vi.fn();

let alertStoreConfig = {
  ...storeConfig,
  actions: {
    ...storeConfig.actions,
    closeAlert: closeAlertMock,
  },
};

describe("AlertGlobal", () => {
  let wrapper, store;

  beforeAll(() => {
    store = createStore({
      modules: {
        "pagebuilder/alert": alertStoreConfig,
      },
    });
    wrapper = mount(AlertGlobal, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders default", () => {
    expect(wrapper.findComponent(AlertGlobal).exists()).toBe(true);
    expect(wrapper.findComponent(Popover).exists()).toBe(true);
    expect(wrapper.findComponent(Popover).props("active")).toBe(false);
    expect(wrapper.findComponent(PopoverMessage).exists()).toBe(false);
  });

  it("parses alert from store", () => {
    const subtitle = "Custom Subtitle";
    const alertWithSubtitle = { ...SAMPLE_ALERT, subtitle };
    store.dispatch("pagebuilder/alert/showAlert", alertWithSubtitle);
    expect(wrapper.vm.alert).toStrictEqual(alertWithSubtitle);
    expect(wrapper.vm.type).toBe(SAMPLE_ALERT.type);
    expect(wrapper.vm.nodeId).toBe(SAMPLE_ALERT.nodeId);
    expect(wrapper.vm.nodeInfo).toStrictEqual(SAMPLE_ALERT.nodeInfo);
    expect(wrapper.vm.nodeName).toBe(SAMPLE_ALERT.nodeInfo.nodeName);
    expect(wrapper.vm.title).toBe("ERROR: KNIME Node");
    expect(wrapper.vm.subtitle).toBe(subtitle);
    expect(wrapper.vm.messageText).toBe(SAMPLE_ALERT.message);
  });

  it("provides default values in case of missing information", () => {
    store.dispatch("pagebuilder/alert/showAlert", {});
    expect(wrapper.vm.alert).toStrictEqual({});
    expect(wrapper.vm.type).toBe("error");
    expect(wrapper.vm.nodeId).toBe("");
    expect(wrapper.vm.nodeInfo).toStrictEqual({});
    expect(wrapper.vm.nodeName).toBe("Missing node");
    expect(wrapper.vm.title).toBe("ERROR: Missing node");
    expect(wrapper.vm.subtitle).toBe("Sorry, a problem occurred:");
    expect(wrapper.vm.messageText).toBe(
      "No further information available. Please check the workflow configuration.",
    );
  });

  it("closes alert on event", () => {
    wrapper.vm.onClose(true);
    expect(closeAlertMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  describe("error alerts", () => {
    let localWrapper;

    let sampleErrorMessage = JSON.parse(JSON.stringify(SAMPLE_ALERT));

    beforeAll(() => {
      const localStore = createStore({
        modules: {
          "pagebuilder/alert": alertStoreConfig,
        },
      });
      localWrapper = mount(AlertGlobal, {
        global: {
          mocks: {
            $store: localStore,
          },
        },
      });
      localStore.dispatch("pagebuilder/alert/showAlert", sampleErrorMessage);
    });

    it("error specific props are respected", () => {
      expect(localWrapper.vm.title).toBe("ERROR: KNIME Node");
      expect(localWrapper.vm.subtitle).toBe("Sorry, a problem occurred:");
    });

    it("does not close the alert on click away (only minimizes)", () => {
      localWrapper.findComponent(Popover).vm.$emit("clickAway");
      expect(closeAlertMock).toHaveBeenCalledWith(expect.anything(), false);
    });
  });

  describe("other alert types", () => {
    let localWrapper;

    let sampleWarnMessage = JSON.parse(JSON.stringify(SAMPLE_ALERT));
    sampleWarnMessage.type = "warn";

    beforeAll(() => {
      const localStore = createStore({
        modules: {
          "pagebuilder/alert": alertStoreConfig,
        },
      });
      localWrapper = mount(AlertGlobal, {
        global: {
          mocks: {
            $store: localStore,
          },
        },
      });
      localStore.dispatch("pagebuilder/alert/showAlert", sampleWarnMessage);
    });

    it("error specific props are respected", () => {
      expect(localWrapper.vm.title).toBe("WARNING: KNIME Node");
      expect(localWrapper.vm.subtitle).toBe("Message(s) on node:");
    });

    it("closes the alert on click away", () => {
      localWrapper.findComponent(Popover).vm.$emit("clickAway");
      expect(closeAlertMock).toHaveBeenCalledWith(expect.anything(), true);
    });
  });
});
