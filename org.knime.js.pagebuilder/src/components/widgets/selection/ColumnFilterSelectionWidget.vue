<script>
import Fieldset from "webapps-common/ui/components/forms/Fieldset.vue";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";
import Twinlist from "webapps-common/ui/components/forms/Twinlist.vue";

const VALUE_KEY = "columns";

/**
 * Allows the user to select multiple columns from a Twinlist.
 */
export default {
  components: {
    Twinlist,
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
        [VALUE_KEY]: [],
      }),
      type: Object,
    },
    errorMessage: {
      default: null,
      type: String,
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
    possibleColumns() {
      return [...new Set(this.viewRep.possibleColumns)].map((x) => ({
        id: x,
        text: x,
      }));
    },
    description() {
      return this.viewRep.description || null;
    },
    enableSearch() {
      return Boolean(this.viewRep.enableSearch);
    },
    maxVisibleListEntries() {
      if (this.viewRep.limitNumberVisOptions) {
        return this.viewRep.numberVisOptions;
      }
      return 0; // default: show all
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
    <Twinlist
      ref="form"
      left-label="Excludes"
      right-label="Includes"
      :model-value="value"
      :size="maxVisibleListEntries"
      :possible-values="possibleColumns"
      :is-valid="isValid"
      :title="description"
      :show-search="enableSearch"
      @update:model-value="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Fieldset>
</template>
