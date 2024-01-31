import { expect, describe, afterEach, it, vi } from "vitest";
import flushPromises from "flush-promises";
import { defineComponent } from "vue";
import { shallowMount, mount } from "@vue/test-utils";
import * as loadingModule from "webapps-common/ui/util/loadComponentLibrary";
import UIExtComponent from "../UIExtComponent.vue";
import { UIExtensionServiceAPILayer } from "@knime/ui-extension-service";
import * as ExtensionServiceModule from "@knime/ui-extension-service";

describe("UIExtComponent.vue", () => {
  const resourceInfo = {
    id: "org.knime.base.views.scatterplot.ScatterPlotNodeFactory",
  };
  const resourceLocation = "http://localhost:8080/my_widget.html";
  const apiLayer = {} as UIExtensionServiceAPILayer;
  const context = {
    props: { resourceLocation, resourceInfo, apiLayer },
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
    const wrapper = shallowMount(UIExtComponent, context);
    expect(wrapper.findComponent(UIExtComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
    delete window[mockComponentId];
  });

  it("creates, provides and emits embeder service", () => {
    const mockedBaseService = {};
    const mockedEmbedderService = {
      dispatchPushEvent: () => {},
      service: mockedBaseService,
    };
    const setUpEmbedderServiceSpy = vi
      .spyOn(ExtensionServiceModule, "setUpEmbedderService")
      .mockReturnValue(mockedEmbedderService);
    const wrapper = shallowMount(UIExtComponent, context);
    expect(setUpEmbedderServiceSpy).toHaveBeenCalledWith(apiLayer);
    expect(wrapper.emitted("serviceCreated")![0][0]).toBe(
      mockedEmbedderService,
    );
    expect(wrapper.vm.knimeService).toBe(mockedBaseService);
  });

  it("loads a component library", async () => {
    const loadComponentSpy = vi
      .spyOn(loadingModule, "loadAsyncComponent")
      .mockReturnValue(mockComponent as any);
    const wrapper = mount(UIExtComponent, context);
    expect(loadComponentSpy).toHaveBeenCalledWith({
      resourceLocation,
      componentName: mockComponentId,
    });
    await flushPromises();
    expect(wrapper.vm.$options.components?.[mockComponentId].name).toBe(
      mockComponentId,
    );
    expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
  });
});
