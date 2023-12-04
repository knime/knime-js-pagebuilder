import { expect, describe, afterEach, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createStore } from "vuex";
import { shallowMount, mount } from "@vue/test-utils";
import { KnimeService } from "@knime/ui-extension-service";
import * as loadingModule from "webapps-common/ui/util/loadComponentLibrary";
import { componentExtensionConfig } from "@@/test/assets/views/extensionConfig";

import UIExtComponent from "@/components/views/UIExtComponent.vue";
import * as storeConfig from "@/store/pagebuilder";

describe("UIExtComponent.vue", () => {
  const extensionConfig = componentExtensionConfig;
  const { resourceInfo } = extensionConfig;
  const store = createStore({ modules: { pagebuilder: storeConfig } });
  const context = {
    props: { resourceLocation: resourceInfo.url },
    global: {
      provide: {
        getKnimeService: () => new KnimeService(extensionConfig, vi.fn()),
      },
      mocks: {
        $store: store,
      },
    },
  };
  const mockComponentId = resourceInfo.id;
  const mockComponent = defineComponent({
    name: mockComponentId,
    template: "<div/>",
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders ui extensions as Vue components", () => {
    window[mockComponentId] = mockComponent;
    let wrapper = shallowMount(UIExtComponent, context);
    expect(wrapper.findComponent(UIExtComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
    delete window[mockComponentId];
  });

  it("loads a component library", () => {
    let loadComponentSpy = vi
      .spyOn(loadingModule, "loadAsyncComponent")
      .mockReturnValue(mockComponent);
    let wrapper = mount(UIExtComponent, context);
    expect(loadComponentSpy).toHaveBeenCalledWith({
      resourceLocation: extensionConfig.resourceInfo.url,
      componentName: mockComponentId,
    });
    expect(wrapper.vm.$options.components[mockComponentId].name).toBe(
      mockComponentId,
    );
    expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
  });
});
