import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";

import Column from "@/components/layout/Column.vue";
import NodeView from "@/components/layout/NodeView.vue";
import * as storeConfig from "@/store/pagebuilder";
// this is required because the Row component is imported asynchronously in Column, cf.
// https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
const Row = {
  name: "Row",
  template: '<b class="row" />',
  props: ["rowConfig"],
};

const stubs = {
  Row,
};

describe("Column.vue", () => {
  let context;

  const getWizardPageContent = ({
    webNodes,
    nodeViews,
    webNodePageConfiguration,
  } = {}) => ({
    webNodes: webNodes || {
      "1:0:1:0:0:7": {
        foo: "bar",
        viewRepresentation: {
          "@class": "testing.notWidget",
        },
        nodeInfo: {
          displayPossible: true,
        },
      },
    },
    nodeViews: nodeViews || {},
    webNodePageConfiguration: webNodePageConfiguration || {
      projectRelativePageIDSuffix: "1:0:1",
    },
  });

  const createContext = ({
    webNodes,
    nodeViews,
    webNodePageConfiguration,
  } = {}) => {
    let store = createStore({ modules: { pagebuilder: storeConfig } });
    store.commit("pagebuilder/setPage", {
      wizardPageContent: getWizardPageContent({
        webNodes,
        nodeViews,
        webNodePageConfiguration,
      }),
    });

    return {
      global: {
        mocks: {
          $store: store,
        },
        stubs,
      },
      props: {
        columnConfig: {
          widthXS: 6,
          additionalClasses: [],
          additionalStyles: [],
        },
      },
    };
  };

  beforeAll(() => {
    context = createContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without classes and styles", () => {
    const wrapper = shallowMount(Column, context);
    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.attributes("class")).toBe("col col-6");
    expect(wrapper.attributes("style")).toBe("");
  });

  it("renders with classes and styles", () => {
    context.props.columnConfig.additionalClasses = ["class1", "class2"];
    context.props.columnConfig.additionalStyles = [
      "color: red;",
      "border: 1px solid green;",
    ];
    const wrapper = shallowMount(Column, context);
    expect(wrapper.attributes("class")).toBe("col col-6 class1 class2");
    expect(wrapper.attributes("style")).toBe(
      "color: red; border: 1px solid green;",
    );
  });

  it("renders responsive grid classes", () => {
    context.props.columnConfig = {
      widthXS: 12,
      widthMD: 11,
      widthLG: 10,
      widthXL: 9,
      widthSM: 8,
      additionalClasses: ["class1", "class2"],
    };
    const wrapper = shallowMount(Column, context);
    expect(wrapper.attributes("class")).toBe(
      "col col-12 col-sm-8 col-md-11 col-lg-10 col-xl-9 class1 class2",
    );
  });

  it("renders default responsive grid class if no width defined", () => {
    context.props.columnConfig = {};
    const wrapper = shallowMount(Column, context);
    expect(wrapper.attributes("class")).toBe("col col-12");
  });

  it("renders views", () => {
    let content = [
      {
        type: "view",
        nodeID: "9:0:4",
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    const [views, rows, divs] = [
      wrapper.findAllComponents(NodeView),
      wrapper.findAllComponents(Row),
      wrapper.find("div").findAll("div"),
    ];
    expect(views.length).toBe(1);
    expect(views.at(0).props("viewConfig")).toStrictEqual(content[0]);
    expect(rows.length).toBe(0);
    expect(divs.length).toBe(0);
  });

  it("wraps multiple views", () => {
    let content = [
      {
        type: "view",
        nodeID: "9:0:4",
      },
      {
        type: "JSONLayoutViewContent",
        nodeID: "9:0:5",
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    let [views, rows, divs] = [
      wrapper.findAllComponents(NodeView),
      wrapper.findAllComponents(Row),
      wrapper.find("div").findAll("div"),
    ];
    expect(views.length).toBe(0);
    expect(rows.length).toBe(2);
    rows.forEach((row, rowInd) => {
      expect(row.props("rowConfig")).toStrictEqual({
        type: "JSONLayoutRow",
        additionalStyles: [],
        additionalClasses: [],
        columns: [
          {
            content: [content[rowInd]],
            widthXS: 12,
            additionalStyles: [],
            additionalClasses: [],
          },
        ],
      });
    });
    expect(divs.length).toBe(0);
  });

  it("renders child rows", () => {
    let content = [
      {
        type: "row",
        dummy: "dummy",
      },
      {
        type: "JSONLayoutRow",
        foo: "bar",
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    const [views, rows, divs] = [
      wrapper.findAllComponents(NodeView),
      wrapper.findAllComponents(Row),
      wrapper.find("div").findAll("div"),
    ];
    expect(views.length).toBe(0);
    expect(rows.length).toBe(2);
    expect(rows.at(0).props("rowConfig")).toEqual({
      type: "row",
      dummy: "dummy",
    });
    expect(rows.at(1).props("rowConfig")).toEqual({
      type: "JSONLayoutRow",
      foo: "bar",
    });
    expect(divs.length).toBe(0);
  });

  it("renders nested layouts", () => {
    let content = [
      {
        type: "nestedLayout",
        layout: {
          rows: [
            {
              type: "row",
              dummy: "dummy",
            },
            {
              type: "row",
              foo: "bar",
            },
          ],
        },
      },
      {
        type: "JSONNestedLayout",
        layout: {
          rows: [
            {
              type: "JSONLayoutRow",
              baz: "qux",
            },
          ],
        },
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    const [views, rows, divs] = [
      wrapper.findAllComponents(NodeView),
      wrapper.findAllComponents(Row),
      wrapper.find("div").findAll("div"),
    ];
    expect(views.length).toBe(0);
    expect(rows.length).toBe(3);
    expect(rows.at(0).props("rowConfig")).toEqual({
      type: "row",
      dummy: "dummy",
    });
    expect(rows.at(1).props("rowConfig")).toEqual({ type: "row", foo: "bar" });
    expect(rows.at(2).props("rowConfig")).toEqual({
      type: "JSONLayoutRow",
      baz: "qux",
    });
    expect(divs.length).toBe(0);
  });

  it("does not render nested layouts which are missing", () => {
    let content = [
      {
        type: "nestedLayout",
        layout: null,
      },
      {
        type: "JSONNestedLayout",
        layout: {
          rows: [
            {
              type: "JSONLayoutRow",
              baz: "qux",
            },
          ],
        },
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    const rows = wrapper.findAllComponents(Row);
    expect(rows.length).toBe(1);
    expect(rows.at(0).props("rowConfig")).toEqual({
      type: "JSONLayoutRow",
      baz: "qux",
    });
  });

  it("renders HTML", () => {
    let html = "<span>foo</span>";
    let html2 = "<span>bar</span>";
    context.props.columnConfig = {
      content: [
        {
          type: "html",
          value: html,
        },
        {
          type: "JSONLayoutHTMLContent",
          value: html2,
        },
      ],
    };
    const wrapper = shallowMount(Column, context);

    const [views, rows, divs] = [
      wrapper.findAllComponents(NodeView),
      wrapper.findAllComponents(Row),
      wrapper.find("div").findAll("div"),
    ];
    expect(views.length).toBe(0);
    expect(rows.length).toBe(0);
    expect(divs.length).toBe(2);
    expect(divs.at(0).html()).toContain(html);
    expect(divs.at(1).html()).toContain(html2);
  });

  it("always re-renders NodeView components", async () => {
    // this is important so the iframe of NodeViewIFrame gets unmounted and re-created correctly

    let content = [
      {
        type: "view",
        nodeID: "9:0:4",
      },
    ];
    context.props.columnConfig = { content };
    const wrapper = shallowMount(Column, context);

    let view1 = wrapper.findComponent(NodeView).element;

    await wrapper.setProps({ columnConfig: { content } });

    let view2 = wrapper.findComponent(NodeView).element;

    expect(view1).not.toBe(view2);
  });

  it("always renders column without col padding if no web node is present", () => {
    const wizardPageContent = getWizardPageContent();
    wizardPageContent.nodeViews = {};
    wizardPageContent.webNodes = { SINGLE: {} };
    context.global.mocks.$store.commit("pagebuilder/setPage", {
      wizardPageContent,
    });
    const wrapper = shallowMount(Column, context);
    expect(wrapper.attributes("class").includes("data-app")).toBeFalsy();
  });
});
