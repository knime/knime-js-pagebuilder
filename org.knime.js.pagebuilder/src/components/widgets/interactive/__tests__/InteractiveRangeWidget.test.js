import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";

import * as interactiveConfig from "@/store/interactivity";

import InteractiveRangeWidget from "@/components/widgets/interactive/InteractiveRangeWidget.vue";
import SliderWidget from "@/components/widgets/input/SliderWidget.vue";

describe("InteractiveRangeWidget.vue", () => {
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
        namespace: "knimeQuickformFilterSlider",
        viewRepresentation: {
          "@class":
            "org.knime.js.base.node.quickform.filter.definition.rangeslider.RangeSliderFilterRepresentation",
          label: "2nd",
          disabled: false,
          tableId: "359ffa64-a233-4f2e-bf2a-c264a4048573",
          columnName: "Universe_1_1",
          filterId: "5052b399-1bf5-405a-8e7e-b2175a1382b6",
          sliderSettings: {
            "@class": "org.knime.js.core.settings.slider.SliderSettings",
            behaviour: "drag-tap",
            fix: [false, true, false],
            range: {
              min: [0],
              max: [1],
            },
            start: [0, 1],
            pips: {
              "@class": "org.knime.js.core.settings.slider.SliderPipsSettings",
              density: 3,
              format: {
                "@class":
                  "org.knime.js.core.settings.numberFormat.NumberFormatSettings",
                decimals: 2,
                negative: "-",
                mark: ".",
              },
              mode: "range",
            },
            direction: "ltr",
            orientation: "horizontal",
            tooltips: [
              {
                decimals: 2,
                negative: "-",
                mark: ".",
              },
              {
                decimals: 2,
                negative: "-",
                mark: ".",
              },
            ],
          },
        },
        viewValue: {
          "@class":
            "org.knime.js.base.node.quickform.filter.definition.RangeFilterValue",
          filter: {
            type: "range",
            columns: [
              {
                type: "numeric",
                maximumInclusive: true,
                minimumInclusive: true,
                maximum: 1,
                minimum: 0,
                columnName: "Universe_1_1",
              },
            ],
            rows: null,
            id: "5052b399-1bf5-405a-8e7e-b2175a1382b6",
          },
        },
        customCSS: "",
        getViewValueMethodName: "value",
      },
      nodeId: "3:0:52",
      isValid: true,
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

  it("renders the SliderWidget", () => {
    let wrapper = mount(InteractiveRangeWidget, {
      ...context,
      props,
    });
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.findComponent(SliderWidget)).toBeTruthy();
  });

  it("handles range slider (2 value) widgets", () => {
    let wrapper = mount(InteractiveRangeWidget, {
      ...context,
      props,
    });
    expect(wrapper.vm.isRangeSlider).toBe(true);
    expect(wrapper.vm.value).toStrictEqual([0, 1]);
  });

  it("handles single value slider widgets", () => {
    props.nodeConfig.viewValue.filter.columns[0].minimum = "-Infinity";
    let wrapper = mount(InteractiveRangeWidget, {
      ...context,
      props,
    });
    expect(wrapper.vm.isRangeSlider).toBe(false);
    expect(wrapper.vm.value).toStrictEqual({
      double: 1,
    });
  });

  it("modifies and propagates @updateWidget if child emits @updateWidget", () => {
    // test multivalue update
    let wrapper = shallowMount(InteractiveRangeWidget, {
      ...context,
      props,
    });
    const NEW_MIN = 0.25;
    const NEW_MAX = 0.25;
    const testUpdate = {
      value: [NEW_MIN, NEW_MAX],
    };
    wrapper.findComponent(SliderWidget).vm.$emit("updateWidget", testUpdate);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      callback: expect.anything(),
      nodeId: props.nodeId,
      update: {
        "viewValue.filter.columns.0.minimum": NEW_MIN,
        "viewValue.filter.columns.0.maximum": NEW_MAX,
      },
    });
    // test single value update
    props.nodeConfig.viewValue.filter.columns[0].minimum = "-Infinity";
    let wrapper1 = shallowMount(InteractiveRangeWidget, {
      ...context,
      props,
    });
    const testUpdate1 = {
      value: NEW_MAX,
    };
    wrapper1.findComponent(SliderWidget).vm.$emit("updateWidget", testUpdate1);
    expect(wrapper1.emitted("updateWidget")).toBeTruthy();
    expect(wrapper1.emitted("updateWidget")[0][0]).toStrictEqual({
      callback: expect.anything(),
      nodeId: props.nodeId,
      update: {
        "viewValue.filter.columns.0.maximum": NEW_MAX,
      },
    });
  });

  it("rounds values when returning the value with the getValue method", () => {
    const originalMaximum = 0.9876543210123;
    const originalMinimum = 0.0123456789098;
    let highPrecisionNodeConfig = JSON.parse(JSON.stringify(props));
    highPrecisionNodeConfig.nodeConfig.viewValue.filter.columns[0].maximum =
      originalMaximum;
    highPrecisionNodeConfig.nodeConfig.viewValue.filter.columns[0].minimum =
      originalMinimum;
    let wrapper = shallowMount(InteractiveRangeWidget, {
      ...context,
      props: highPrecisionNodeConfig,
    });
    let currentValue = wrapper.vm.getValue();
    expect(currentValue.filter.columns[0].maximum < originalMaximum).toBe(true);
    expect(currentValue.filter.columns[0].minimum > originalMinimum).toBe(true);
    expect(currentValue.filter.columns[0].maximum).toBe(0.9876543);
    expect(currentValue.filter.columns[0].minimum).toBe(0.0123457);
  });

  describe("validation", () => {
    it("is always valid get value method works", () => {
      let wrapper = shallowMount(InteractiveRangeWidget, {
        ...context,
        props,
      });
      expect(wrapper.vm.validate().isValid).toBe(true);

      let wrapperBroken = shallowMount(InteractiveRangeWidget, {
        ...context,
        props,
      });
      vi.spyOn(wrapperBroken.vm, "getValue").mockImplementation(() => {});
      expect(wrapperBroken.vm.validate().isValid).toBe(false);
    });
  });
});
