<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import ListBox from 'webapps-common/ui/components/forms/ListBox';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';

/**
 * Reusable base implementation of a Single Selection Widget.
 * Allows the user to select one item from a list of possible choices.
 * The view representation can either be a Dropdown, ListBox or RadioButtons.
 * Can be configured to use different data types (key names in the json config)
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
            default: null,
            type: Object
        },
        // viewRep handling settings
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
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        possibleChoices() {
            return this.viewRep[this.possibleChoicesKey].map((x) => ({
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
            if (this.viewRep.errorMessage) {
                return this.viewRep.errorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current selected item is invalid';
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
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
            }
            if (isValid && this.$refs.form.validate) {
                isValid = this.$refs.form.validate();
            }
            return isValid;
        }
    }
};
</script>

<template>
  <div>
    <Fieldset
      v-if="isRadioButtons"
      :text="label"
      class="fieldset"
    >
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
      <ErrorMessage :error="errorMessage" />
    </Fieldset>
    <Label
      v-if="!isRadioButtons"
      :text="label"
    >
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
    </Label>
  </div>
</template>

<style lang="postcss" scoped>
/* required for text ellipsis on radio-buttons */
.fieldset {
  min-width: auto;
  overflow-x: hidden;
}
</style>
