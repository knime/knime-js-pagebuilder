import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";

import * as interactiveConfig from "@/store/interactivity";

import InteractiveValueWidget from "@/components/widgets/interactive/InteractiveValueWidget.vue";
import Multiselect from "@/components/widgets/baseElements/selection/Multiselect.vue";
import SingleSelect from "@/components/widgets/baseElements/selection/SingleSelect.vue";
import Label from "webapps-common/ui/components/forms/Label.vue";
import Fieldset from "webapps-common/ui/components/forms/Fieldset.vue";

describe("InteractiveValueWidget.vue", () => {
  let props, store, context;

  beforeEach(() => {
    props = {
      nodeConfig: {
        "@class": "org.knime.js.core.JSONWebNode",
        initMethodName: "init",
        validateMethodName: "validate",
        nodeInfo: {},
        javascriptLibraries: [],
        stylesheets: [],
        setValidationErrorMethodName: "setValidationErrorMessage",
        namespace: "org_knime_js_base_node_quickform_filter_definition_value",
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.quickform.filter.definition.value.ValueFilterDefinitionRepresentation",
          tableID: "359ffa64-a233-4f2e-bf2a-c264a4048573",
          multipleValues: false,
          label: "Cluster Membership",
          disabled: false,
          filterID: "8eb44367-7be8-4837-8f6e-4de925c79a6a",
          limitNumberVisOptions: true,
          possibleValues: ["Cluster_0", "Cluster_1", "Cluster_2", "Cluster_3"],
          numberVisOptions: 10,
          column: "Cluster Membership",
          type: "List",
        },
        viewValue: {
          "@class":
            "org.knime.js.base.node.quickform.filter.definition.RangeFilterValue",
          filter: {
            type: "range",
            columns: [
              {
                type: "nominal",
                values: ["Cluster_0"],
                columnName: "Cluster Membership",
              },
            ],
            rows: null,
            id: "8eb44367-7be8-4837-8f6e-4de925c79a6a",
          },
        },
        customCSS: "",
        getViewValueMethodName: "getComponentValue",
      },
      nodeId: "3:0:52",
      isValid: false,
    };

    store = createStore({
      modules: { "pagebuilder/interactivity": interactiveConfig },
    });

    context = {
      global: {
        mocks: {
          $store: store,
        },
      },
    };
  });

  describe("singleSelect components", () => {
    it("renders SingleSelect", () => {
      let wrapper = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapper.isVisible()).toBeTruthy();
      expect(wrapper.findComponent(SingleSelect)).toBeTruthy();
    });

    it("uses correct label component", () => {
      let wrapperList = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapperList.findComponent(Label)).toBeTruthy();

      props.nodeConfig.viewRepresentation.type = "Checkboxes";
      let wrapperOther = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapperOther.findComponent(Fieldset)).toBeTruthy();
    });
  });

  describe("multiselect components", () => {
    it("renders Multiselect", () => {
      props.nodeConfig.viewRepresentation.multipleValues = true;
      let wrapper = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapper.isVisible()).toBeTruthy();
      expect(wrapper.findComponent(Multiselect)).toBeTruthy();
    });

    it("uses correct label component", () => {
      props.nodeConfig.viewRepresentation.multipleValues = true;
      let wrapperList = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapperList.findComponent(Label)).toBeTruthy();

      props.nodeConfig.viewRepresentation.type = "Radio buttons (vertical)";
      let wrapperOther = mount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapperOther.findComponent(Fieldset)).toBeTruthy();
    });
  });

  it("respects settings to disable the label", () => {
    let wrapperEnable = shallowMount(InteractiveValueWidget, {
      ...context,
      props,
    });
    expect(wrapperEnable.vm.label).toBe("Cluster Membership");

    props.nodeConfig.viewRepresentation.label = null;
    let wrapperDisable = shallowMount(InteractiveValueWidget, {
      ...context,
      props,
    });
    expect(wrapperDisable.vm.label).toBe("");
  });

  it("sends @updateWidget if child emits @input", () => {
    let wrapper = mount(InteractiveValueWidget, {
      ...context,
      props,
    });

    const testValue = ["VALUE2"];
    const comp = wrapper.findComponent(SingleSelect);
    comp.vm.$emit("update:modelValue", testValue);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      callback: expect.anything(),
      nodeId: props.nodeId,
      update: {
        "viewValue.filter.columns.0.values": testValue,
      },
    });
  });

  describe("validation", () => {
    it("is always valid get value method works", () => {
      let wrapper = shallowMount(InteractiveValueWidget, {
        ...context,
        props,
      });
      expect(wrapper.vm.validate().isValid).toBe(true);

      let wrapperBroken = shallowMount(InteractiveValueWidget, {
        ...context,
        props,
      });
      vi.spyOn(wrapperBroken.vm, "getValue").mockImplementation(() => {});
      expect(wrapperBroken.vm.validate().isValid).toBe(false);
    });
  });
});
