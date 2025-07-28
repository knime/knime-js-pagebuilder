<script>
import { Dropdown, Fieldset, Label } from "@knime/components";

import SingleSelect from "../baseElements/selection/SingleSelect.vue";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const VALUE_KEY_NAME = "value";
const COLUMN_KEY_NAME = "column";

/*
 * Implementation of the Value Selection Widget. Allows the user to select one column from a list of possible columns.
 * With a second form element the values in that column can be selected. This form element can either be a Dropdown,
 * ListBox or RadioButtons. The column may be locked and not changeable by the user.
 * In this mode it is still possible to select the value.
 */
export default {
  components: {
    SingleSelect,
    Dropdown,
    Fieldset,
    Label,
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
        [VALUE_KEY_NAME]: "",
        [COLUMN_KEY_NAME]: "",
      }),
      type: Object,
    },
    errorMessage: {
      default: null,
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
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
    possibleValueList() {
      return this.isColumnValid ? this.viewRep.possibleValues[this.column] : [];
    },
    possibleColumns() {
      return [...new Set(this.viewRep.possibleColumns)].map((x) => ({
        id: x,
        text: x,
      }));
    },
    description() {
      return this.viewRep.description || null;
    },
    value() {
      return this.isColumnValid ? this.valuePair[VALUE_KEY_NAME] : "";
    },
    column() {
      return this.valuePair[COLUMN_KEY_NAME];
    },
    isRadioButtons() {
      return (
        this.viewRep.type === "Radio buttons (vertical)" ||
        this.viewRep.type === "Radio buttons (horizontal)"
      );
    },
    isColumnLocked() {
      return this.viewRep.lockColumn;
    },
    isColumnValid() {
      return this.viewRep.possibleColumns.includes(this.column);
    },
    hasSelection() {
      return this.isColumnValid && this.possibleValueList.includes(this.value);
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
      if (this.viewRep.required && !this.hasSelection) {
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
    :is="isColumnLocked && !isRadioButtons ? 'Label' : 'Fieldset'"
    :text="label"
    class="fieldset"
    :large="isColumnLocked && !isRadioButtons"
  >
    <template #default="mainLabel">
      <Label v-if="!isColumnLocked" #default="columnLabel" text="Column" large>
        <Dropdown
          :id="columnLabel.labelForId"
          ref="column"
          :model-value="column"
          :is-valid="isColumnValid"
          aria-label="Column"
          :possible-values="possibleColumns"
          :disabled="disabled"
          @update:model-value="onColumnChange"
        />
      </Label>
      <Label v-if="!isColumnLocked" :generate-id="false" text="Value" large />
      <SingleSelect
        :id="mainLabel.labelForId"
        ref="form"
        :model-value="value"
        :type="viewRep.type"
        :number-vis-options="viewRep.numberVisOptions"
        :limit-number-vis-options="viewRep.limitNumberVisOptions"
        :is-valid="isValid"
        :title="description"
        :possible-value-list="possibleValueList"
        :label="label"
        :disabled="disabled"
        @update:model-value="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </template>
  </Component>
</template>
