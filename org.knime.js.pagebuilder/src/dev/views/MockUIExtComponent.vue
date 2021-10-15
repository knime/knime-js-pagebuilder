<script>

export default {
    props: {
        knimeService: {
            type: Object,
            required: false,
            default: null
        }
    }
};
</script>

<template>
  <div>
    <h5>
      Pre-registered vue component.
    </h5>
    <pre>
      knime-service: {{ knimeService.extensionConfig }}
    </pre>
  </div>
</template>

<style lang="postcss" scoped>
div {
  border: 1px red solid;
  margin: 20px;
  font-weight: bold;
}
</style>

