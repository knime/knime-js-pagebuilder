<script>
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';

const VALUE_KEY = 'columns';

/**
 * Allows the user to select multiple columns from a Twinlist.
 */
export default {
    components: {
        Twinlist,
        Fieldset,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return Boolean(nodeId);
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [VALUE_KEY]: []
            }),
            type: Object
        }
    },
    data() {
        return {
            customValidationErrorMessage: null
        };
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        possibleColumns() {
            return this.viewRep.possibleColumns.map((x) => ({
                id: x,
                text: x
            }));
        },
        description() {
            return this.viewRep.description || null;
        },
        maxVisibleListEntries() {
            if (this.viewRep.limitNumberVisOptions) {
                return this.viewRep.numberVisOptions;
            }
            return 0; // default: show all
        },
        errorMessage() {
            // set by Widget.vue based on or validate() method and backend errors
            if (this.isValid) {
                return null;
            }
            // backend error message or frontend or default
            return this.viewRep.errorMessage || this.customValidationErrorMessage || 'Selection is invalid or missing';
        },
        value() {
            return this.valuePair[VALUE_KEY];
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: VALUE_KEY,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            // reset
            let isValid = true;
            this.frontendErrorMessage = null;
            // run checks
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
                this.customValidationErrorMessage = 'Selection is required';
            }
            // check for invalid values
            if (isValid) {
                isValid = this.$refs.form.validate();
                this.customValidationErrorMessage = 'Current selection is invalid';
            }
            return isValid;
        }
    }
};
</script>

<template>
  <Fieldset
    class="fieldset"
    :text="label"
  >
    <Twinlist
      ref="form"
      label-left="Excludes"
      label-right="Includes"
      :value="value"
      :size="maxVisibleListEntries"
      :possible-values="possibleColumns"
      :is-valid="isValid"
      :title="description"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Fieldset>
</template>

<style lang="postcss" scoped>
.fieldset {
  min-width: auto;
  overflow-x: hidden;
}
</style>
