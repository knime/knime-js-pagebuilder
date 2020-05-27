<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
import ListBox from 'webapps-common/ui/components/forms/ListBox';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';

/**
 * Singleselect Component
 *
 * Allows the user to select a single item from a list of possible values.
 * The view is either a Radiobuttons, Dropdown or a ListBox.
 *
 * This component acts as a base element. It's agnostic to any knowledge of KNIME API's
 * and can be used in the same way as any of it's children components (Radiobuttons, Dropdown, ListBox).
 */
export default {
    components: {
        ListBox,
        Dropdown,
        RadioButtons
    },
    props: {
        isValid: {
            default: true,
            type: Boolean
        },
        /**
         * @values List, Dropdown, Radio buttons (horizontal), Radio buttons (vertical)
         */
        type: {
            default: 'List',
            type: String
        },
        /**
         * List of possible values. Each item is used as text and id
         */
        possibleValueList: {
            type: Array,
            default: () => [],
            validator(values) {
                return Array.isArray(values);
            }
        },
        limitNumberVisOptions: {
            type: Boolean,
            default: false
        },
        numberVisOptions: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: () => ''
        }
    },
    data() {
        return {
            customValidationErrorMessage: null
        };
    },
    computed: {
        possibleChoices() {
            return this.possibleValueList.map((x) => ({
                id: x,
                text: x
            }));
        },
        maxVisibleListEntries() {
            if (this.limitNumberVisOptions) {
                return this.numberVisOptions;
            }
            return 0;
        },
        isList() {
            return this.type === 'List';
        },
        isDropdown() {
            return this.type === 'Dropdown';
        },
        isRadioButtons() {
            return this.type === 'Radio buttons (vertical)' ||
                this.type === 'Radio buttons (horizontal)';
        },
        radioButtonsAlignment() {
            if (this.type === 'Radio buttons (vertical)') {
                return 'vertical';
            } else if (this.type === 'Radio buttons (horizontal)') {
                return 'horizontal';
            }
            return null;
        }
    },
    methods: {
        onInput(value) {
            this.$emit('input', value);
        },
        hasSelection() {
            return this.$refs.form.hasSelection();
        }
    }
};
</script>

<template>
  <div>
    <RadioButtons
      v-if="isRadioButtons"
      ref="form"
      :alignment="radioButtonsAlignment"
      :value="value"
      :possible-values="possibleChoices"
      :is-valid="isValid"
      :title="description"
      @input="onInput"
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
      @input="onInput"
    />
    <Dropdown
      v-if="isDropdown"
      ref="form"
      :value="value"
      :aria-label="label"
      :possible-values="possibleChoices"
      :is-valid="isValid"
      :title="description"
      @input="onInput"
    />
  </div>
</template>
