import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VueSlider from "vue-slider-component";

import Slider from "@/components/widgets/baseElements/input/Slider.vue";

describe("Slider.vue", () => {
  let context, props;

  beforeEach(() => {
    props = {
      value: 50,
      maximum: 100,
      minimum: 0,
      isValid: true,
      direction: "ltr",
      stepSize: 10,
      height: 250,
      tooltips: [{ tooltip: "always" }],
      tooltipFormat: [(val) => val.toString()],
      marks: {},
      connect: "both",
      dragOnClick: true,
      contained: false,
    };
  });

  it("renders", () => {
    let wrapper = mount(Slider, {
      ...context,
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.findComponent(VueSlider).isVisible()).toBeTruthy();
  });

  it("has default props", () => {
    let wrapper = mount(Slider, {
      ...context,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.findComponent(VueSlider).isVisible()).toBeTruthy();
  });

  it("receives onValueChange events", () => {
    let wrapper = mount(Slider, {
      ...context,
      props,
    });
    let newValue = wrapper.vm.value + 1;
    wrapper.vm.$refs.slider.setValue(newValue);

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("invalidates undefined values", () => {
    let wrapper = mount(Slider, {
      ...context,
      props,
    });

    // should be undefined
    wrapper.vm.$refs.slider.setValue(props.newValue);

    expect(wrapper.vm.validate()).toStrictEqual({
      errorMessage: "Value is not a number.",
      isValid: false,
    });
  });

  it("invalidates values outside the given range", () => {
    let wrapper = mount(Slider, {
      ...context,
      props,
    });
    const lowValue = -10;
    const okayValue = 10;
    const highValue = 110;

    // too low
    wrapper.vm.$refs.slider.setValue(lowValue);
    expect(wrapper.vm.validate()).toStrictEqual({
      errorMessage: "Value is not inside the valid range.",
      isValid: false,
    });
    // valid
    wrapper.vm.$refs.slider.setValue(okayValue);
    expect(wrapper.vm.validate().isValid).toBe(true);

    // too high
    wrapper.vm.$refs.slider.setValue(highValue);
    expect(wrapper.vm.validate()).toStrictEqual({
      errorMessage: "Value is not inside the valid range.",
      isValid: false,
    });
  });

  it("invalidates incorrect range", () => {
    props.minimum = 100;
    props.maximum = 0;
    let wrapper = mount(Slider, {
      ...context,
      props,
    });

    expect(wrapper.vm.validate()).toStrictEqual({
      errorMessage: "Value is not inside the valid range.",
      isValid: false,
    });
  });
});
