import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import Dropdown from "webapps-common/ui/components/forms/Dropdown.vue";
import propsColumnLockedListImport from "@@/test/assets/propsDataColumnLockedList";
import propsRadioHorizontalImport from "@@/test/assets/propsDataRadioHorizontal";
import propsRadioVerticalImport from "@@/test/assets/propsDataRadioVertical";
import propsDropdownImport from "@@/test/assets/propsDataDropdown";
import propsListImport from "@@/test/assets/propsDataList";
import ValueSelectionWidget from "@/components/widgets/selection/ValueSelectionWidget.vue";

describe("ValueSelectionWidget.vue", () => {
  let propsColumnLockedList,
    propsRadioHorizontal,
    propsRadioVertical,
    propsDropdown,
    propsList;

  beforeEach(() => {
    propsColumnLockedList = JSON.parse(
      JSON.stringify(propsColumnLockedListImport),
    );
    propsRadioHorizontal = JSON.parse(
      JSON.stringify(propsRadioHorizontalImport),
    );
    propsRadioVertical = JSON.parse(JSON.stringify(propsRadioVerticalImport));
    propsDropdown = JSON.parse(JSON.stringify(propsDropdownImport));
    propsList = JSON.parse(JSON.stringify(propsListImport));
  });

  describe("render", () => {
    it("renders as radio buttons horizontal", () => {
      let wrapper = shallowMount(ValueSelectionWidget, {
        props: propsRadioHorizontal,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
    });

    it("renders as radio buttons vertical", () => {
      let wrapper = shallowMount(ValueSelectionWidget, {
        props: propsRadioVertical,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
    });

    it("renders as list", () => {
      let wrapper = shallowMount(ValueSelectionWidget, {
        props: propsList,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
    });

    it("renders as dropdown", () => {
      let wrapper = mount(ValueSelectionWidget, {
        props: propsDropdown,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.findAllComponents(Dropdown).length).toBe(2);
      expect(wrapper.isVisible()).toBeTruthy();
    });

    it("renders as list with column locked", () => {
      let wrapper = shallowMount(ValueSelectionWidget, {
        props: propsColumnLockedList,
      });

      expect(wrapper.html()).toBeTruthy();
      expect(wrapper.isVisible()).toBeTruthy();
    });
  });

  it("sends @updateWidget if SingleSelect emits @input", () => {
    let wrapper = mount(ValueSelectionWidget, {
      props: propsRadioVertical,
    });

    const testValue = "VALUE";
    const lb = wrapper.findComponent({ ref: "form" });
    lb.vm.$emit("update:modelValue", testValue);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: propsRadioVertical.nodeId,
      type: "value",
      value: testValue,
    });
  });

  it("sends @updateWidget if column emits @input", () => {
    let wrapper = mount(ValueSelectionWidget, {
      props: propsRadioVertical,
    });

    const testValue = "MYCOL";
    const lb = wrapper.findComponent({ ref: "column" });
    lb.vm.$emit("update:modelValue", testValue);

    expect(wrapper.emitted("updateWidget")).toBeTruthy();
    expect(wrapper.emitted("updateWidget")[0][0]).toStrictEqual({
      nodeId: propsRadioVertical.nodeId,
      type: "column",
      value: testValue,
    });
  });

  it("has size set", () => {
    propsList.isValid = true;
    propsList.nodeConfig.viewRepresentation.limitNumberVisOptions = true;
    let wrapper = mount(ValueSelectionWidget, {
      props: propsList,
    });
    let size = propsList.nodeConfig.viewRepresentation.numberVisOptions;
    expect(
      wrapper.findComponent({ ref: "form" }).props("numberVisOptions"),
    ).toBe(size);
  });

  it("does not render duplicate entries", () => {
    propsDropdown.nodeConfig.viewRepresentation.possibleColumns = [
      "1",
      "2",
      "3",
      "3",
      "3",
      "4",
    ];

    let wrapper = mount(ValueSelectionWidget, {
      props: propsDropdown,
    });
    // duplicate column entry will not be shown twice
    expect(wrapper.vm.possibleColumns.length).toBe(4);
  });

  it("passes isValid to component", () => {
    let wrapper = mount(ValueSelectionWidget, {
      props: {
        ...propsList,
        isValid: false,
      },
    });
    expect(wrapper.findComponent({ ref: "form" }).props("isValid")).toBe(false);
  });

  describe("validation", () => {
    it("is valid if not required and no selection made", () => {
      propsList.nodeConfig.viewRepresentation.required = false;
      let wrapper = mount(ValueSelectionWidget, {
        props: {
          ...propsList,
          valuePair: {
            value: "",
            column: "Cluster Membership",
          },
        },
      });

      expect(wrapper.vm.validate().isValid).toBe(true);
    });

    it("invalidates with unlocked column and invalid column selected", () => {
      propsDropdown.nodeConfig.viewRepresentation.required = true;
      propsDropdown.nodeConfig.viewRepresentation.lockColumn = false;
      propsDropdown.nodeConfig.viewRepresentation.currentValue.column =
        "INVALID";
      let wrapper = mount(ValueSelectionWidget, {
        props: propsDropdown,
      });
      // invalid column should not display any possible or selected values
      expect(wrapper.vm.value).toBe("");
      expect(wrapper.vm.possibleValueList).toStrictEqual([]);
      // it should return the correct invalid response for validation
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage: "Selected column is invalid.",
      });
    });

    it("is invalid if required and no selection was made", async () => {
      propsList.nodeConfig.viewRepresentation.required = true;
      propsList.nodeConfig.viewRepresentation.lockColumn = true;
      let wrapper = mount(ValueSelectionWidget, {
        props: propsList,
      });
      await wrapper.setProps({
        valuePair: {
          value: "",
          column: "Cluster Membership",
        },
      });
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage: "Selection is required.",
      });
    });

    it("is valid if required and a selection was made", () => {
      propsDropdown.nodeConfig.viewRepresentation.lockColumn = true;
      propsDropdown.valuePair = {
        value: "URI: http://cepetakagtksslf; EXT: ",
        column: "UriCol",
      };
      let wrapper = mount(ValueSelectionWidget, {
        props: propsDropdown,
      });
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: true,
        errorMessage: null,
      });
    });

    it("handles child validation", () => {
      propsDropdown.nodeConfig.viewRepresentation.required = true;
      propsDropdown.nodeConfig.viewRepresentation.lockColumn = true;
      propsDropdown.valuePair = {
        value: "URI: http://cepetakagtksslf; EXT: ",
        column: "UriCol",
      };
      let childResponse = {
        isValid: false,
        errorMessage: "test Error Message",
      };
      let wrapper = mount(ValueSelectionWidget, {
        props: propsDropdown,
        global: {
          stubs: {
            SingleSelect: {
              template: "<div />",
              methods: {
                validate: vi
                  .fn()
                  .mockReturnValueOnce(childResponse)
                  .mockReturnValueOnce({ isValid: false }),
              },
            },
          },
        },
      });
      // child message
      expect(wrapper.vm.validate()).toStrictEqual(childResponse);
      // default message
      expect(wrapper.vm.validate()).toStrictEqual({
        isValid: false,
        errorMessage: "Selection is invalid or missing.",
      });
    });
  });
});
