import { expect, describe, beforeEach, it } from "vitest";
import { createStore } from "vuex";
import { shallowMount } from "@vue/test-utils";

import PageBuilder from "@/components/PageBuilder.vue";
import Page from "@/components/layout/Page.vue";
import AlertGlobal from "@/components/ui/AlertGlobal.vue";

describe("PageBuilder.vue", () => {
  let store, context, page;

  beforeEach(() => {
    store = createStore();
    PageBuilder.initStore(store);
    page = {
      wizardExecutionState: "INTERACTION_REQUIRED",
      wizardPageContent: {},
    };
    store.commit("pagebuilder/setPage", page);
    context = {
      global: {
        mocks: {
          $store: store,
        },
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
});
