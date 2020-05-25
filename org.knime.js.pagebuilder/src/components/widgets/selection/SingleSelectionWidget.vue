<script>
import BaseSingleSelectionWidget from '../BaseSingleSelectionWidget';

/**
 * Implementation of the Single Selection Widget. Allows the user to select one item from a list of possible choices.
 * The view representation can either be a Dropdown, ListBox or RadioButtons.
 */
export default {
    components: {
        BaseSingleSelectionWidget
    },
    methods: {
        validate() {
            return this.$refs.widget.validate();
        },
        onChange(value) { // only needed for hasValueGetter() of Widget.vue
            return this.$refs.widget.onChange(value);
        }
    }
};
</script>

<template>
  <BaseSingleSelectionWidget
    ref="widget"
    data-type-key="value"
    possible-choices-key="possibleChoices"
    :value-is-array="true"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
