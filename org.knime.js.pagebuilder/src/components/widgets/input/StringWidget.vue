<script>
import { InputField, Label, TextArea } from "@knime/components";

import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const DATA_TYPE = "string";

/**
 * This is the String Input widget implementation. At this component
 * level, the primary goal is to parse the view representation into
 * the necessary configuration values to render the correct input
 * element.
 *
 * This widget has two rendering options: a standard input field or
 * a text area.
 */
export default {
  components: {
    Label,
    InputField,
    TextArea,
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
        [DATA_TYPE]: 0,
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
      return this.valuePair[DATA_TYPE];
    },
    isMultiLine() {
      return this.viewRep.editorType === "Multi-line";
    },
    multiColumns() {
      return this.viewRep.multilineEditorWidth;
    },
    multiRows() {
      return this.viewRep.multilineEditorHeight;
    },
    regex() {
      return this.viewRep.regex || null;
    },
    // The custom error message set in the config dialog with the placeholder character replaced by the input.
    customErrorMessage() {
      return this.viewRep.errorMessage?.split("?").join(this.value);
    },
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
      if (this.viewRep.required && !this.$refs.form.getValue()) {
        isValid = false;
        errorMessage = "Input is required.";
      }
      // text area doesn't have a validate method
      if (typeof this.$refs.form.validate === "function") {
        let validateEvent = this.$refs.form.validate();
        isValid = Boolean(validateEvent.isValid && isValid);
        errorMessage =
          this.customErrorMessage ||
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
  <Label #default="{ labelForId }" class="label" :text="label" large>
    <TextArea
      v-if="isMultiLine"
      :id="labelForId"
      ref="form"
      :model-value="value"
      :cols="multiColumns"
      :rows="multiRows"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <InputField
      v-else
      :id="labelForId"
      ref="form"
      :model-value="value"
      :is-valid="isValid"
      :title="description"
      :pattern="regex"
      @update:model-value="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style lang="postcss" scoped>
.label {
  max-width: 100%;

  & :deep(textarea),
  & :deep(label) {
    cursor: pointer;
    max-width: 100%;
  }
}
</style>
