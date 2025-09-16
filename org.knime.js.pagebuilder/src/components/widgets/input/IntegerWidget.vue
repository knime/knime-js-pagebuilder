<script>
import NumberWidget from "../NumberWidget.vue";

/**
 * This is the implementation of the Integer Input Widget. This component relies
 * on the NumberWidget component and just passes through all props, events and some methods.
 */
export default {
  components: {
    NumberWidget,
  },
  methods: {
    validate() {
      if (!this.$refs.widget) {
        // guard against null ref access outside of lifecycle hooks
        return { isValid: true, errorMessage: null };
      }
      return this.$refs.widget.validate();
    },
    onChange(value) {
      // only needed for hasValueGetter() of Widget.vue
      this.$refs.widget?.onChange(value);
    },
  },
};
</script>

<template>
  <NumberWidget v-bind="$attrs" ref="widget" type="integer" />
</template>
