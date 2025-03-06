import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";

import PageBuilder from "@/components/PageBuilder.vue";
import Page from "@/components/layout/Page.vue";
import AlertGlobal from "@/components/ui/AlertGlobal.vue";
import { initStore } from "@/store/initStore";

describe("PageBuilder.vue", () => {
  let store, context, page;

  beforeEach(() => {
    store = createStore();
    initStore(store);
    page = {
      wizardExecutionState: "INTERACTION_REQUIRED",
      wizardPageContent: {},
    };
    store.commit("pagebuilder/setPage", page);
    context = {
      global: {
        plugins: [store],
      },
    };
  });

  it("initializes the pagebuilder store", () => {
    expect(store.state.pagebuilder).toBeDefined();
    expect(store.state["pagebuilder/interactivity"]).toBeDefined();
    expect(store.state["pagebuilder/service"]).toBeDefined();
    expect(store.state["pagebuilder/alert"]).toBeDefined();
  });

  it("renders", () => {
    let wrapper = shallowMount(PageBuilder, context);

    expect(wrapper.findComponent(Page).exists()).toBeTruthy();
    expect(wrapper.findComponent(AlertGlobal).exists()).toBeTruthy();
  });

  it("hide global alert when page isDialogLayout", () => {
    const localPage = {
      ...page,
      wizardPageContent: {
        nodeViews: { DIALOG: {} },
      },
    };
    store.commit("pagebuilder/setPage", localPage);
    let wrapper = shallowMount(PageBuilder, context);

    expect(wrapper.findComponent(Page).exists()).toBeTruthy();
    expect(wrapper.findComponent(AlertGlobal).exists()).toBeFalsy();
  });

  it("does not render Page if called with unsupported wizardExecutionState", () => {
    const page = {
      wizardExecutionState: "SOMEFAKESTATE",
    };
    store.commit("pagebuilder/setPage", page);

    let wrapper = shallowMount(PageBuilder, context);

    expect(wrapper.findComponent(Page).exists()).toBeFalsy();
  });

  it("subscribes to setPage changes and increments the pageKey ref", () => {
    const wrapper = shallowMount(PageBuilder, context);
    const pageKey = wrapper.vm.pageKey;

    store.commit("pagebuilder/setPage", {});

    expect(wrapper.vm.pageKey).toBe(pageKey + 1);
  });

  it("clears subscriptions on unmount", () => {
    const unsubscribeMock = vi.fn();
    const subscribeSpy = vi
      .spyOn(store, "subscribe")
      .mockImplementation(() => unsubscribeMock);
    const wrapper = shallowMount(PageBuilder, context);
    expect(subscribeSpy).toHaveBeenCalled();

    wrapper.unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
