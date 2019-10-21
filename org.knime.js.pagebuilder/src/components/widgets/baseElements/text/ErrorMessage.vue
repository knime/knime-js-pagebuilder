<script>
export default {
    props: {
        error: {
            default: '',
            type: String
        }
    }
};
</script>

<template>
  <label class="knime-qf-title">
    {{ error }}
  </label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

label.knime-qf-title {
  font-family: "Roboto", BlinkMacSystemFont, -apple-system, "Segoe UI", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  letter-spacing: 0.03px;
  line-height: 18px;
  height: 18px;
  display: block;
  position: relative;
}
</style>

