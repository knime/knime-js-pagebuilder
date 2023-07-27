import { expect, describe, beforeEach, it, vi } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";

import SliderWidget from "@/components/widgets/input/SliderWidget.vue";
import Slider from "@/components/widgets/baseElements/input/Slider.vue";
import ErrorMessage from "@/components/widgets/baseElements/text/ErrorMessage.vue";

describe("SliderWidget.vue", () => {
  let nodeConfig, nodeId, isValid, wrapper;

  beforeEach(() => {
    nodeConfig = {
      "@class": "org.knime.js.core.JSONWebNode",
      nodeInfo: {
        "@class": "org.knime.js.core.JSONWebNodeInfo",
        nodeState: "executed",
        nodeAnnotation: "",
        nodeErrorMessage: null,
        nodeWarnMessage: null,
        displayPossible: true,
        nodeName: "Slider Widget",
      },
      namespace: "knimeSliderWidget",
      validateMethodName: "validate",
      setValidationErrorMethodName: "setValidationErrorMessage",
      viewRepresentation: {
        "@class":
          "org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation",
        sliderSettings: {
          "@class": "org.knime.js.core.settings.slider.SliderSettings",
          connect: [false, false],
          tooltips: [
            {
              prefix: "$",
              negative: "-",
              thousand: ",",
              decimals: 2,
              postfix: "_",
              mark: ".",
              negativeBefore: "-",
            },
          ],
          pips: {
            "@class": "org.knime.js.core.settings.slider.SliderPipsSettings",
            format: {
              "@class":
                "org.knime.js.core.settings.numberFormat.NumberFormatSettings",
              negative: "-",
              decimals: 2,
              mark: ".",
            },
            mode: "positions",
            values: [0, 25, 50, 75, 100],
            stepped: false,
            density: 3,
          },
          direction: "ltr",
          orientation: "vertical",
          range: {
            min: [5],
            max: [25],
          },
          start: [5],
        },
        useCustomMax: true,
        useCustomMin: true,
        customMax: 100,
        customMin: 0,
        defaultValue: {
          "@class": "org.knime.js.base.node.base.input.slider.SliderNodeValue",
          double: 5,
        },
        description: "Enter Description",
        required: true,
        label: "Testing Slider",
        currentValue: {
          "@class": "org.knime.js.base.node.base.input.slider.SliderNodeValue",
          double: 5,
        },
      },
      initMethodName: "init",
      getViewValueMethodName: "value",
      javascriptLibraries: [
        "/js-lib/knime/service/knime_service_1_0_0.js",
        "/js-lib/jQuery/jquery-1.11.0.min.js",
        "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
        "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
        "/js-lib/wNumb/wNumb.js",
        "/js-lib/noUiSlider/12_1_0/nouislider.min.js",
        "/org/knime/js/base/node/widget/input/slider/sliderWidget.js",
      ],
      viewValue: null,
      customCSS: "",
      stylesheets: [
        "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
        "/js-lib/knime/service/knime.css",
        "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
        "/org/knime/js/base/util/quickform/quickformStyles.css",
        "/js-lib/noUiSlider/12_1_0/nouislider.min.css",
        "/org/knime/js/base/node/widget/input/slider/sliderWidget.css",
      ],
    };
    nodeId = "id1";
    isValid = true;
    wrapper = shallowMount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
        valuePair: nodeConfig.viewRepresentation.currentValue,
      },
    });
  });

  it("renders", () => {
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it("has a Slider component", () => {
    expect(wrapper.findComponent(Slider)).toBeTruthy();
  });

  it("has correct computed properties", () => {
    expect(wrapper.vm.viewRep).toStrictEqual(nodeConfig.viewRepresentation);
    expect(wrapper.vm.sliderSettings).toStrictEqual(
      nodeConfig.viewRepresentation.sliderSettings,
    );

    // tooltip format and marks and labels tested separately
    expect(wrapper.vm.label).toBe("Testing Slider");
    expect(wrapper.vm.min).toBe(5);
    expect(wrapper.vm.max).toBe(25);
    expect(wrapper.vm.value).toBe(5);
    expect(wrapper.vm.direction).toBe("ttb");
    expect(wrapper.vm.stepSize).toBe(0.0000001);
    expect(wrapper.vm.height).toBe(533);
    expect(wrapper.vm.tooltips).toStrictEqual([{ tooltip: "always" }]);
    expect(wrapper.vm.connect).toBe("none");
  });

  it("ignores connect settings if missing", async () => {
    nodeConfig.viewRepresentation.sliderSettings.connect = null;
    await wrapper.setProps({
      nodeConfig: { ...nodeConfig },
    });

    expect(wrapper.vm.connect).toBeNull();
  });

  it("rounds values which exceed the supported precision", async () => {
    nodeConfig.viewRepresentation.sliderSettings.range.min = [0.000000001];
    nodeConfig.viewRepresentation.sliderSettings.range.max = [0.999999999];
    await wrapper.setProps({
      nodeConfig: { ...nodeConfig },
    });

    expect(wrapper.vm.min).toBe(0);
    expect(wrapper.vm.max).toBe(1);
  });

  it("can accept an array of values", async () => {
    await wrapper.setProps({
      valuePair: [0, 1],
    });

    expect(wrapper.vm.value).toStrictEqual([0, 1]);
  });

  it("sets height if slider is vertical", async () => {
    expect(wrapper.vm.height).toBe(533);

    nodeConfig.viewRepresentation.sliderSettings.orientation = "horizontal";

    await wrapper.setProps({
      nodeConfig: { ...nodeConfig },
    });

    expect(wrapper.vm.height).toBeNull();
  });

  it("creates tooltip formatting function if present", async () => {
    expect(typeof wrapper.vm.tooltipFormat[0]).toBe("function");
    expect(wrapper.vm.tooltipFormat[0](1.234)).toBe("$1.23_");

    nodeConfig.viewRepresentation.sliderSettings.tooltips = [true];
    await wrapper.setProps({
      nodeConfig: { ...nodeConfig },
    });

    expect(typeof wrapper.vm.tooltipFormat[0]).toBe("function");
    expect(wrapper.vm.tooltipFormat[0](1.234, {})).toBe("1.234");
  });

  it("properly disables tooltips for multiple handles", async () => {
    nodeConfig.viewRepresentation.sliderSettings.tooltips = [
      false,
      {
        prefix: "$",
        negative: "-",
        thousand: ",",
        decimals: 2,
        postfix: "_",
        mark: ".",
        negativeBefore: "-",
      },
    ];
    await wrapper.setProps({
      nodeConfig: { ...nodeConfig },
    });
    expect(wrapper.vm.tooltips).toStrictEqual([
      { tooltip: "none" },
      { tooltip: "always" },
    ]);
    expect(wrapper.vm.tooltipFormat).toStrictEqual([
      expect.any(Function),
      expect.any(Function),
    ]);
    expect(wrapper.vm.tooltipFormat[0](1.234, {})).toBe("1.234");
    expect(wrapper.vm.tooltipFormat[1](1.234)).toBe("$1.23_");
  });

  // determines if the slider bar is filled, half (w/ orientation) or none
  it('correctly interprets the "none" connect configuration', () => {
    expect(wrapper.vm.connect).toBe("none");
  });

  // determines if the slider bar is filled, half (w/ orientation) or none
  it('correctly interprets the "bottom" connect configuration', () => {
    nodeConfig.viewRepresentation.sliderSettings.connect[1] = true;
    let wrapper2 = shallowMount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
      },
    });

    expect(wrapper2.vm.connect).toBe("bottom");
  });

  // determines if the slider bar is filled, half (w/ orientation) or none
  it('correctly interprets the "top" connect configuration', () => {
    nodeConfig.viewRepresentation.sliderSettings.connect[0] = true;
    let wrapper2 = shallowMount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
      },
    });

    expect(wrapper2.vm.connect).toBe("top");
  });

  // determines if the slider bar is filled, half (w/ orientation) or none
  it('correctly interprets the "both" connect configuration', () => {
    nodeConfig.viewRepresentation.sliderSettings.connect[0] = true;
    nodeConfig.viewRepresentation.sliderSettings.connect[1] = true;
    let wrapper2 = shallowMount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
      },
    });

    expect(wrapper2.vm.connect).toBe("both");
  });

  it("correctly emits the updateWidget payload", () => {
    const wrapper2 = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
        valuePair: nodeConfig.viewRepresentation.currentValue,
      },
    });
    wrapper2.findComponent(Slider).vm.$emit("update:modelValue", 10);
    const { updateWidget } = wrapper2.emitted();
    expect(updateWidget[0][0]).toBeTruthy();
    expect(updateWidget[0][0].type).toBe("double");
    expect(updateWidget[0][0].value).toBe(10);
  });

  it("supports inverted process config", () => {
    const wrapper2 = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
        invertProcess: true,
        valuePair: { double: 0 },
      },
    });
    const p = wrapper2.vm.process;
    expect(typeof p).toBe("function");
    expect(p([0])).toStrictEqual([[0, 100]]);
  });

  it("has no error message when valid", () => {
    let wrapper2 = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
      },
      global: {
        stubs: {
          Slider: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue(50),
            },
          },
        },
      },
    });

    expect(wrapper2.vm.validate().errorMessage).toBeNull();
  });

  it("takes child error message over parent error message", () => {
    let wrapper2 = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
      },
      global: {
        stubs: {
          Slider: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue(null),
              validate: vi
                .fn()
                .mockReturnValue({
                  isValid: false,
                  errorMessage: "test Error Message",
                }),
            },
          },
        },
      },
    });
    expect(wrapper2.vm.validate().isValid).toBe(false);
    expect(wrapper2.vm.validate().errorMessage).toBe("test Error Message");
  });

  it("only displays error message when invalid", () => {
    const wrapperFull = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
        isValid,
        valuePair: nodeConfig.viewRepresentation.currentValue,
      },
    });
    expect(wrapperFull.findComponent(ErrorMessage).isVisible()).toBe(true);
    let wrapper2 = mount(SliderWidget, {
      props: {
        nodeConfig,
        nodeId,
      },
      global: {
        stubs: {
          Slider: {
            template: "<div />",
            methods: {
              getValue: vi.fn().mockReturnValue(null),
              validate: vi
                .fn()
                .mockReturnValue({ isValid: true, errorMessage: null }),
            },
          },
        },
      },
    });
    expect(wrapper2.vm.validate().isValid).toBe(false);
    expect(wrapper2.vm.validate().errorMessage).toBe(
      "Current input is invalid.",
    );
  });
});
