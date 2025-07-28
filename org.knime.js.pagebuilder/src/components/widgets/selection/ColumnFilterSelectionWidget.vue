<script>
import { Fieldset } from "@knime/components";

import Multiselect from "../baseElements/selection/Multiselect.vue";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const VALUE_KEY = "columns";

/**
 * Allows the user to select multiple columns from a Twinlist.
 */
export default {
  components: {
    Fieldset,
    ErrorMessage,
    Multiselect,
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
        [VALUE_KEY]: [],
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
    description() {
      return this.viewRep.description || null;
    },
    enableSearch() {
      return Boolean(this.viewRep.enableSearch);
    },
    value() {
      return this.valuePair[VALUE_KEY];
    },
  },
  methods: {
    onChange(value) {
      const changeEventObj = {
        nodeId: this.nodeId,
        type: VALUE_KEY,
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
  <Fieldset :text="label">
    <Multiselect
      ref="form"
      :model-value="value"
      type="Twinlist"
      :number-vis-options="viewRep.numberVisOptions"
      :limit-number-vis-options="viewRep.limitNumberVisOptions"
      :possible-value-list="viewRep.possibleColumns"
      :is-valid="isValid"
      :description="description"
      :label="label"
      :show-search="enableSearch"
      :disabled="disabled"
      @update:model-value="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Fieldset>
</template>
