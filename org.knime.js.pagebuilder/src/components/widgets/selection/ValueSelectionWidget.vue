<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Singleselect from '@/components/widgets/baseElements/selection/Singleselect';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';

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
        Singleselect,
        Dropdown,
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
                [VALUE_KEY_NAME]: '',
                [COLUMN_KEY_NAME]: ''
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
        possibleValueList() {
            return this.viewRep.possibleValues[this.column] || [];
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
        isRadioButtons() {
            return this.viewRep.type === 'Radio buttons (vertical)' ||
                this.viewRep.type === 'Radio buttons (horizontal)';
        },
        isColumnLocked() {
            return this.viewRep.lockColumn;
        },
        isColumnValid() {
            if (this.isColumnLocked) {
                return true;
            }
            return this.viewRep.possibleColumns.includes(this.column);
        },
        hasSelection() {
            return this.possibleValueList.includes(this.value);
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
            this.customValidationErrorMessage = null; // TODO: WEBP-292 remove
            if (this.viewRep.required) {
                isValid = this.hasSelection && this.isColumnValid;
                if (!this.hasSelection) {
                    this.customValidationErrorMessage = 'Selection is required';
                }
                if (!this.isColumnValid) {
                    this.customValidationErrorMessage = 'Select a valid Column first';
                }
            }
            if (isValid && this.$refs.form.validate) {
                isValid = this.$refs.form.validate(); // TODO: WEBP-292 update
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
        :is-valid="isColumnValid"
        aria-label="Column"
        :possible-values="possibleColumns"
        @input="onColumnChange"
      />
      <Label
        v-if="!isColumnLocked"
        text="Value"
      />
      <Singleselect
        ref="form"
        :value="value"
        :type="viewRep.type"
        :number-vis-options="viewRep.numberVisOptions"
        :limit-number-vis-options="viewRep.limitNumberVisOptions"
        :is-valid="isValid"
        :title="description"
        :possible-value-list="possibleValueList"
        :label="label"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Component>
  </div>
</template>
