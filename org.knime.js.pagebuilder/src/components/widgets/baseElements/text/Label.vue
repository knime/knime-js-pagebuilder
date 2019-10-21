<script>
export default {
    props: {
        text: {
            default: '',
            type: String
        }
    }
};
</script>

<template>
  <label class="knime-qf-title">
    {{ text }}
  </label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

label.knime-qf-title {
  font-family: "Roboto", BlinkMacSystemFont, -apple-system, "Segoe UI", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
  font-weight: bold;
  font-size: 16px;
  color: var(--theme-color-masala);
  letter-spacing: 0.1px;
  line-height: 24px;
  display: block;
  position: relative;
}
</style>

