<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import MultiSelectView from '@/components/widgets/baseElements/selection/MultiSelectView';

const DATA_TYPE = 'value';

/**
 * Multiple Selection Widget
 * Allows the user to select multiple items from a list of possible choices.
 * The view representation can either be a Twinlist, Checkboxes or a ListBox
 */
export default {
    components: {
        MultiSelectView,
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
                [DATA_TYPE]: []
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
        description() {
            return this.viewRep.description || null;
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }
            if (this.viewRep.errorMessage) {
                return this.viewRep.errorMessage;
            }
            return 'Current selection is invalid';
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
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
            }
            return isValid;
        }
    }
};
</script>

<template>
  <Component
    :is="isList ? 'Label' : 'Fieldset'"
    :text="label"
  >
    <MultiSelectView
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
