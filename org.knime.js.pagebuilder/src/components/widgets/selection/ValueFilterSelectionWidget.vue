<script>
import Label from 'webapps-common/ui/components/forms/Label';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Multiselect from '@/components/widgets/baseElements/selection/Multiselect';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

const VALUE_KEY_NAME = 'values';
const COLUMN_KEY_NAME = 'column';

/**
 * Value Filter Selection Widget
 *
 * Allows the user to select multiple items from a list of possible choices. This list depends on a 'column' selected
 * in a dropdown. The dropdown is only shown if the column is not locked by configuration.
 *
 */
export default {
    components: {
        Multiselect,
        Dropdown,
        Label,
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
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [COLUMN_KEY_NAME]: '',
                [VALUE_KEY_NAME]: []
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
        possibleValues() {
            return this.isColumnValid ? this.viewRep.possibleValues[this.column] : [];
        },
        description() {
            return this.viewRep.description || null;
        },
        value() {
            return this.isColumnValid ? this.valuePair[VALUE_KEY_NAME] : [];
        },
        column() {
            return this.valuePair[COLUMN_KEY_NAME];
        },
        possibleColumns() {
            return this.viewRep.possibleColumns.map((x) => ({
                id: x,
                text: x
            }));
        },
        isColumnLocked() {
            return this.viewRep.lockColumn;
        },
        isColumnValid() {
            return this.viewRep.possibleColumns.includes(this.column);
        },
        isList() {
            return this.viewRep.type === 'List';
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: VALUE_KEY_NAME,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        onColumnChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: COLUMN_KEY_NAME,
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
            isValid = this.$refs.form.hasSelection() && this.isColumnValid;
            if (!isValid) {
                errorMessage = this.isColumnValid ? 'Selection is required.' : 'Selected column is invalid.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Selection is invalid or missing.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <Component
    :is="isColumnLocked ? 'div' : 'Fieldset'"
    :text="isColumnLocked ? null : label"
  >
    <Label
      v-if="!isColumnLocked"
      text="Column"
    >
      <Dropdown
        v-if="!isColumnLocked"
        ref="column"
        :value="column"
        :is-valid="isColumnValid"
        aria-label="Column"
        :possible-values="possibleColumns"
        @input="onColumnChange"
      />
    </Label>
    <Component
      :is="isList ? 'Label' : 'Fieldset'"
      :text="isColumnLocked ? label : 'Value'"
    >
      <Multiselect
        ref="form"
        :value="value"
        :type="viewRep.type"
        :number-vis-options="viewRep.numberVisOptions"
        :limit-number-vis-options="viewRep.limitNumberVisOptions"
        :possible-value-list="possibleValues"
        :is-valid="isValid"
        :description="description"
        :label="label"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Component>
  </Component>
</template>
