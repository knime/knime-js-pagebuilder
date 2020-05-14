<script>
import Label from 'webapps-common/ui/components/forms/Label';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import MultiSelectView from '@/components/widgets/baseElements/selection/MultiSelectView';
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
        MultiSelectView,
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
                return Boolean(nodeId);
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
        possibleValues() {
            return this.viewRep.possibleValues[this.column].map((x) => ({
                id: x,
                text: x
            }));
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
            if (this.customValidationErrorMessage) {
                return this.customValidationErrorMessage;
            }
            return 'Current selection is invalid';
        },
        value() {
            return this.valuePair[VALUE_KEY_NAME];
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
            if (this.isColumnLocked) {
                return true;
            }
            return this.viewRep.possibleColumns.includes(this.column);
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
            this.customValidationErrorMessage = null;
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
                this.customValidationErrorMessage = 'Selection is required';
            }
            return isValid;
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
      :is="viewRep.type == 'List' ? 'Label' : 'Fieldset'"
      :text="isColumnLocked ? label : 'Value'"
    >
      <MultiSelectView
        ref="form"
        :value="value"
        :type="viewRep.type"
        :number-vis-options="viewRep.numberVisOptions"
        :limit-number-vis-options="viewRep.limitNumberVisOptions"
        :possible-values="possibleValues"
        :is-valid="isValid"
        :description="description"
        :label="label"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Component>
  </Component>
</template>
