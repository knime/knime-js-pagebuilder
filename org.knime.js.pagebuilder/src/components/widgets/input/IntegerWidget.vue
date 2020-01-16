<script>
import NumberWidget from '../baseElements/input/NumberWidget';

/**
 * This is the implementation of the Integer Input Widget. This component relies
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
  <NumberWidget
    ref="widget"
    type="integer"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
