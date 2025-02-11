<script>
import { Label, Dropdown, Fieldset } from "@knime/components";
import Multiselect from "../baseElements/selection/Multiselect.vue";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const VALUE_KEY_NAME = "values";
const COLUMN_KEY_NAME = "column";

/**
 * Value Filter Selection Widget
 *
 * Allows the user to select multiple items from a list of possible choices. This list depends on a 'column' selected
 * in a dropdown. The dropdown is only shown if the column is not locked by configuration.
 *
 */
export default {
  components: {
    Multiselect,
    Dropdown,
    Label,
    Fieldset,
    ErrorMessage,
  },
  props: {
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return obj.nodeInfo;
      },
    },
    nodeId: {
      required: true,
      type: String,
      validator(nodeId) {
        return nodeId !== "";
      },
    },
    isValid: {
      default: true,
      type: Boolean,
    },
    valuePair: {
      default: () => ({
        [COLUMN_KEY_NAME]: "",
        [VALUE_KEY_NAME]: [],
      }),
      type: Object,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  emits: ["updateWidget"],
  computed: {
    viewRep() {
      return this.nodeConfig.viewRepresentation;
    },
    label() {
      return this.viewRep.label;
    },
    possibleValues() {
      return this.isColumnValid ? this.viewRep.possibleValues[this.column] : [];
    },
    description() {
      return this.viewRep.description || null;
    },
    value() {
      return this.isColumnValid ? this.valuePair[VALUE_KEY_NAME] : [];
    },
    enableSearch() {
      return Boolean(this.viewRep.enableSearch);
    },
    column() {
      return this.valuePair[COLUMN_KEY_NAME];
    },
    possibleColumns() {
      return [...new Set(this.viewRep.possibleColumns)].map((x) => ({
        id: x,
        text: x,
      }));
    },
    isColumnLocked() {
      return this.viewRep.lockColumn;
    },
    isColumnValid() {
      return this.viewRep.possibleColumns.includes(this.column);
    },
    isList() {
      return this.viewRep.type === "List";
    },
  },
  methods: {
    onChange(value) {
      const changeEventObj = {
        nodeId: this.nodeId,
        type: VALUE_KEY_NAME,
        value,
      };
      this.$emit("updateWidget", changeEventObj);
    },
    onColumnChange(value) {
      const changeEventObj = {
        nodeId: this.nodeId,
        type: COLUMN_KEY_NAME,
        value,
      };
      this.$emit("updateWidget", changeEventObj);
    },
    validate() {
      let isValid = true;
      let errorMessage;
      if (this.viewRep.required && !this.$refs.form.hasSelection()) {
        isValid = false;
        errorMessage = "Selection is required.";
      }
      if (!this.isColumnValid) {
        isValid = false;
        errorMessage = "Selected column is invalid.";
      }
      if (typeof this.$refs.form.validate === "function") {
        let validateEvent = this.$refs.form.validate();
        isValid = Boolean(validateEvent.isValid && isValid);
        errorMessage =
          validateEvent.errorMessage ||
          errorMessage ||
          "Selection is invalid or missing.";
      }
      return { isValid, errorMessage: isValid ? null : errorMessage };
    },
  },
};
</script>

<template>
  <Component
    :is="isColumnLocked ? 'div' : 'Fieldset'"
    :text="isColumnLocked ? null : label"
  >
    <Label v-if="!isColumnLocked" text="Column" large>
      <template #default="{ labelForId }">
        <Dropdown
          v-if="!isColumnLocked"
          :id="labelForId"
          ref="column"
          :model-value="column"
          :is-valid="isColumnValid"
          aria-label="Column"
          :possible-values="possibleColumns"
          @update:model-value="onColumnChange"
        />
      </template>
    </Label>
    <Component
      :is="isList ? 'Label' : 'Fieldset'"
      :text="isColumnLocked ? label : 'Value'"
      :large="isList"
    >
      <template #default="{ labelForId }">
        <Multiselect
          :id="labelForId"
          ref="form"
          :model-value="value"
          :type="viewRep.type"
          :number-vis-options="viewRep.numberVisOptions"
          :limit-number-vis-options="viewRep.limitNumberVisOptions"
          :possible-value-list="possibleValues"
          :is-valid="isValid"
          :description="description"
          :label="label"
          :show-search="enableSearch"
          :ignore-invalid-values="viewRep.ignoreInvalidValues"
          @update:model-value="onChange"
        />
        <ErrorMessage :error="errorMessage" />
      </template>
    </Component>
  </Component>
</template>

<style lang="postcss" scoped>
fieldset {
  text-overflow: ellipsis;
}
</style>
