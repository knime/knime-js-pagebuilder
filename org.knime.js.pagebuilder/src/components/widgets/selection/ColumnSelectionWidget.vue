<script>
import BaseSingleSelectionWidget from '../BaseSingleSelectionWidget';

/**
 * Implementation of the Column Selection Widget. Allows the user to select one column from a list of possible columns.
 * The view representation can either be a Dropdown, ListBox or RadioButtons. Very similar to Single Selection Widget.
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
    data-type-key="column"
    possible-choices-key="possibleColumns"
    :value-is-array="false"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
