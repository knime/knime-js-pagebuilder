import { expect, describe, afterEach, it, vi, beforeAll } from "vitest";
import { createStore } from "vuex";
import { shallowMount } from "@vue/test-utils";

import WebNodeIFrame from "@/components/views/WebNodeIFrame.vue";
import AlertLocal from "@/components/ui/AlertLocal.vue";

import * as storeConfig from "@/store/pagebuilder";
import * as alertStoreConfig from "@/store/alert";
import { iframeResizer } from "iframe-resizer";

// extra mock to simulate a loaded view script
vi.mock(
  "@/components/views/injectedScripts/loadErrorHandler.js?raw",
  () => ({
    default: `"loadErrorHandler.js mock";
    foo = ["%NODEID%"];`,
  }),
  { virtual: true },
);
vi.mock(
  "@/components/views/injectedScripts/viewAlertHandler.js?raw",
  () => ({
    default: `"viewAlertHandler.js mock";
    foo = ["%NODEID%"];`,
  }),
  { virtual: true },
);
vi.mock(
  "@/components/views/injectedScripts/scriptLoader.js?raw",
  () => ({
    default: `"scriptLoader.js mock";
    foo = ["%RESOURCEBASEURL%", "%ORIGIN%", "%NAMESPACE%", "%NODEID%", "%LIBCOUNT%"];`,
  }),
  { virtual: true },
);
vi.mock("iframe-resizer", () => ({ iframeResizer: vi.fn() }));
vi.mock(
  "@/components/views/injectedScripts/messageListener.js?raw",
  () => ({ default: '"messageListener.js mock";' }),
  { virtual: true },
);
vi.mock(
  "iframe-resizer/js/iframeResizer.contentWindow.js?raw",
  () => ({ default: '"iframeResizer.js mock";' }),
  { virtual: true },
);

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
    mockUpload,
    wrapper;

  beforeAll(() => {
    storeConfig.actions.setWebNodeLoading = vi.fn();
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
        currentJobId: vi.fn().mockReturnValue(1),
      },
    };
    settingsConfig = {
      namespaced: true,
      state: () => ({
        defaultMountId: "MOUNTIE",
        "knime:access_token": "",
      }),
      mutations: {
        setSettings(state, { settings }) {
          Object.keys(state).forEach((key) => {
            if (settings.hasOwnProperty(key)) {
              state[key] = settings[key];
            }
          });
        },
      },
      getters: {
        getCustomSketcherPath: vi
          .fn()
          .mockReturnValue("sample/sketcher/path/sketcher.html"),
      },
    };
    store = createStore({
      modules: {
        pagebuilder: storeConfig,
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
    window.origin = window.location.origin;
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  it("renders", () => {
    wrapper = shallowMount(WebNodeIFrame, {
      ...context,
      props: {
        nodeId: "0:0:7",
      },
      attachTo: document.body,
    });
    expect(wrapper.html()).toBeTruthy();
  });

  describe("resource injection", () => {
    it("injects scripts and styles", () => {
      let iframeConfig = {
        attachTo: document.body,
        ...context,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            javascriptLibraries: ["foo/bar.js", "qux/baz.js"],
            stylesheets: ["bla.css", "narf.css"],
            customCSS: "body { background: red; }",
          },
          nodeId: "0:0:7",
        },
      };
      wrapper = shallowMount(WebNodeIFrame, iframeConfig);

      let html = wrapper.vm.document.documentElement.innerHTML;
      expect(html).toMatch("messageListener.js mock");
      expect(html).toMatch("scriptLoader.js mock");
      expect(html).toMatch("loadErrorHandler.js mock");
      expect(html).toMatch("viewAlertHandler.js mock");
      expect(html).toMatch(
        `["http://baseurl.test.example/", "${window.origin}", "knimespace", "0:0:7", 2]`,
      );
      expect(html).toMatch(
        '<script src="http://baseurl.test.example/foo/bar.js" ' +
          'onload="knimeLoader(true)" onerror="knimeLoader(false)"',
      );
      expect(html).toMatch(
        '<script src="http://baseurl.test.example/qux/baz.js" ' +
          'onload="knimeLoader(true)" onerror="knimeLoader(false)"',
      );
      expect(html).toMatch(
        "knimeService.resourceBaseUrl = 'http://baseurl.test.example/';",
      );
      expect(html).toMatch(
        '<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/bla.css">',
      );
      expect(html).toMatch(
        '<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/narf.css">',
      );
      expect(html).toMatch("<style>body { background: red; }</style>");

      // check if iframe resizer was also injected
      iframeConfig.props.viewConfig.resizeMethod = "viewLowestElement";
      wrapper = shallowMount(WebNodeIFrame, iframeConfig);
      html = wrapper.vm.document.documentElement.innerHTML;
      expect(html).toMatch("iframeResizer.js mock");
    });

    it("handles resource loading", () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            initMethodName: "initMe",
            viewRepresentation: { dummyRepresentation: true },
            viewValue: { dummyValue: true },
          },
          nodeId: "0:0:7",
        },
      });

      const postMessageSpy = vi.spyOn(
        wrapper.vm.document.defaultView,
        "postMessage",
      );

      // fake resource loading
      // hack because jsdom does not implement the `origin` property, see https://github.com/jsdom/jsdom/issues/1260
      wrapper.vm.messageFromIframe({
        origin: window.origin,
        data: { nodeId: "0:0:7", type: "load" },
      });

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          nodeId: "0:0:7",
          namespace: "knimespace",
          initMethodName: "initMe",
          viewRepresentation: JSON.stringify({ dummyRepresentation: true }),
          viewValue: JSON.stringify({ dummyValue: true }),
          type: "init",
        },
        window.origin,
      );
    });

    it("sets view loading on store", () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            initMethodName: "initMe",
            viewRepresentation: { dummyRepresentation: true },
            viewValue: { dummyValue: true },
          },
          nodeId: "0:0:7",
        },
      });
      // before resource loading
      let calls = storeConfig.actions.setWebNodeLoading.mock.calls;
      let lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toMatchObject({ nodeId: "0:0:7", loading: true });

      // mock resource loading done
      wrapper.vm.messageFromIframe({
        origin: window.origin,
        data: { nodeId: "0:0:7", type: "load" },
      });

      calls = storeConfig.actions.setWebNodeLoading.mock.calls;
      lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toMatchObject({ nodeId: "0:0:7", loading: false });
    });
  });

  it("passes sizing config to iframe-resizer", async () => {
    let viewConfig = {
      nodeID: "0:0:7",
      resizeMethod: "viewLowestElement",
      autoResize: true,
      scrolling: false,
      sizeHeight: true,
      resizeTolerance: 10,
      minWidth: 10,
      maxWidth: 100,
      minHeight: 5,
      maxHeight: 50,
    };
    wrapper = shallowMount(WebNodeIFrame, {
      ...context,
      attachTo: document.body,
      props: {
        viewConfig,
        nodeConfig: {
          namespace: "knimespace",
        },
        nodeId: "0:0:7",
      },
    });
    // wait for document + iframe creation + 'load' callback
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.autoHeight).toBe(true);
    expect(iframeResizer).toHaveBeenCalledWith(
      expect.objectContaining({
        autoResize: viewConfig.autoResize,
        scrolling: viewConfig.scrolling,
        heightCalculationMethod: "lowestElement",
        sizeHeight: viewConfig.sizeHeight,
        tolerance: viewConfig.resizeTolerance,
        minWidth: viewConfig.minWidth,
        maxWidth: viewConfig.maxWidth,
        minHeight: viewConfig.minHeight,
        maxHeight: viewConfig.maxHeight,
      }),
      expect.anything(),
    );
  });

  describe("view value retrieval", () => {
    it("handles getValue call", () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            getViewValueMethodName: "value",
          },
          nodeId: "0:0:7",
        },
      });
      vi.spyOn(wrapper.vm.document.defaultView, "postMessage");
      wrapper.vm.getValue();
      expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith(
        {
          nodeId: "0:0:7",
          namespace: "knimespace",
          getViewValueMethodName: "value",
          type: "getValue",
        },
        window.origin,
      );
    });

    it("resolves getValue promise", () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            getViewValueMethodName: "value",
          },
          nodeId: "0:0:7",
        },
      });
      let valuePromise = wrapper.vm.getValue();

      // fake value returned
      // hack because jsdom does not implement the `origin` property, see https://github.com/jsdom/jsdom/issues/1260
      wrapper.vm.messageFromIframe({
        origin: window.origin,
        data: { nodeId: "0:0:7", type: "getValue", value: { integer: 42 } },
      });

      return expect(valuePromise).resolves.toStrictEqual({
        nodeId: "0:0:7",
        value: { integer: 42 },
      });
    });

    it("rejects getValue promise on error", () => {
      wrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: {
            nodeID: "0:0:7",
          },
          nodeConfig: {
            namespace: "knimespace",
            getViewValueMethodName: "value",
          },
          nodeId: "0:0:7",
        },
      });
      let valuePromise = wrapper.vm.getValue();
      let errorMessage = "some error message";

      // fake error returned
      wrapper.vm.messageFromIframe({
        origin: window.origin,
        data: { nodeId: "0:0:7", type: "getValue", error: errorMessage },
      });

      expect(wrapper.vm.alert).toStrictEqual({
        level: "error",
        message: "some error message",
        nodeInfo: expect.undefined,
        type: "error",
      });
      return expect(valuePromise).rejects.toStrictEqual(
        new Error(errorMessage),
      );
    });
  });

  describe("webNodeIFrame alerts", () => {
    let nodeId = "0:0:7";

    it("manages its own alert state", () => {
      let localWrapper = shallowMount(WebNodeIFrame, {
        ...context,
        attachTo: document.body,
        props: {
          viewConfig: { nodeID: nodeId },
          nodeConfig: {
            namespace: "knimespace",
            initMethodName: "init",
            setValidationErrorMethodName: "setValidationError",
            viewRepresentation: {},
            viewValue: {},
            nodeInfo: {},
          },
          nodeId,
        },
      });
      let alertData = {
        nodeId,
        message: "test",
        level: "error",
      };

      expect(localWrapper.vm.alert).toBeNull();
      expect(localWrapper.vm.displayAlert).toBe(false);
      localWrapper.vm.handleAlert(alertData);
      expect(localWrapper.vm.alert).toStrictEqual({
        ...alertData,
        nodeInfo: {},
        type: "error",
      });
      expect(localWrapper.vm.displayAlert).toBe(true);
      localWrapper.vm.closeAlert(true);
      expect(localWrapper.vm.displayAlert).toBe(false);
      expect(localWrapper.vm.alert).toBeNull();
      localWrapper.unmount();
    });

    it("handles show alert events", () => {
      let showAlertMock = vi.fn();
      let localWrapper = shallowMount(WebNodeIFrame, {
        global: {
          mocks: {
            $store: createStore({
              modules: {
                pagebuilder: storeConfig,
                "pagebuilder/interactivity": interactivityConfig,
                api: apiConfig,
                settings: settingsConfig,
                wizardExecution: wizardConfig,
                "pagebuilder/alert": {
                  ...alertStoreConfig,
                  actions: {
                    ...alertStoreConfig.actions,
                    showAlert: showAlertMock,
                  },
                },
              },
            }),
          },
        },
        attachTo: document.body,
        props: {
          viewConfig: { nodeID: nodeId },
          nodeConfig: {
            namespace: "knimespace",
            initMethodName: "init",
            setValidationErrorMethodName: "setValidationError",
            viewRepresentation: {},
            viewValue: {},
            nodeInfo: {},
          },
          nodeId,
        },
      });

      let alertData = {
        nodeId,
        message: "test",
      };

      localWrapper.vm.handleAlert(alertData);
      expect(localWrapper.vm.alert).toStrictEqual({
        ...alertData,
        nodeInfo: {},
        type: "warn",
      });
      localWrapper.findComponent(AlertLocal).trigger("showAlert");
      expect(showAlertMock).toHaveBeenCalledWith(expect.anything(), {
        ...localWrapper.vm.alert,
        callback: localWrapper.vm.closeAlert,
      });
      localWrapper.unmount();
    });
  });
});
