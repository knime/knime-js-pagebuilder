<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Multiselect from '@/components/widgets/baseElements/selection/Multiselect';

const DATA_TYPE = 'value';

/**
 * Multiple Selection Widget
 * Allows the user to select multiple items from a list of possible choices.
 * The view representation can either be a Twinlist, Checkboxes or a ListBox
 */
export default {
    components: {
        Multiselect,
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
                [DATA_TYPE]: []
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
            return this.valuePair[DATA_TYPE];
        },
        isList() {
            return this.viewRep.type === 'List';
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required === false) {
                return { isValid, errorMessage };
            }
            if (!this.$refs.form.hasSelection()) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current selection is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <Component
    :is="isList ? 'Label' : 'Fieldset'"
    :text="label"
  >
    <Multiselect
      ref="form"
      :value="value"
      :type="viewRep.type"
      :number-vis-options="viewRep.numberVisOptions"
      :limit-number-vis-options="viewRep.limitNumberVisOptions"
      :possible-value-list="viewRep.possibleChoices"
      :is-valid="isValid"
      :description="description"
      :label="label"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Component>
</template>
