import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

import IntegerWidget from "@/components/widgets/input/IntegerWidget.vue";

describe("IntegerWidget.vue", () => {
  let mountOptions;

  beforeEach(() => {
    mountOptions = {
      props: {
        nodeConfig: {
          viewRepresentation: {
            "@class":
              "org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation",
            defaultValue: {
              "@class":
                "org.knime.js.base.node.base.input.integer.IntegerNodeValue",
              integer: 0,
            },
            currentValue: {
              "@class":
                "org.knime.js.base.node.base.input.integer.IntegerNodeValue",
              integer: 0,
            },
          },
          nodeInfo: {},
          getViewValueMethodName: "value",
        },
        nodeId: "id1",
        isValid: false,
        type: "integer",
      },
      global: {
        stubs: {
          NumberWidget: {
            template: "<div />",
            methods: {
              validate: vi.fn(),
              onChange: vi.fn(),
            },
          },
        },
      },
    };
  });

  it("renders", () => {
    let wrapper = shallowMount(IntegerWidget, mountOptions);
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(
      wrapper.findComponent(mountOptions.global.stubs.NumberWidget).exists(),
    ).toBeTruthy();
  });

  it("passes-through all props", () => {
    let wrapper = shallowMount(IntegerWidget, mountOptions);
    expect(
      wrapper.findComponent(mountOptions.global.stubs.NumberWidget).vm.$attrs,
    ).toEqual(mountOptions.props);
  });

  describe("passes-through methods", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(IntegerWidget, mountOptions);
    });

    it("validate", () => {
      let validate = mountOptions.global.stubs.NumberWidget.methods.validate;
      expect(validate).not.toBeCalled();
      wrapper.vm.validate();
      expect(validate).toBeCalled();
    });

    it("onChange", () => {
      let onChange = mountOptions.global.stubs.NumberWidget.methods.onChange;
      expect(onChange).not.toBeCalled();
      wrapper.vm.onChange();
      expect(onChange).toBeCalled();
    });
  });
});
