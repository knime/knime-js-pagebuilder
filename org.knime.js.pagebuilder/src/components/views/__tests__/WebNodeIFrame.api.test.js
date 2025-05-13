import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import { createStore } from "vuex";

import WebNodeIFrame from "@/components/views/WebNodeIFrame.vue";
import * as alertStoreConfig from "@/store/alert";
import * as storeConfig from "@/store/pagebuilder";

// extra mock to simulate a loaded view script
vi.mock(
  "raw-loader!./injectedScripts/loadErrorHandler.js",
  () => `"loadErrorHandler.js mock";
    foo = ['%NODEID%'];`,
  { virtual: true },
);
vi.mock(
  "raw-loader!./injectedScripts/viewAlertHandler.js",
  () => `"viewAlertHandler.js mock";
    foo = ['%NODEID%'];`,
  { virtual: true },
);
vi.mock(
  "raw-loader!./injectedScripts/scriptLoader.js",
  () => `"scriptLoader.js mock";
    foo = ['%RESOURCEBASEURL%', '%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`,
  { virtual: true },
);
vi.mock("iframe-resizer/js/iframeResizer");

describe("WebNodeIFrame.vue", () => {
  let interactivityConfig,
    apiConfig,
    wizardConfig,
    settingsConfig,
    store,
    context,
    mockGetPublishedData,
    mockGetUser,
    mockGetRepository,
    mockGetDownloadLink,
    mockGetUploadLink,
    mockUpload;

  beforeEach(() => {
    mockGetPublishedData = vi.fn();
    interactivityConfig = {
      namespaced: true,
      actions: {
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        publish: vi.fn(),
        registerSelectionTranslator: vi.fn(),
        clear: vi.fn(),
      },
      getters: {
        getPublishedData: vi.fn().mockReturnValue(mockGetPublishedData),
      },
    };
    mockGetUser = vi.fn();
    mockGetRepository = vi.fn();
    mockGetDownloadLink = vi.fn();
    mockGetUploadLink = vi.fn();
    mockUpload = vi.fn();
    apiConfig = {
      namespaced: true,
      actions: {
        uploadResource: mockUpload,
      },
      getters: {
        user: vi.fn().mockReturnValue(mockGetUser),
        repository: vi.fn().mockReturnValue(mockGetRepository),
        downloadResourceLink: vi.fn().mockReturnValue(mockGetDownloadLink),
        uploadResourceLink: vi.fn().mockReturnValue(mockGetUploadLink),
      },
    };
    wizardConfig = {
      namespaced: true,
      getters: {
        workflowPath: vi.fn().mockReturnValue("/some/path"),
        currentJobId: vi.fn(),
      },
    };
    settingsConfig = {
      namespaced: true,
      state: () => ({ defaultMountId: "MOUNTIE" }),
      getters: {
        getCustomSketcherPath: vi
          .fn()
          .mockReturnValue("sample/sketcher/path/sketcher.html"),
      },
    };

    const mockedStoreConfig = {
      ...storeConfig,
      actions: {
        ...storeConfig.actions,
        setWebNodeLoading: vi.fn(),
        addValidator: vi.fn(),
        addValueGetter: vi.fn(),
        addValidationErrorSetter: vi.fn(),
      },
    };
    store = createStore({
      modules: {
        pagebuilder: mockedStoreConfig,
        "pagebuilder/interactivity": interactivityConfig,
        api: apiConfig,
        settings: settingsConfig,
        wizardExecution: wizardConfig,
        "pagebuilder/alert": alertStoreConfig,
      },
    });
    store.commit(
      "pagebuilder/setResourceBaseUrl",
      "http://baseurl.test.example/",
    );
    store.commit("pagebuilder/setPage", {
      wizardPageContent: {
        webNodes: {
          "1:0:1:0:0:7": {
            namespace: "foo",
            javascriptLibraries: [],
            stylesheets: [],
          },
          "1:0:1:0:0:9": {
            namespace: "bar",
            javascriptLibraries: [],
            stylesheets: [],
          },
        },
        webNodePageConfiguration: {
          projectRelativePageIDSuffix: "1:0:1",
        },
      },
    });

    context = {
      global: {
        mocks: {
          $store: store,
        },
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers/de-registers methods with store", async () => {
    let addValidator,
      addValueGetter,
      addValidationErrorSetter,
      removeValidator,
      removeValueGetter,
      removeValidationErrorSetter,
      methodsStore,
      wrapper;

    addValidator = vi.fn();
    addValueGetter = vi.fn();
    addValidationErrorSetter = vi.fn();
    removeValidator = vi.fn();
    removeValueGetter = vi.fn();
    removeValidationErrorSetter = vi.fn();

    methodsStore = createStore({
      modules: {
        pagebuilder: {
          namespaced: true,
          ...storeConfig,
          actions: {
            ...storeConfig.actions,
            setWebNodeLoading: vi.fn(),
            addValidator,
            addValueGetter,
            addValidationErrorSetter,
            removeValidator,
            removeValueGetter,
            removeValidationErrorSetter,
          },
        },
        settings: settingsConfig,
        "pagebuilder/alert": alertStoreConfig,
        wizardExecution: wizardConfig,
      },
    });
    methodsStore.commit(
      "pagebuilder/setResourceBaseUrl",
      "http://baseurl.test.example/",
    );
    methodsStore.commit("pagebuilder/setPage", {
      wizardPageContent: {
        webNodes: {
          "1:0:1:0:0:7": {
            namespace: "foo",
            javascriptLibraries: [],
            stylesheets: [],
          },
          "1:0:1:0:0:9": {
            namespace: "bar",
            javascriptLibraries: [],
            stylesheets: [],
          },
        },
        webNodePageConfiguration: {
          projectRelativePageIDSuffix: "1:0:1",
        },
      },
    });

    let nodeId = "0:0:7";

    wrapper = shallowMount(WebNodeIFrame, {
      global: {
        mocks: {
          $store: methodsStore,
        },
      },
      attachTo: document.body,
      props: {
        viewConfig: { nodeID: nodeId },
        nodeConfig: {},
        nodeId,
      },
    });
    await flushPromises();

    expect(addValidator).toHaveBeenCalledWith(expect.anything(), {
      nodeId,
      validator: wrapper.vm.validate,
    });
    expect(addValueGetter).toHaveBeenCalledWith(expect.anything(), {
      nodeId,
      valueGetter: wrapper.vm.getValue,
    });
    expect(addValidationErrorSetter).toHaveBeenCalledWith(expect.anything(), {
      nodeId,
      errorSetter: wrapper.vm.setValidationError,
    });

    wrapper.unmount();

    expect(removeValidator).toHaveBeenCalledWith(expect.anything(), { nodeId });
    expect(removeValueGetter).toHaveBeenCalledWith(expect.anything(), {
      nodeId,
    });
    expect(removeValidationErrorSetter).toHaveBeenCalledWith(
      expect.anything(),
      { nodeId },
    );
  });

  describe("pageBuilder API", () => {
    let wrapper;

    let createLocalWrapper = async (jobsId) => {
      let localWizardConfig = {
        namespaced: true,
        state: {
          currentJobId: null,
        },
        getters: {
          workflowPath: vi.fn().mockReturnValue("/some/path"),
          currentJobId(state) {
            return state.currentJobId;
          },
        },
        mutations: {
          setJobId(state, jobId) {
            state.currentJobId = jobId;
          },
        },
      };
      const mockedStoreConfig = {
        ...storeConfig,
        actions: {
          ...storeConfig.actions,
          setWebNodeLoading: vi.fn(),
          addValidator: vi.fn(),
          addValueGetter: vi.fn(),
          addValidationErrorSetter: vi.fn(),
        },
      };

      let localStore = createStore({
        modules: {
          pagebuilder: mockedStoreConfig,
          "pagebuilder/interactivity": interactivityConfig,
          api: apiConfig,
          settings: settingsConfig,
          wizardExecution: localWizardConfig,
          "pagebuilder/alert": alertStoreConfig,
        },
      });
      if (jobsId) {
        localStore.commit("wizardExecution/setJobId", jobsId);
      }
      localStore.commit(
        "pagebuilder/setResourceBaseUrl",
        "http://baseurl.test.example/",
      );
      localStore.commit("pagebuilder/setPage", {
        wizardPageContent: {
          webNodes: {
            "1:0:1:0:0:7": {
              namespace: "foo",
              javascriptLibraries: [],
              stylesheets: [],
            },
            "1:0:1:0:0:9": {
              namespace: "bar",
              javascriptLibraries: [],
              stylesheets: [],
            },
          },
          webNodePageConfiguration: {
            projectRelativePageIDSuffix: "1:0:1",
          },
        },
      });

      let localContext = {
        global: {
          mocks: {
            $store: localStore,
          },
        },
      };
      const wrapper = shallowMount(WebNodeIFrame, {
        ...localContext,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeId: "0:0:7",
        },
      });
      await flushPromises();
      return wrapper;
    };

    beforeEach(async () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeId: "0:0:7",
        },
      });
      await flushPromises();
    });

    afterEach(() => {
      delete window.KnimePageBuilderAPI;
    });

    it("registers global PageBuilder API", () => {
      expect(window.KnimePageBuilderAPI).toBeDefined();
      expect(
        window.KnimePageBuilderAPI.interactivityGetPublishedData,
      ).toBeDefined();
      expect(window.KnimePageBuilderAPI.getDefaultMountId).toBeDefined();
      expect(window.KnimePageBuilderAPI.getWorkflow).toBeDefined();
      expect(window.KnimePageBuilderAPI.getDownloadLink).toBeDefined();
      expect(window.KnimePageBuilderAPI.getUploadLink).toBeDefined();
      expect(window.KnimePageBuilderAPI.getCustomSketcherPath).toBeDefined();
    });

    it("registers but doesn't unregister global PageBuilder API in the AP", () => {
      expect(window.KnimePageBuilderAPI).toBeDefined();
      expect(window.KnimePageBuilderAPI.currentJobId).toBeUndefined();
      expect(wrapper.vm.currentJobId).toBeUndefined();
      expect(window.KnimePageBuilderAPI.teardown(wrapper.currentJobId)).toBe(
        false,
      );
      wrapper.unmount();
      expect(window.KnimePageBuilderAPI).toBeDefined();
    });

    it("registers but doesn't unregister global PageBuilder API between pages if Job ID stays the same", async () => {
      let jobId = "1234-5678-9012-3456";
      let localWrapper = await createLocalWrapper(jobId);
      await flushPromises();

      expect(window.KnimePageBuilderAPI).toBeDefined();
      expect(localWrapper.vm.currentJobId).toBe(jobId);
      expect(window.KnimePageBuilderAPI.currentJobId).toBe(jobId);
      localWrapper.unmount();
      expect(window.KnimePageBuilderAPI).toBeDefined();
    });

    it("registers & unregisters global PageBuilder API when JobIDs change", async () => {
      let jobId = "1234-5678-9012-3456";
      let jobId2 = "0987-6543-2109-8765";
      let localWrapper = await createLocalWrapper(jobId);

      expect(window.KnimePageBuilderAPI).toBeDefined();
      expect(localWrapper.vm.currentJobId).toBe(jobId);
      expect(window.KnimePageBuilderAPI.currentJobId).toBe(jobId);

      localWrapper.vm.$store.commit("wizardExecution/setJobId", jobId2);

      expect(window.KnimePageBuilderAPI.currentJobId).toBe(jobId);
      expect(localWrapper.vm.currentJobId).toBe(jobId2);
      localWrapper.unmount();
      await flushPromises();
      expect(window.KnimePageBuilderAPI).toBeUndefined();
    });

    it("registers & unregisters global PageBuilder API when JobID changes to null from navigation", async () => {
      let jobId = "1234-5678-9012-3456";
      let jobId2 = null;
      let localWrapper = await createLocalWrapper(jobId);

      expect(window.KnimePageBuilderAPI).toBeDefined();
      expect(localWrapper.vm.currentJobId).toBe(jobId);
      expect(window.KnimePageBuilderAPI.currentJobId).toBe(jobId);

      localWrapper.vm.$store.commit("wizardExecution/setJobId", jobId2);

      expect(window.KnimePageBuilderAPI.currentJobId).toBe(jobId);
      expect(localWrapper.vm.currentJobId).toBe(jobId2);
      localWrapper.unmount();
      await flushPromises();
      expect(window.KnimePageBuilderAPI).toBeUndefined();
    });

    it("getPublishedData calls interactivity store", () => {
      let id = "selection-12345";
      window.KnimePageBuilderAPI.interactivityGetPublishedData(id);
      expect(interactivityConfig.getters.getPublishedData).toHaveBeenCalled();
      expect(mockGetPublishedData).toHaveBeenCalledWith(id);
    });

    it("getDefaultMountId calls settings store", () => {
      let id = window.KnimePageBuilderAPI.getDefaultMountId();
      expect(id).toBe("MOUNTIE");
    });

    it("getWorkflow calls wizardExecution store", () => {
      let workflow = window.KnimePageBuilderAPI.getWorkflow();
      expect(workflow).toBe("/some/path");
    });

    it("getRepository calls api store", () => {
      let config = { path: "/", filter: null };
      window.KnimePageBuilderAPI.getRepository(config);
      expect(apiConfig.getters.repository).toHaveBeenCalled();
      expect(mockGetRepository).toHaveBeenCalledWith(config);
    });

    it("getUser calls api store", () => {
      window.KnimePageBuilderAPI.getUser();
      expect(apiConfig.getters.user).toHaveBeenCalled();
      expect(mockGetUser).toHaveBeenCalled();
    });

    it("getDownloadLink calls api store", () => {
      let resourceId = "file-donwload";
      let nodeId = "0:0:7";
      window.KnimePageBuilderAPI.getDownloadLink({ resourceId, nodeId });
      expect(apiConfig.getters.downloadResourceLink).toHaveBeenCalled();
      expect(mockGetDownloadLink).toHaveBeenCalledWith({
        nodeId: "0:0:7",
        resourceId,
      });
    });

    it("getUploadLink calls api store", () => {
      let resourceId = "sample.txt";
      let nodeId = "0:0:7";
      window.KnimePageBuilderAPI.getUploadLink({ resourceId, nodeId });
      expect(apiConfig.getters.uploadResourceLink).toHaveBeenCalled();
      expect(mockGetUploadLink).toHaveBeenCalledWith({
        nodeId: "0:0:7",
        resourceId,
      });
    });

    it("getCustomSketcherPath calls settings store", () => {
      let path = window.KnimePageBuilderAPI.getCustomSketcherPath();
      expect(path).toBe("sample/sketcher/path/sketcher.html");
    });
  });
});
