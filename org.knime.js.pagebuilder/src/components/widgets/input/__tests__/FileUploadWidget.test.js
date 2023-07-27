import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";

import FileUploadWidget from "@/components/widgets/input/FileUploadWidget.vue";
import ErrorMessage from "@/components/widgets/baseElements/text/ErrorMessage.vue";
import sleep from "webapps-common/util/sleep";

const uploadResourceMock = vi
  .fn()
  .mockReturnValue(() =>
    Promise.resolve({ errorResponse: false, response: {} }),
  );
const cancelUploadResourceMock = vi.fn().mockReturnValue(() => {});
const file = { size: 1000, type: "image/png", name: "avatar.png" };
const event = {
  target: {
    files: [file],
  },
};

let storeConfig = {
  getters: {
    "api/uploadResource": uploadResourceMock,
    "api/cancelUploadResource": cancelUploadResourceMock,
  },
};

describe("FileUploadWidget.vue", () => {
  let props, store;

  beforeEach(() => {
    // we do this before each as beforeAll the mockReturn value is always the first set and cannot be changed
    store = createStore({
      modules: {
        api: storeConfig,
      },
    });

    props = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        customCSS: "",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          displayPossible: true,
          nodeErrorMessage: null,
          nodeWarnMessage: null,
          nodeAnnotation: "",
          nodeState: "executed",
          nodeName: "File Upload Widget",
        },
        javascriptLibraries: [
          "/js-lib/knime/service/knime_service_1_0_0.js",
          "/js-lib/jQuery/jquery-1.11.0.min.js",
          "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
          "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
          "/org/knime/js/base/node/input/fileupload/FileUpload.js",
        ],
        stylesheets: [
          "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "/js-lib/knime/service/knime.css",
          "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
          "/org/knime/js/base/util/quickform/quickformStyles.css",
        ],
        getViewValueMethodName: "value",
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.input.fileupload.FileUploadRepresentation",
          path: "/home/knime-server/server-repos/runtime/runtime_knime-rmi-30721",
          description: "Generated content\t\t\t",
          fileTypes: [],
        },
        viewValue: {
          "@class": "org.knime.js.base.node.input.fileupload.FileUploadValue",
        },
        initMethodName: "init",
        validateMethodName: "validate",
        setValidationErrorMethodName: "setValidationErrorMessage",
        namespace: "org_knime_js_base_node_input_fileupload",
      },
      nodeId: "5:0:22",
      isValid: true,
    };
  });

  it("renders", () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.vm.$store.getters["api/uploadResource"]).toBeDefined();
    expect(uploadResourceMock).toBeCalled();
    expect(wrapper.find(".show-bar").exists()).toBe(false);
    expect(wrapper.find(".vertical").exists()).toBe(false);
    expect(wrapper.find("p").text()).toBe("No file selected.");
  });

  it("triggers input on click", () => {
    let wrapper = mount(FileUploadWidget, {
      global: {
        mocks: {
          $store: store,
        },
      },
      props,
    });
    let clicked = false;
    wrapper.vm.$refs.input.addEventListener("click", () => {
      clicked = true;
    });
    wrapper.find(".upload-wrapper .button").trigger("click");
    expect(clicked).toBeTruthy();
  });

  it("uploads file correctly", async () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });

    expect(wrapper.vm.$data.localFileName).toBeNull();
    wrapper.vm.onChange(event);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.localFileName).toBe("avatar.png");
    expect(wrapper.find(".show-bar").exists()).toBe(true);
    expect(wrapper.find(".upload-wrapper p svg").exists()).toBe(false);
    wrapper.vm.setUploadProgress(2);
    expect(wrapper.find(".upload-wrapper button").text()).toBe("Cancel");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".progress-bar span").text()).toBe("2%");
    expect(wrapper.find(".progress-bar").attributes("style")).toBe(
      "width: 2%;",
    );
    wrapper.vm.setUploadProgress(100);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".show-bar").exists()).toBe(false);
    expect(wrapper.find(".upload-wrapper p svg").exists()).toBe(true);
    expect(wrapper.find(".upload-wrapper button").text()).toBe("Select file");
  });

  it("keeps current file in case upload gets canceled", () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });

    expect(wrapper.vm.$data.localFileName).toBeNull();
    wrapper.vm.onChange(event);
    expect(wrapper.vm.$data.localFileName).toBe("avatar.png");
    wrapper.vm.onChange({});
    expect(wrapper.vm.$data.localFileName).toBe("avatar.png");
  });

  it("invalidates if no input is given on second validate", () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props: {
        ...props,
        nodeConfig: {
          ...props.nodeConfig,
          viewRepresentation: {
            ...props.nodeConfig.viewRepresentation,
            path: "",
          },
        },
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: null,
      isValid: true,
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: "Input is required.",
      isValid: false,
    });
  });

  it("checks if still uploading", async () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });
    await wrapper.setData({ initialized: true });
    wrapper.vm.onChange(event);
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: "Upload still in progress.",
      isValid: false,
    });
  });

  it("checks for wrong file extension", async () => {
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props: {
        ...props,
        nodeConfig: {
          ...props.nodeConfig,
          viewRepresentation: {
            ...props.nodeConfig.viewRepresentation,
            fileTypes: [".pdf"],
          },
        },
        valuePair: {
          "@class":
            "org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue",
          fileName: "avatar.pdf",
          pathValid: false,
          path: "/Users/s/",
        },
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: null,
      isValid: true,
    });
    await wrapper.setProps({
      valuePair: {
        "@class":
          "org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue",
        fileName: "avatar.PDF",
        pathValid: false,
        path: "/Users/testUser/",
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: null,
      isValid: true,
    });
    await wrapper.setProps({
      valuePair: {
        "@class":
          "org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue",
        fileName: "avatar.png",
        pathValid: false,
        path: "/Users/testUser/",
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage:
        "The type of the selected file does not match the allowed file types (.pdf).",
      isValid: false,
    });
    await wrapper.setProps({
      nodeConfig: {
        ...props.nodeConfig,
        viewRepresentation: {
          ...props.nodeConfig.viewRepresentation,
          fileTypes: [".PDF"],
        },
      },
      valuePair: {
        "@class":
          "org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue",
        fileName: "avatar.pdf",
        pathValid: false,
        path: "/Users/testUser/",
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage: null,
      isValid: true,
    });
    await wrapper.setProps({
      valuePair: {
        "@class":
          "org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue",
        fileName: "avatar.png",
        pathValid: false,
        path: "/Users/testUser/",
      },
    });
    expect(wrapper.vm.validate()).toEqual({
      errorMessage:
        "The type of the selected file does not match the allowed file types (.PDF).",
      isValid: false,
    });
  });

  it("displays upload error message", async () => {
    let uploadErrorResourceMock = vi.fn().mockReturnValue({
      errorResponse: {
        cancelled: false,
      },
    });

    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });
    await wrapper.setData({ uploadAPI: uploadErrorResourceMock });
    wrapper.vm.onChange(event);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(ErrorMessage).props("error")).toBe(
      "Upload failed.",
    );
  });

  it("cancels upload correctly", async () => {
    let uploadErrorResourceMock = vi.fn().mockReturnValue({
      errorResponse: {
        cancelled: true,
      },
    });

    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });
    await wrapper.setData({ uploadAPI: uploadErrorResourceMock });

    wrapper.vm.onChange(event);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".upload-wrapper button").text()).toBe("Cancel");
    wrapper.find(".upload-wrapper button").trigger("click");
    await wrapper.vm.$nextTick();
    expect(cancelUploadResourceMock).toHaveBeenCalled();
    expect(wrapper.findComponent(ErrorMessage).props("error")).toBe(
      "Upload cancelled.",
    );
  });

  it("uploads files on the AP", async () => {
    let uploadResourceMock = vi.fn();
    window.KnimePageLoader = {
      /* empty mock simulates AP wrapper API */
    };
    let wrapper = mount(FileUploadWidget, {
      global: { mocks: { $store: store } },
      props,
    });
    await wrapper.setData({ uploadAPI: uploadResourceMock });
    await wrapper.vm.onChange({
      target: {
        files: [
          new File(
            [new Blob(["testing"], { type: "application/pdf" })],
            "test",
          ),
        ],
      },
    });

    // File operations needs non-zero time to complete (more than a tick).
    await sleep(50);

    expect(uploadResourceMock).not.toHaveBeenCalled();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: "5:0:22",
      type: "path",
      update: {
        "viewRepresentation.currentValue.fileName": "test",
        "viewRepresentation.currentValue.path":
          "data:application/octet-stream;base64,dGVzdGluZw==",
      },
    });
  });
});
