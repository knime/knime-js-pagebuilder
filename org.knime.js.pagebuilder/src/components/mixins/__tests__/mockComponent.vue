<template>
  <div class="test" />
</template>
  
<script>
/**
   * Return a component to be used as dummy in order
   * to mock things like mixins.
   */
export default {
    name: 'MockComponent',
    props: {
        viewConfig: {
            default: () => ({}),
            type: Object
        },
        isWidget: {
            default: false,
            type: Boolean
        },
        extensionConfig: {
            default: () => null,
            type: Object
        }
    }
};
</script>
