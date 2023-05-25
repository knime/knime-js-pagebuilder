<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons.vue';
import ListBox from 'webapps-common/ui/components/forms/ListBox.vue';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown.vue';

/**
 * SingleSelect Component
 *
 * Allows the user to select a single item from a list of possible values.
 * The view is either a RadioButtons, Dropdown or a ListBox.
 *
 * This component acts as a base element. It's agnostic to any knowledge of KNIME API's
 * and can be used in the same way as any of it's children components (RadioButtons, Dropdown, ListBox).
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
        id: {
            type: String,
            default: null
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
        modelValue: {
            type: String,
            default: () => ''
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            customValidationErrorMessage: null
        };
    },
    computed: {
        possibleChoices() {
            // remove duplicate elements (as they cause key problems); id must be unique
            return [...new Set(this.possibleValueList)].map((x) => ({
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
        onChange(value) {
            this.$emit('update:modelValue', value);
        },
        /**
         * Has a selection?
         * @returns {boolean}
         */
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
    <RadioButtons
      v-if="isRadioButtons"
      :id="id"
      ref="form"
      :alignment="radioButtonsAlignment"
      :model-value="modelValue"
      :possible-values="possibleChoices"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <ListBox
      v-if="isList"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :size="maxVisibleListEntries"
      :aria-label="label"
      :possible-values="possibleChoices"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
    <Dropdown
      v-if="isDropdown"
      :id="id"
      ref="form"
      :model-value="modelValue"
      :aria-label="label"
      :possible-values="possibleChoices"
      :is-valid="isValid"
      :title="description"
      @update:model-value="onChange"
    />
  </div>
</template>
