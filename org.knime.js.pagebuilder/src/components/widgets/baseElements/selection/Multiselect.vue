<script>
import MultiselectListBox from 'webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';
import Checkboxes from 'webapps-common/ui/components/forms/Checkboxes';

/**
 * Multiselect Component
 *
 * Allows the user to select multiple items from a list of possible values.
 * The view is either a Twinlist, Checkboxes or a ListBox.
 *
 * This component acts as a base element. It's agnostic to any knowledge of KNIME API's
 * and can be used in the same way as any of it's children components (Twinlist,
 * Checkboxes, ListBox).
 */
export default {
    components: {
        Checkboxes,
        MultiselectListBox,
        Twinlist
    },
    props: {
        isValid: {
            default: true,
            type: Boolean
        },
        id: {
            type: String,
            default: null
        },
        /**
         * @values List, Twinlist, Check boxes (horizontal), Check boxes (vertical)
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
            type: Array,
            default: () => []
        }
    },
    computed: {
        maxVisibleListEntries() {
            if (this.limitNumberVisOptions) {
                return this.numberVisOptions;
            }
            return 0; // default: show all
        },
        isList() {
            return this.type === 'List';
        },
        isTwinlist() {
            return this.type === 'Twinlist';
        },
        isCheckboxes() {
            return this.type === 'Check boxes (horizontal)' ||
                this.type === 'Check boxes (vertical)';
        },
        checkBoxesAlignment() {
            if (this.type === 'Check boxes (vertical)') {
                return 'vertical';
            } else if (this.type === 'Check boxes (horizontal)') {
                return 'horizontal';
            }
            return null;
        },
        possibleValues() {
            // remove duplicate elements (as they cause key problems); id must be unique
            return [...new Set(this.possibleValueList)].map((x) => ({
                id: x,
                text: x
            }));
        }
    },
    methods: {
        onInput(value) {
            this.$emit('input', value);
        },
        hasSelection() {
            return this.$refs.form.hasSelection();
        },
        /**
         * Validation
         * @returns {Object}
         */
        validate() {
            return typeof this.$refs.form.validate === 'function'
                ? this.$refs.form.validate()
                : { isValid: true };
        }
    }
};
</script>

<template>
  <div>
    <Checkboxes
      v-if="isCheckboxes"
      :id="id"
      ref="form"
      :value="value"
      :alignment="checkBoxesAlignment"
      :aria-label="label"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @input="onInput"
    />
    <Twinlist
      v-if="isTwinlist"
      :id="id"
      ref="form"
      :value="value"
      :size="maxVisibleListEntries"
      label-left="Excludes"
      label-right="Includes"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @input="onInput"
    />
    <MultiselectListBox
      v-if="isList"
      :id="id"
      ref="form"
      :value="value"
      :size="maxVisibleListEntries"
      :aria-label="label"
      :possible-values="possibleValues"
      :is-valid="isValid"
      :title="description"
      @input="onInput"
    />
  </div>
</template>
