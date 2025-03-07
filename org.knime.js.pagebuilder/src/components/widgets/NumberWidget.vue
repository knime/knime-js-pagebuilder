<script>
import { Label, NumberInput } from "@knime/components";

import ErrorMessage from "./baseElements/text/ErrorMessage.vue";

/**
 * Reusable base implementation of the Number Input Widget. Used by DoubleWidget and IntegerWidget.
 * The primary goal of this component is to parse the various settings
 * from the nodeConfig provided by the parent Widget component and parse
 * them correctly for the NumberInput component.
 */
export default {
  components: {
    Label,
    NumberInput,
    ErrorMessage,
  },
  props: {
    /**
     * The nodeConfig provided to the component should have the
     * necessary fields as seen in the validator below:
     *
     * ex:  nodeConfig = {
     *          viewRepresentation: {...},
     *          nodeInfo: {...},
     *          ...
     *      };
     */
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return obj.viewRepresentation && obj.nodeInfo;
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
    type: {
      default: "double",
      type: String,
      validator(val) {
        return ["double", "integer"].includes(val);
      },
    },
    valuePair: {
      default: () => ({
        double: 0,
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
    description() {
      return this.viewRep.description || null;
    },
    value() {
      return this.valuePair[this.type];
    },
    min() {
      return this.viewRep.usemin ? this.viewRep.min : -Number.MAX_SAFE_INTEGER;
    },
    max() {
      return this.viewRep.usemax ? this.viewRep.max : Number.MAX_SAFE_INTEGER;
    },
  },
  methods: {
    onChange(value) {
      const changeEventObj = {
        nodeId: this.nodeId,
        type: this.type,
        value,
      };
      this.$emit("updateWidget", changeEventObj);
    },
    validate() {
      let isValid = true;
      let errorMessage;
      let value = this.$refs.form.getParsedValue();
      if (isNaN(value)) {
        isValid = false;
        errorMessage = "Current value is not a number.";
      }
      if (value < this.min || this.max < value) {
        isValid = false;
        errorMessage = "Current value is outside allowed range.";
      }

      if (typeof this.$refs.form.validate === "function") {
        let validateEvent = this.$refs.form.validate();
        isValid = Boolean(validateEvent.isValid && isValid);
        errorMessage =
          validateEvent.errorMessage ||
          errorMessage ||
          "Current input is invalid.";
      }
      return { isValid, errorMessage: isValid ? null : errorMessage };
    },
  },
};
</script>

<template>
  <div>
    <Label #default="{ labelForId }" :text="label" large>
      <NumberInput
        :id="labelForId"
        ref="form"
        :type="type"
        :model-value="value"
        :min="min"
        :max="max"
        :is-valid="isValid"
        :title="description"
        @update:model-value="onChange"
      />
    </Label>
    <ErrorMessage :error="errorMessage" />
  </div>
</template>

<style lang="postcss" scoped>
:deep(label) {
  cursor: pointer;
}
</style>
