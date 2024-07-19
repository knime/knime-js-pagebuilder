import { expect, describe, beforeEach, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import Multiselect from "@/components/widgets/baseElements/selection/Multiselect.vue";
import {
  SearchableCheckboxes,
  SearchableList,
  Twinlist,
  Checkbox,
  ComboBox,
  Multiselect as MultiselectWebappsCommon,
} from "@knime/components";

describe("Multiselect.vue", () => {
  let propsTwinlist,
    propsSearchableCheckboxesHorizontal,
    propsSearchableCheckboxesVertical,
    propsSearchablelist,
    propsComboBox;

  beforeEach(() => {
    propsTwinlist = {
      possibleValueList: [
        "TwinList 1",
        "TwinList 2",
        "TwinList 3",
        "TwinList 4",
        "TwinList 5",
        "TwinList 6",
        "TwinList 7",
      ],
      value: ["TwinList 3", "TwinList 5"],
      type: "Twinlist",
      limitNumberVisOptions: true,
      numberVisOptions: 4,
      isValid: false,
      showSearch: false,
    };
    propsSearchablelist = {
      value: ["List 3", "List 4", "List 7"],
      possibleValueList: [
        "List 1",
        "List 2",
        "List 3",
        "List 4",
        "List 5",
        "List 6",
        "List 7",
        "List 8",
      ],
      type: "List",
      limitNumberVisOptions: true,
      numberVisOptions: 5,
      isValid: false,
      showSearch: false,
    };
    propsSearchableCheckboxesVertical = {
      value: ["CBV 2", "CBV 4", "CBV 6"],
      possibleValueList: ["CBV 1", "CBV 2", "CBV 3", "CBV 4", "CBV 5", "CBV 6"],
      type: "Check boxes (vertical)",
      limitNumberVisOptions: false,
      numberVisOptions: 10,
      isValid: false,
      showSearch: false,
    };
    propsSearchableCheckboxesHorizontal = {
      value: ["CBH 1", "CBH 4"],
      possibleValueList: [
        "CBH 1",
        "CBH 2",
        "CBH 3",
        "CBH 4",
        "CBH 5",
        "CBH 6",
        "CBH 7",
      ],
      type: "Check boxes (horizontal)",
      limitNumberVisOptions: false,
      numberVisOptions: 10,
      isValid: false,
      showSearch: false,
    };
    propsComboBox = {
      value: ["ComboBox 1", "ComboBox 4"],
      possibleValueList: [
        "ComboBox 1",
        "ComboBox 2",
        "ComboBox 3",
        "ComboBox 4",
        "ComboBox 5",
        "ComboBox 6",
        "ComboBox 7",
      ],
      type: "ComboBox",
      limitNumberVisOptions: false,
      numberVisOptions: 10,
      isReExecutionWidget: false,
      isValid: false,
    };
  });

  it("renders all different types", () => {
    let wrapper = shallowMount(Multiselect, {
      props: propsTwinlist,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();

    let wrapper2 = shallowMount(Multiselect, {
      props: propsSearchableCheckboxesHorizontal,
    });
    expect(wrapper2.html()).toBeTruthy();
    expect(wrapper2.isVisible()).toBeTruthy();

    let wrapper3 = shallowMount(Multiselect, {
      props: propsSearchableCheckboxesVertical,
    });
    expect(wrapper3.html()).toBeTruthy();
    expect(wrapper3.isVisible()).toBeTruthy();

    let wrapper4 = shallowMount(Multiselect, {
      props: propsSearchablelist,
    });
    expect(wrapper4.html()).toBeTruthy();
    expect(wrapper4.isVisible()).toBeTruthy();

    const wrapper5 = shallowMount(Multiselect, {
      props: propsComboBox,
    });
    expect(wrapper5.html()).toBeTruthy();
    expect(wrapper5.isVisible()).toBeTruthy();
  });

  describe("searchableCheckboxes", () => {
    it("render horizontal", () => {
      let localProps = {
        ...propsSearchableCheckboxesHorizontal,
        isValid: true,
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.exists()).toBeTruthy();
      expect(searchableCheckboxes.props("alignment")).toBe("horizontal");
      expect(wrapper.findAllComponents(Checkbox).length).toBe(7);
    });

    it("horizontal SearchableCheckboxes is not searchable by default", () => {
      let wrapper = mount(Multiselect, {
        props: propsSearchableCheckboxesHorizontal,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.find(".search-wrapper").exists()).toBe(false);
    });

    it("horizontal SearchableCheckboxes can be searchable", () => {
      let localProps = {
        ...propsSearchableCheckboxesHorizontal,
        showSearch: true,
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.find(".search-wrapper").exists()).toBe(true);
    });

    it("render vertical", () => {
      let localProps = {
        ...propsSearchableCheckboxesVertical,
        isValid: true,
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.exists()).toBeTruthy();
      expect(searchableCheckboxes.props("alignment")).toBe("vertical");
    });

    it("fail on invalid type (alignment)", () => {
      let localProps = {
        ...propsSearchableCheckboxesVertical,
        type: "Check boxes (vulcano)",
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      expect(wrapper.vm.checkBoxesAlignment).toBeNull();
      expect(wrapper.findComponent(SearchableCheckboxes).exists()).toBe(false);
    });

    it("vertical SearchableCheckboxes is not searchable by default", () => {
      let wrapper = mount(Multiselect, {
        props: propsSearchableCheckboxesVertical,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.find(".search-wrapper").exists()).toBe(false);
    });

    it("vertical SearchableCheckboxes can be searchable", () => {
      let localProps = {
        ...propsSearchableCheckboxesVertical,
        showSearch: true,
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      let searchableCheckboxes = wrapper.findComponent(SearchableCheckboxes);
      expect(searchableCheckboxes.find(".search-wrapper").exists()).toBe(true);
    });

    it("emits @update:modelValue", () => {
      let wrapper = shallowMount(Multiselect, {
        props: propsSearchableCheckboxesVertical,
      });

      const testValue = ["VALUE1", "VALUE2"];
      const comp = wrapper.findComponent(SearchableCheckboxes);
      comp.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0][0]).toStrictEqual(
        testValue,
      );
    });
  });

  describe("searchableList", () => {
    it("renders list box component", () => {
      let localProps = { ...propsSearchablelist, isValid: true };
      let wrapper = shallowMount(Multiselect, {
        props: localProps,
      });

      expect(wrapper.findComponent(SearchableList).exists()).toBeTruthy();
    });

    it("is not searchable by default", () => {
      let wrapper = shallowMount(Multiselect, {
        props: propsSearchablelist,
      });

      const searchableList = wrapper.findComponent(SearchableList);
      expect(searchableList.find(".search-wrapper").exists()).toBe(false);
    });

    it("can be searchable", () => {
      let localProps = { ...propsSearchablelist, showSearch: true };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      const searchableList = wrapper.findComponent(SearchableList);
      expect(searchableList.find(".search-wrapper").exists()).toBe(true);
    });

    it("does not render duplicate entries", () => {
      let localProps = {
        ...propsSearchablelist,
        possibleValueList: ["1", "2", "3", "3", "3", "4"],
      };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });
      // duplicate entry will not be shown twice
      const choicesUnique = [...new Set(localProps.possibleValueList)].length;
      expect(wrapper.vm.possibleValues.length).toBe(choicesUnique);
    });

    it("emits @update:modelValue", () => {
      let wrapper = shallowMount(Multiselect, {
        props: propsSearchablelist,
      });

      const testValue = ["VALUE1", "VALUE2"];
      const comp = wrapper.findComponent(SearchableList);
      comp.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0][0]).toStrictEqual(
        testValue,
      );
    });
  });

  describe("twinlist", () => {
    it("renders component", () => {
      let localProps = { ...propsTwinlist, isValid: true };
      propsTwinlist.isValid = true;
      let wrapper = shallowMount(Multiselect, {
        props: localProps,
      });

      expect(wrapper.findComponent(Twinlist).exists()).toBeTruthy();
    });

    it("is not searchable by default", () => {
      let wrapper = shallowMount(Multiselect, {
        props: propsTwinlist,
      });

      const twinlist = wrapper.findComponent(Twinlist);
      expect(twinlist.find(".search-wrapper").exists()).toBe(false);
    });

    it("can be searchable", () => {
      let localProps = { ...propsTwinlist, showSearch: true };
      let wrapper = mount(Multiselect, {
        props: localProps,
      });

      const twinlist = wrapper.findComponent(Twinlist);
      expect(twinlist.find(".search-wrapper").exists()).toBe(true);
    });

    it("size defaults to 0", () => {
      let localProps = {
        ...propsTwinlist,
        isValid: true,
        limitNumberVisOptions: false,
      };
      let wrapper = shallowMount(Multiselect, {
        props: localProps,
      });

      let rb = wrapper.findComponent(Twinlist);
      expect(rb.props("size")).toBe(0);
    });

    it("emits @update:modelValue", () => {
      let localProps = { ...propsTwinlist, isValid: true };
      propsTwinlist.isValid = true;
      let wrapper = shallowMount(Multiselect, {
        props: localProps,
      });

      const testValue = ["VALUE1", "VALUE2"];
      const comp = wrapper.findComponent(Twinlist);
      comp.vm.$emit("update:modelValue", testValue);

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0][0]).toStrictEqual(
        testValue,
      );
    });
  });

  describe("comboBox", () => {
    it("renders combobox component", () => {
      propsComboBox.isValid = true;
      const wrapper = shallowMount(Multiselect, {
        props: propsComboBox,
      });
      expect(wrapper.findComponent(ComboBox).exists()).toBeTruthy();
    });

    it("closes the options after selection when it is a re-execution widget", async () => {
      propsComboBox.isReExecutionWidget = true;
      const wrapper = mount(Multiselect, {
        props: propsComboBox,
      });
      const closeOptionsMock = vi.spyOn(
        wrapper.findComponent(MultiselectWebappsCommon).vm,
        "closeOptions",
      );
      await wrapper
        .findComponent(ComboBox)
        .find(".search-input")
        .trigger("focus");
      expect(
        wrapper.findComponent(MultiselectWebappsCommon).vm.showOptions,
      ).toBeTruthy();
      await wrapper
        .findComponent(MultiselectWebappsCommon)
        .vm.onUpdateModelValue("test2", true);
      expect(
        wrapper.findComponent(MultiselectWebappsCommon).vm.showOptions,
      ).toBeFalsy();
      expect(closeOptionsMock).toHaveBeenCalled();
    });
  });
});
