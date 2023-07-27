<script>
import NumberWidget from "../NumberWidget.vue";

/**
 * This is the implementation of the Double Input Widget. This component relies
 * on the NumberWidget component and just passes through all props, events and some methods.
 */
export default {
  components: {
    NumberWidget,
  },
  methods: {
    validate() {
      return this.$refs.widget.validate();
    },
    onChange(value) {
      // only needed for hasValueGetter() of Widget.vue
      return this.$refs.widget.onChange(value);
    },
  },
};
</script>

<template>
  <!-- https://learn-vuejs.github.io/vue-patterns/patterns/#passing-props-listeners -->
  <NumberWidget v-bind="$attrs" ref="widget" type="double" />
</template>
