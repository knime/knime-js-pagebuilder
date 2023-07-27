<script>
export default {
  props: {
    knimeService: {
      type: Object,
      required: false,
      default: null,
    },
  },
};
</script>

<template>
  <div>
    Lazy loaded Vue component.
    <pre>
      knime-service: {{ knimeService.extensionConfig }}
    </pre>
  </div>
</template>

<style lang="postcss" scoped>
div {
  border: 2px green solid;
  margin: 5px;
  font-weight: bold;
}
</style>
