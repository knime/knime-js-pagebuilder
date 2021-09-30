<script>
import { mapActions } from 'vuex';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect';

const DATA_TYPE_KEY = 'value';

/**
 * Implementation of the Single Selection Widget. Allows the user to select one item from a list of possible choices.
 * The view representation can either be a Dropdown, ListBox or RadioButtons.
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
            type: String,
            default: null
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
            // unwrap the value form the array, single selection values are still arrays in the json
            // because they share some impl parts with multiple selection values
            return this.valuePair[DATA_TYPE_KEY][0];
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
                value: [value]
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            if (this.viewRep.possibleChoices.length === 0) {
                return { isValid: false, errorMessage: 'No choices were specified.' };
            }
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required && !this.$refs.form.hasSelection()) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current selection is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        },
        handleReExecution() {
            if (this.viewRep.reExecuteDownstreamNodes) {
                this.triggerReExecution({ nodeId: this.nodeId });
            }
        },
        ...mapActions({
            triggerReExecution: 'pagebuilder/triggerReExecution'
        })
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
        :possible-value-list="viewRep.possibleChoices"
        :label="label"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </template>
  </Component>
</template>
