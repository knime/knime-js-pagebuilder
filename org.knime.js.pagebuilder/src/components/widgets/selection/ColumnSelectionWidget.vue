<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect';

const DATA_TYPE_KEY = 'column';

/**
 * Implementation of the Column Selection Widget. Allows the user to select one column from a list of possible columns.
 * The view representation can either be a Dropdown, ListBox or RadioButtons. Very similar to Single Selection Widget.
 */
export default {
    components: {
        SingleSelect,
        Fieldset,
        Label,
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
                [DATA_TYPE_KEY]: ''
            }),
            type: Object
        }
    },
    data() {
        return {
            // TODO: WEBP-292 remove
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
        description() {
            return this.viewRep.description || null;
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }
            // backend error message or frontend or default
            return this.viewRep.errorMessage || this.customValidationErrorMessage || 'Selection is invalid or missing';
        },
        value() {
            // no unwrapping here as the column value is not an array
            return this.valuePair[DATA_TYPE_KEY];
        },
        isRadioButtons() {
            return this.viewRep.type === 'Radio buttons (vertical)' ||
                this.viewRep.type === 'Radio buttons (horizontal)';
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE_KEY,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            this.customValidationErrorMessage = null;
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
                this.customValidationErrorMessage = 'Selection is required';
            }
            if (isValid && this.$refs.form.validate) {
                isValid = this.$refs.form.validate();
                this.customValidationErrorMessage = 'Current selection is invalid';
            }
            return isValid;
        }
    }
};
</script>

<template>
  <Component
    :is="isRadioButtons ? 'Fieldset' : 'Label'"
    :text="label"
  >
    <SingleSelect
      ref="form"
      :value="value"
      :type="viewRep.type"
      :number-vis-options="viewRep.numberVisOptions"
      :limit-number-vis-options="viewRep.limitNumberVisOptions"
      :is-valid="isValid"
      :title="description"
      :possible-value-list="viewRep.possibleColumns"
      :label="label"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Component>
</template>
