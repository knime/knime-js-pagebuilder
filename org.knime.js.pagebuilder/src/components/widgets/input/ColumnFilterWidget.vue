<script>
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';

const VALUE_KEY = 'columns';

/**
 * Column Filter Widget
 * Allows the user to select multiple columns from a Twinlist
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
            // eslint-disable-next-line no-magic-numbers
            return 0; // default: show all
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }
            if (this.viewRep.errorMessage) {
                return this.viewRep.errorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current selected item is invalid';
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
            let isValid = true;
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
            }
            // check for invalid values
            if (isValid) {
                isValid = this.$refs.form.validate();
            }
            return isValid;
        }
    }
};
</script>

<template>
  <Fieldset :text="label">
    <Twinlist
      ref="form"
      :value="value"
      :size="maxVisibleListEntries"
      label-left="Excludes"
      label-right="Includes"
      :possible-values="possibleColumns"
      :is-valid="isValid"
      :title="description"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Fieldset>
</template>
