<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Singleselect from '@/components/widgets/baseElements/selection/Singleselect';

/**
 * Reusable base implementation of a Single Selection Widget.
 * Allows the user to select one item from a list of possible choices.
 * The view representation can either be a Dropdown, ListBox or RadioButtons.
 * Can be configured to use different data types (key names in the json config)
 */
export default {
    components: {
        Singleselect,
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
            default: null,
            type: Object
        },
        dataTypeKey: {
            type: String,
            default: 'value'
        },
        possibleChoicesKey: {
            type: String,
            default: 'possibleChoices'
        },
        valueIsArray: {
            type: Boolean,
            default: true
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
            // case if we did not get a value pair
            if (this.valuePair === null) {
                return ''; // this method unwraps the value so no array check here
            }
            // unwrap the value form the array, single selection values are still arrays in the json
            // because they share some impl parts with multiple selection values
            const val = this.valuePair[this.dataTypeKey];
            return this.valueIsArray ? val[0] : val;
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
                type: this.dataTypeKey,
                value: this.valueIsArray ? [value] : value
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
    <Singleselect
      ref="form"
      :value="value"
      :type="viewRep.type"
      :number-vis-options="viewRep.numberVisOptions"
      :limit-number-vis-options="viewRep.limitNumberVisOptions"
      :is-valid="isValid"
      :title="description"
      :possible-value-list="viewRep[possibleChoicesKey]"
      :label="label"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Component>
</template>
