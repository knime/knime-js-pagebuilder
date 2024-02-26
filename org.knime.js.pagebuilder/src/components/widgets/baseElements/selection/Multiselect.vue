<script>
import MultiselectListBox from "webapps-common/ui/components/forms/MultiselectListBox.vue";
import Twinlist from "webapps-common/ui/components/forms/Twinlist.vue";
import Checkboxes from "webapps-common/ui/components/forms/Checkboxes.vue";
import ComboBox from "webapps-common/ui/components/forms/ComboBox.vue";

/**
 * Multiselect Component
 *
 * Allows the user to select multiple items from a list of possible values.
 * The view is either a Twinlist, Checkboxes or a ListBox.
 *
 * This component acts as a base element. It's agnostic to any knowledge of KNIME API's
 * and can be used in the same way as any of it's children components (Twinlist,
 * Checkboxes, ListBox).
 */
export default {
  components: {
    Checkboxes,
    ComboBox,
    MultiselectListBox,
    Twinlist,
  },
  props: {
    isValid: {
      default: true,
      type: Boolean,
    },
    id: {
      type: String,
      default: null,
    },
    /**
     * @values List, Twinlist, Check boxes (horizontal), Check boxes (vertical), ComboBox
     */
    type: {
      default: "List",
      type: String,
    },
    /**
     * List of possible values. Each item is used as text and id
     */
    possibleValueList: {
      type: Array,
      default: () => [],
      validator(values) {
        return Array.isArray(values);
      },
    },
    limitNumberVisOptions: {
      type: Boolean,
      default: false,
    },
    numberVisOptions: {
      type: Number,
      default: 0,
    },
    isReExecutionWidget: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  computed: {
    maxVisibleListEntries() {
      if (this.limitNumberVisOptions) {
        return this.numberVisOptions;
      }
      return 0; // default: show all
    },
    isList() {
      return this.type === "List";
    },
    isTwinlist() {
      return this.type === "Twinlist";
    },
    isCheckboxes() {
      return (
        this.type === "Check boxes (horizontal)" ||
        this.type === "Check boxes (vertical)"
      );
    },
    isComboBox() {
      return this.type === "ComboBox";
    },
    checkBoxesAlignment() {
      if (this.type === "Check boxes (vertical)") {
        return "vertical";
      } else if (this.type === "Check boxes (horizontal)") {
        return "horizontal";
      }
      return null;
    },
    possibleValues() {
      // remove duplicate elements (as they cause key problems); id must be unique
      return [...new Set(this.possibleValueList)].map((x) => ({
        id: x,
        text: x,
      }));
    },
  },
  methods: {
    onChange(value) {
      this.$emit("update:modelValue", value);
    },
    hasSelection() {
      return this.$refs.form.hasSelection();
    },
    /**
     * Validation
     * @returns {Object}
     */
    validate() {
      return typeof this.$refs.form.validate === "function"
        ? this.$refs.form.validate()
        : { isValid: true };
    },
  },
};
</script>

<template>
  <div>
    <Checkboxes
      v-if="isCheckboxes"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :alignment="checkBoxesAlignment"
      :aria-label="label"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <Twinlist
      v-if="isTwinlist"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :size="maxVisibleListEntries"
      left-label="Excludes"
      right-label="Includes"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <MultiselectListBox
      v-if="isList"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :size="maxVisibleListEntries"
      :aria-label="label"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <ComboBox
      v-if="isComboBox"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :size-visible-options="maxVisibleListEntries"
      :aria-label="label"
      :possible-values="possibleValues"
      :close-dropdown-on-selection="isReExecutionWidget"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
  </div>
</template>
