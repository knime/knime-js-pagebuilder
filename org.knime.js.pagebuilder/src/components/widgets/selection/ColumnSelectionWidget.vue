<script>
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset.vue';
import SingleSelect from '../baseElements/selection/SingleSelect.vue';

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
                return nodeId !== '';
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
        },
        errorMessage: {
            default: null,
            type: String
        }
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
            let errorMessage;
            if (this.viewRep.required && !this.$refs.form.hasSelection()) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current column is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <Component
    :is="isRadioButtons ? 'Fieldset' : 'Label'"
    :text="label"
  >
    <template #default="{ labelForId }">
      <SingleSelect
        :id="labelForId"
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
    </template>
  </Component>
</template>
