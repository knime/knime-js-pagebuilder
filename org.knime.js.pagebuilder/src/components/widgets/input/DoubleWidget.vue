<script>
import NumberWidget from '../baseElements/input/NumberWidget';

/**
 * This is the implementation of the Double Input Widget. This component relies
 * on the NumberWidget component and just passes through all props and events.
 */
export default {
    components: {
        NumberWidget
    },
    methods: {
        validate() {
            return this.$refs.widget.validate();
        }
    }
};
</script>

<template>
  <!-- https://learn-vuejs.github.io/vue-patterns/patterns/#passing-props-listeners -->
  <NumberWidget
    ref="widget"
    type="double"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
