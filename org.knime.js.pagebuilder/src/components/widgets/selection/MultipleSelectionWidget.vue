<script>
import { nextTick } from "vue";

import { Fieldset, Label } from "@knime/components";

import Multiselect from "../baseElements/selection/Multiselect.vue";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const DATA_TYPE = "value";

/**
 * Multiple Selection Widget
 * Allows the user to select multiple items from a list of possible choices.
 * The view representation can either be a Twinlist, Checkboxes or a ListBox
 */
export default {
  components: {
    Multiselect,
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
        [DATA_TYPE]: [],
      }),
      type: Object,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["updateWidget", "validateWidget"],
  computed: {
    viewRep() {
      return this.nodeConfig.viewRepresentation;
    },
    label() {
      return this.viewRep.label;
    },
    description() {
      return this.viewRep.description || null;
    },
    value() {
      return this.valuePair[DATA_TYPE];
    },
    enableSearch() {
      return Boolean(this.viewRep.enableSearch);
    },
    isList() {
      return this.viewRep.type === "List";
    },
  },
  mounted() {
    if (!this.viewRep.ignoreInvalidValues) {
      this.$watch("viewRep.possibleChoices", (newValue) => {
        if (this.value?.some((item) => !newValue?.includes(item))) {
          // wait until the child component incorporated the new values
          nextTick(() => {
            this.$emit("validateWidget");
          });
        }
      });
    }
  },
  methods: {
    onChange(value) {
      const changeEventObj = {
        nodeId: this.nodeId,
        type: DATA_TYPE,
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
      if (typeof this.$refs.form.validate === "function") {
        let validateEvent = this.$refs.form.validate();
        isValid = Boolean(validateEvent.isValid && isValid);
        errorMessage =
          validateEvent.errorMessage ||
          errorMessage ||
          "Current selection is invalid.";
      }
      return { isValid, errorMessage: isValid ? null : errorMessage };
    },
  },
};
</script>

<template>
  <Component :is="isList ? 'Label' : 'Fieldset'" :text="label" :large="isList">
    <template #default="{ labelForId }">
      <Multiselect
        :id="labelForId"
        ref="form"
        :model-value="value"
        :type="viewRep.type"
        :number-vis-options="viewRep.numberVisOptions"
        :limit-number-vis-options="viewRep.limitNumberVisOptions"
        :possible-value-list="viewRep.possibleChoices"
        :is-re-execution-widget="viewRep.triggerReExecution"
        :is-valid="isValid"
        :description="description"
        :label="label"
        :show-search="enableSearch"
        :disabled="disabled"
        @update:model-value="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </template>
  </Component>
</template>
