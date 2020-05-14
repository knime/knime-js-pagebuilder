<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import MultiselectListBox from 'webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Checkboxes from 'webapps-common/ui/components/forms/Checkboxes';

const VALUE_KEY_NAME = 'values';
const COLUMN_KEY_NAME = 'column';

/**
 * Value Filter Selection Widget
 *
 * TODO: update
 * Allows the user to select multiple items from a list of possible choices.
 * The view representation can either be a Twinlist, Checkboxes or a ListBox.
 *
 */
export default {
    components: {
        Checkboxes,
        Fieldset,
        MultiselectListBox,
        Twinlist,
        Label,
        Dropdown,
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
        maxVisibleListEntries() {
            if (this.viewRep.limitNumberVisOptions) {
                return this.viewRep.numberVisOptions;
            }
            return 0; // default: show all
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
        isList() {
            return this.viewRep.type === 'List';
        },
        isTwinlist() {
            return this.viewRep.type === 'Twinlist';
        },
        possibleColumns() {
            return this.viewRep.possibleColumns.map((x) => ({
                id: x,
                text: x
            }));
        },
        isCheckboxes() {
            return this.viewRep.type === 'Check boxes (horizontal)' ||
                this.viewRep.type === 'Check boxes (vertical)';
        },
        checkBoxesAlignment() {
            if (this.viewRep.type === 'Check boxes (vertical)') {
                return 'vertical';
            } else if (this.viewRep.type === 'Check boxes (horizontal)') {
                return 'horizontal';
            }
            return null;
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
  <div>
    <Component
      :is="isColumnLocked && !isCheckboxes ? 'Label' : 'Fieldset'"
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
        :is-valid="isColumnValid"
        aria-label="Column"
        :possible-values="possibleColumns"
        @input="onColumnChange"
      />
      <Label
        v-if="!isColumnLocked"
        text="Value"
      />
      <Checkboxes
        v-if="isCheckboxes"
        ref="form"
        :value="value"
        :alignment="checkBoxesAlignment"
        :aria-label="label"
        :possible-values="possibleValues"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <MultiselectListBox
        v-if="isList"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        :aria-label="label"
        :possible-values="possibleValues"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <Twinlist
        v-if="isTwinlist"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        label-left="Excludes"
        label-right="Includes"
        :possible-values="possibleValues"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Component>
  </div>
</template>
