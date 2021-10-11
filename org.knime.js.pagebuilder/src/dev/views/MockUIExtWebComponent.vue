<script>

export default {
    props: {
        name: {
            type: String,
            required: false,
            default: null
        },
        initData: {
            type: String,
            required: false,
            default: null
        }
    }
};
</script>

<template>
  <div>
    Vue component built as web-component.
    <pre>
      DOM Element: {{ name }}
      Data: {{ initData }}
    </pre>
  </div>
</template>

<style lang="postcss" scoped>
div {
  border: 2px blue solid;
  margin: 20px;
  font-weight: bold;
}
</style>

