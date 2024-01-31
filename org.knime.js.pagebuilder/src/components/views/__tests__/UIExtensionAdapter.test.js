import {
  expect,
  describe,
  beforeAll,
  afterEach,
  it,
  vi,
  beforeEach,
} from "vitest";
import { createStore } from "vuex";
import { shallowMount } from "@vue/test-utils";
vi.mock("@knime/ui-extension-service");
import * as pagebuilderStoreConfig from "@/store/pagebuilder";
import * as alertStoreConfig from "@/store/alert";
import * as serviceStoreConfig from "@/store/service";
import * as apiStoreConfig from "@/store/wrapperApi";
import * as dialogStoreConfig from "@/store/dialog";
import UIExtension from "../uiExtensions/UIExtension.vue";
import UIExtensionAdapter from "../UIExtensionAdapter.vue";
import NotDisplayable from "../NotDisplayable.vue";
import { getTestExtensionConfig } from "./configs/extensionConfig";
import { viewConfig } from "./configs/viewConfig";
import {
  AlertType,
  DataServiceType,
  SelectionModes,
} from "@knime/ui-extension-service";

describe("UIExtension.vue", () => {
  const getResourceLocation = ({ resourceInfo: { path, baseUrl } }) =>
    `uiExtResourceLocation(${baseUrl}, ${path}) (e.g. "http://localhost:8080/your_resource.html")`;

  const createPagebuilderStore = ({
    callServiceMock = vi.fn(),
    pushEventMock = vi.fn(),
    registerServiceMock = vi.fn(),
    deregisterServiceMock = vi.fn(),
    setReportingContentMock = vi.fn(),
    settingsOnClean = undefined,
    isReporting = false,
  }) => {
    const storeConfig = {
      modules: {
        pagebuilder: {
          ...pagebuilderStoreConfig,
          state: {
            ...pagebuilderStoreConfig.state,
            isReporting,
          },
          actions: {
            ...pagebuilderStoreConfig.actions,
            setReportingContent: setReportingContentMock,
          },
        },
        "pagebuilder/alert": alertStoreConfig,
        "pagebuilder/dialog": {
          ...dialogStoreConfig,
          state: {
            ...dialogStoreConfig.state,
            settingsOnClean,
          },
        },
        "pagebuilder/service": {
          ...serviceStoreConfig,
          actions: {
            ...serviceStoreConfig.actions,
            pushEvent: pushEventMock,
          },
        },
        api: {
          ...apiStoreConfig,
          actions: {
            callService: callServiceMock,
          },
          getters: {
            ...apiStoreConfig.getters,
            uiExtResourceLocation: () => getResourceLocation,
          },
          namespaced: true,
        },
      },
    };
    if (registerServiceMock) {
      storeConfig.modules["pagebuilder/service"].actions.registerService =
        registerServiceMock;
    }
    if (deregisterServiceMock) {
      storeConfig.modules["pagebuilder/service"].actions.deregisterService =
        deregisterServiceMock;
    }
    return createStore(storeConfig);
  };

  let context, props;

  beforeAll(() => {
    props = { extensionConfig: getTestExtensionConfig(), viewConfig };
    context = {
      props,
      global: {
        mocks: {
          $store: createPagebuilderStore({
            callServiceMock: vi.fn(),
            registerServiceMock: vi.fn(),
          }),
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders UIExtension component", () => {
    const wrapper = shallowMount(UIExtensionAdapter, context);
    expect(wrapper.findComponent(UIExtension).exists()).toBeTruthy();
  });

  it("increments key on UIExtension component when a new extension config is passes in", async () => {
    const wrapper = shallowMount(UIExtensionAdapter, context);
    const uiExtIFrameEleInitial = wrapper.findComponent(UIExtension).vm.$el;

    const newExtensionConfig = getTestExtensionConfig();
    newExtensionConfig.resourceInfo.url =
      "http://localhost:8080/your_iframe_widget.html";

    await wrapper.setProps({ extensionConfig: newExtensionConfig });

    expect(wrapper.findComponent(UIExtension).vm.$el).not.toBe(
      uiExtIFrameEleInitial,
    );
  });

  const getAPILayer = (wrapper) => {
    return wrapper.findComponent(UIExtension).props().apiLayer;
  };

  it("provides an apiLayer", () => {
    const wrapper = shallowMount(UIExtensionAdapter, context);
    expect(getAPILayer(wrapper)).toBeDefined();
  });

  describe("registerPushEventService", () => {
    let wrapper, apiLayer, registerServiceMock, deregisterServiceMock;

    beforeEach(() => {
      registerServiceMock = vi.fn();
      deregisterServiceMock = vi.fn();
      wrapper = shallowMount(UIExtensionAdapter, {
        global: {
          mocks: {
            $store: createPagebuilderStore({
              registerServiceMock,
              deregisterServiceMock,
            }),
          },
        },
        props,
      });
      apiLayer = getAPILayer(wrapper);
    });

    const dispatchPushEvent = () => {};

    it("calls registerService in service store", () => {
      apiLayer.registerPushEventService({
        dispatchPushEvent,
      });
      expect(registerServiceMock).toHaveBeenCalledWith(expect.anything(), {
        service: {
          serviceId: "0:0:7.knime workflow.root:10.view",
          onServiceEvent: dispatchPushEvent,
        },
      });
    });

    it("calls deregisterService in service store", () => {
      apiLayer.registerPushEventService({
        dispatchPushEvent,
      })();
      expect(deregisterServiceMock).toHaveBeenCalledWith(expect.anything(), {
        service: {
          serviceId: "0:0:7.knime workflow.root:10.view",
          onServiceEvent: dispatchPushEvent,
        },
      });
    });

    it("emits registerPushEventService further", () => {
      apiLayer.registerPushEventService({
        dispatchPushEvent,
      });
      expect(wrapper.emitted("registerPushEventService")[0][0]).toBe(
        dispatchPushEvent,
      );
    });
  });

  describe("sendAlert", () => {
    let wrapper, apiLayer, showAlertSpy;

    beforeEach(async () => {
      wrapper = shallowMount(UIExtensionAdapter, context);
      showAlertSpy = vi.spyOn(
        wrapper.vm.$store._actions["pagebuilder/alert/showAlert"],
        "0",
      );
      await wrapper.vm.$nextTick();
      apiLayer = getAPILayer(wrapper);
      expect(apiLayer).toBeDefined();
    });

    const mockAlert = {
      message: "Shaken not stirred.",
      nodeId: "123",
      type: AlertType.ERROR,
    };

    it("sends alerts to the store", () => {
      apiLayer.sendAlert(mockAlert);
      expect(showAlertSpy).toHaveBeenCalled();
      const params = showAlertSpy.mock.calls[0][0];
      expect(params).toMatchObject(mockAlert);
    });

    it("provides wrapped closeAlert method to the store", () => {
      const closeAlert = vi.fn();
      apiLayer.sendAlert(mockAlert, closeAlert);
      expect(showAlertSpy).toHaveBeenCalled();
      const { callback } = showAlertSpy.mock.calls[0][0];
      callback();
      expect(closeAlert).not.toHaveBeenCalled();
      callback(true);
      expect(closeAlert).toHaveBeenCalled();
    });
  });

  describe("publishData", () => {
    it("emits published data", () => {
      const myData = { some: "data" };
      const wrapper = shallowMount(UIExtensionAdapter, context);
      const apiLayer = getAPILayer(wrapper);
      apiLayer.publishData(myData);
      expect(wrapper.emitted("publishData")[0][0]).toBe(myData);
    });
  });

  describe("getResourceLocation", () => {
    it("combines path with give base url", () => {
      const wrapper = shallowMount(UIExtensionAdapter, context);
      const path = "myPath";
      const apiLayer = getAPILayer(wrapper);
      expect(apiLayer.getResourceLocation(path)).toBe(
        getResourceLocation({
          resourceInfo: {
            path,
            baseUrl: props.extensionConfig.resourceInfo.baseUrl,
          },
        }),
      );
    });
  });

  describe("callNodeDataService and updateDataPointSelection", () => {
    let callServiceMock, apiLayer;
    const mockData = { some: "data" };

    beforeEach(() => {
      callServiceMock = vi.fn();
      const wrapper = shallowMount(UIExtensionAdapter, {
        global: {
          mocks: {
            $store: createPagebuilderStore({ callServiceMock }),
          },
        },
        props,
      });

      callServiceMock.mockResolvedValue(mockData);

      apiLayer = getAPILayer(wrapper);
    });

    it("dispatches callService in store on callNodeDataService", async () => {
      const extensionConfigParams = {
        projectId: "myProjectId",
        nodeId: "myNodeId",
        workflowId: "myWorkflowId",
        extensionType: "view",
      };

      const serviceType = DataServiceType.INITIAL_DATA;
      const dataServiceRequest = "myDataServiceRequest";

      const returnedData = await apiLayer.callNodeDataService({
        ...extensionConfigParams,
        serviceType,
        dataServiceRequest,
      });
      expect(callServiceMock).toHaveBeenCalledWith(expect.anything(), {
        nodeService: "NodeService.callNodeDataService",
        extensionConfig: extensionConfigParams,
        serviceRequest: serviceType,
        requestParams: dataServiceRequest,
      });
      expect(returnedData).toBe(mockData);
    });

    it("dispatches callService in store on updateDataPointSelection", async () => {
      const extensionConfigParams = {
        projectId: "myProjectId",
        nodeId: "myNodeId",
        workflowId: "myWorkflowId",
      };

      const mode = SelectionModes.ADD;
      const selection = ["1", "3"];

      const returnedData = await apiLayer.updateDataPointSelection({
        ...extensionConfigParams,
        mode,
        selection,
      });
      expect(callServiceMock).toHaveBeenCalledWith(expect.anything(), {
        nodeService: "updateDataPointSelection",
        extensionConfig: extensionConfigParams,
        serviceRequest: mode,
        requestParams: selection,
      });
      expect(returnedData).toBe(mockData);
    });
  });

  describe("reporting", () => {
    let setReportingContentMock, wrapper;

    beforeEach(() => {
      setReportingContentMock = vi.fn();
      wrapper = shallowMount(UIExtensionAdapter, {
        global: {
          mocks: {
            $store: createPagebuilderStore({ setReportingContentMock }),
          },
        },
        props,
      });
    });

    it("sets reporting content via apiLayer", () => {
      const reportingContent = "<div>reporting content</div>";
      getAPILayer(wrapper).setReportingContent(reportingContent);
      expect(setReportingContentMock).toHaveBeenCalledWith(expect.anything(), {
        reportingContent,
        nodeId: wrapper.vm.nodeId,
      });
    });

    it("shows a 'not supported' label if a report is rendered but the ui-extension doesn't support it", () => {
      props.extensionConfig.generatedImageActionId = null;
      const wrapper = shallowMount(UIExtensionAdapter, {
        global: {
          mocks: {
            $store: createPagebuilderStore({
              isReporting: true,
              setReportingContentMock,
            }),
          },
        },
        props,
      });

      expect(wrapper.findComponent(NotDisplayable).exists()).toBeTruthy();
      expect(wrapper.findComponent(UIExtension).exists()).toBeFalsy();
      expect(setReportingContentMock).toHaveBeenCalledWith(expect.anything(), {
        nodeId: wrapper.vm.nodeId,
      });
    });

    it("renders the ui-extension if a report is rendered and the ui-extension supports it", () => {
      props.extensionConfig.generatedImageActionId = "blub";
      const wrapper = shallowMount(UIExtensionAdapter, {
        global: {
          mocks: {
            $store: createPagebuilderStore({
              isReporting: true,
              setReportingContentMock,
            }),
          },
        },
        props,
      });

      expect(wrapper.findComponent(NotDisplayable).exists()).toBeFalsy();
      expect(
        wrapper.findComponent(UIExtension).props().isReporting,
      ).toBeTruthy();
      expect(setReportingContentMock).toHaveBeenCalledTimes(0);
    });
  });

  it("supplies dialog data to the extensionConfig if they are present", () => {
    const dialogSettings = { foo: "bar" };
    const wrapper = shallowMount(UIExtensionAdapter, {
      global: {
        mocks: {
          $store: createPagebuilderStore({
            settingsOnClean: dialogSettings,
          }),
        },
      },
      props,
    });
    expect(
      wrapper.findComponent(UIExtension).props().extensionConfig,
    ).toStrictEqual({ ...props.extensionConfig, dialogSettings });
  });

  describe("styling", () => {
    it("respects resize classes", () => {
      viewConfig.resizeMethod = "aspectRatio1by1";
      let wrapper = shallowMount(UIExtensionAdapter, context);
      expect(wrapper.find("div").attributes("class")).toBe("aspectRatio1by1");
      viewConfig.resizeMethod = "aspectRatio16by9";
      wrapper = shallowMount(UIExtensionAdapter, context);
      expect(wrapper.find("div").attributes("class")).toBe("aspectRatio16by9");
    });

    it("renders with classes and styles", () => {
      const wrapper = shallowMount(UIExtensionAdapter, {
        ...context,
        props: {
          ...props,
          viewConfig: {
            resizeMethod: "aspectRatio1by1",
            additionalClasses: ["class1", "class2"],
            additionalStyles: ["color: red;", "border: 1px solid green;"],
          },
        },
      });
      expect(wrapper.attributes("class")).toBe("aspectRatio1by1 class1 class2");
      expect(wrapper.attributes("style")).toBe(
        "color: red; border: 1px solid green;",
      );
    });

    it("adds classes for min/max height & width", () => {
      const wrapper = shallowMount(UIExtensionAdapter, {
        ...context,
        props: {
          ...props,
          viewConfig: {
            resizeMethod: "viewLowestElement",
            additionalClasses: ["class1", "class2"],
            additionalStyles: ["color: red;", "border: 1px solid green;"],
            minHeight: 100,
            maxHeight: 200,
            minWidth: 100,
            maxWidth: 200,
          },
        },
      });
      expect(wrapper.attributes("class")).toBe("fill-container class1 class2");
      expect(wrapper.attributes("style")).toEqual(
        "color: red; border: 1px solid green; max-height: 200px;" +
          " max-width: 200px; min-height: 100px; min-width: 100px;",
      );
    });
  });
});
