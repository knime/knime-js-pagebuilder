<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import ListBox from 'webapps-common/ui/components/forms/ListBox';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';

const VALUE_KEY_NAME = 'value';
const COLUMN_KEY_NAME = 'column';

/*
 * Implementation of the Value Selection Widget. Allows the user to select one column from a list of possible columns.
 * With a second form element the values in that column can be selected. This form element can either be a Dropdown,
 * ListBox or RadioButtons. The column may be locked and not changeable by the user.
 * In this mode it is still possible to select the value.
 */
export default {
    components: {
        Fieldset,
        ListBox,
        Label,
        Dropdown,
        RadioButtons,
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
                [VALUE_KEY_NAME]: '',
                [COLUMN_KEY_NAME]: ''
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
        possibleChoices() {
            return (this.viewRep.possibleValues[this.column] || []).map((x) => ({
                id: x,
                text: x
            }));
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
            return 0;
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }

            // backend error message or frontend or default
            return this.viewRep.errorMessage || this.customValidationErrorMessage || 'Selection is invalid or missing';
        },
        value() {
            return this.valuePair[VALUE_KEY_NAME];
        },
        column() {
            return this.valuePair[COLUMN_KEY_NAME];
        },
        isList() {
            return this.viewRep.type === 'List';
        },
        isDropdown() {
            return this.viewRep.type === 'Dropdown';
        },
        isRadioButtons() {
            return this.viewRep.type === 'Radio buttons (vertical)' ||
                this.viewRep.type === 'Radio buttons (horizontal)';
        },
        radioButtonsAlignment() {
            if (this.viewRep.type === 'Radio buttons (vertical)') {
                return 'vertical';
            } else if (this.viewRep.type === 'Radio buttons (horizontal)') {
                return 'horizontal';
            }
            return null;
        },
        isColumnLocked() {
            return this.viewRep.lockColumn;
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
        validateColumn() {
            return this.isColumnLocked || (this.$refs.column && this.$refs.column.hasSelection());
        },
        validate() {
            let isValid = true;
            this.customValidationErrorMessage = null;
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection() && this.validateColumn();
                if (this.validateColumn()) {
                    this.customValidationErrorMessage = 'Selection is required';
                } else {
                    this.customValidationErrorMessage = 'Select a Column first';
                }
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
  <div>
    <Component
      :is="isColumnLocked && !isRadioButtons ? 'Label' : 'Fieldset'"
      :text="label"
      class="fieldset"
    >
      <Label
        v-if="!isColumnLocked"
        text="Column"
      />
      <Dropdown
        v-if="!isColumnLocked"
        ref="column"
        :value="column"
        :is-valid="validateColumn()"
        aria-label="Column"
        :possible-values="possibleColumns"
        @input="onColumnChange"
      />
      <Label
        v-if="!isColumnLocked"
        text="Value"
      />
      <RadioButtons
        v-if="isRadioButtons"
        ref="form"
        :alignment="radioButtonsAlignment"
        :value="value"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ListBox
        v-if="isList"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        :aria-label="label"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <Dropdown
        v-if="isDropdown"
        ref="form"
        :value="value"
        :aria-label="label"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Component>
  </div>
</template>

<style lang="postcss" scoped>
/* TODO remove me */

/* required for text ellipsis on radio-buttons */
.fieldset {
  min-width: 100% !important; /* fix for Edge Legacy (v18) */
  overflow-x: hidden;
}
</style>
