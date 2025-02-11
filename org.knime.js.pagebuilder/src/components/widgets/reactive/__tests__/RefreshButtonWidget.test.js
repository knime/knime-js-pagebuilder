import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";

import { Button, Label } from "@knime/components";

import ErrorMessage from "@/components/widgets/baseElements/text/ErrorMessage.vue";
import RefreshButtonWidget from "@/components/widgets/reactive/RefreshButtonWidget.vue";
import * as storeConfig from "@/store/pagebuilder";

describe("RefreshButtonWidget.vue", () => {
  let props, store, context;

  beforeAll(() => {
    store = createStore({ modules: { pagebuilder: storeConfig } });

    context = {
      global: {
        mocks: {
          $store: store,
        },
      },
    };
  });

  beforeEach(() => {
    props = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        stylesheets: [
          "js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
          "js-lib/knime/service/knime.css",
        ],
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewRepresentation",
          buttonText: "Imma button!",
          description: "Imma description!",
          label: "Imma label!",
          defaultValue: {
            "@class":
              "org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewValue",
            refreshCounter: 7,
            refreshTimestamp: "",
          },
          currentValue: {
            "@class":
              "org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewValue",
            refreshCounter: 7,
            refreshTimestamp: "",
          },
        },
        customCSS: "",
        initMethodName: "init",
        validateMethodName: "validate",
        setValidationErrorMethodName: "setValidationErrorMessage",
        javascriptLibraries: [
          "js-lib/knime/service/knime_service_1_0_0.js",
          "org/knime/js/base/node/widget/reactive/refresh/refreshButtonWidget.js",
        ],
        getViewValueMethodName: "value",
        nodeInfo: {
          "@class": "org.knime.js.core.JSONWebNodeInfo",
          nodeAnnotation: null,
          nodeState: null,
          nodeName: "Single Node Page",
          displayPossible: true,
          nodeErrorMessage: null,
          nodeWarnMessage: null,
        },
        namespace: "knimeRefreshButtonWidget",
      },
      nodeId: "13:0:12",
      valuePair: {
        "@class":
          "org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewValue",
        refreshCounter: 7,
        refreshTimestamp: "",
      },
    };
  });

  it("renders", () => {
    let wrapper = mount(RefreshButtonWidget, {
      ...context,
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.findComponent(Label).text()).toContain("Imma label!");
    expect(wrapper.findComponent(Label).attributes("title")).toBe(
      "Imma description!",
    );
    expect(wrapper.find(".refresh-button").text()).toBe("Imma button!");
  });

  it("has no error message when valid", () => {
    let wrapper = mount(RefreshButtonWidget, {
      ...context,
      props,
    });
    expect(wrapper.findComponent(ErrorMessage).text()).toBe("");
  });

  it("has default error message", () => {
    const errorMessage = "Something went wrong.";
    let wrapper = mount(RefreshButtonWidget, {
      ...context,
      props: {
        ...props,
        errorMessage,
      },
    });
    expect(wrapper.findComponent(ErrorMessage).text()).toBe(errorMessage);
  });

  it("has a reactive counter", () => {
    let wrapper = mount(RefreshButtonWidget, { ...context, props });

    expect(wrapper.vm.counter).toBe(7);
    wrapper.vm.onChange();
    expect(wrapper.vm.counter).toBe(8);
  });

  it("has a reactive timestamp", () => {
    let wrapper = mount(RefreshButtonWidget, { ...context, props });

    const initTimeStamp = wrapper.vm.date;

    expect(wrapper.vm.date).toBeInstanceOf(Date);
    expect(wrapper.vm.date).toStrictEqual(initTimeStamp);

    wrapper.vm.onChange();

    const updatedTimeStamp = wrapper.vm.date;
    expect(wrapper.vm.date).toStrictEqual(updatedTimeStamp);
    expect(updatedTimeStamp !== initTimeStamp).toBeTruthy();
  });

  it("emits an updateWidget event on click", async () => {
    let wrapper = mount(RefreshButtonWidget, { ...context, props });
    await wrapper.find(".refresh-button").trigger("click");

    const counter = wrapper.vm.counter;
    const timeStamp = wrapper.vm.date.toISOString();

    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: "13:0:12",
      update: {
        "viewRepresentation.currentValue.refreshCounter": counter,
        "viewRepresentation.currentValue.refreshTimestamp": timeStamp,
      },
    });
  });

  it("disables the button when nodes are re-executing", async () => {
    let wrapper = mount(RefreshButtonWidget, { ...context, props });
    expect(wrapper.vm.isExecuting).toBeFalsy();
    await wrapper.vm.$store.dispatch("pagebuilder/setNodesReExecuting", [
      "13:0:12",
    ]);
    expect(wrapper.vm.isExecuting).toBeTruthy();
    expect(
      wrapper.findComponent(Button).element.hasAttributes("disabled"),
    ).toBeTruthy();
  });
});
