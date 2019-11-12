<script>
/**
 * Default error message for widgets.
 */
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
  <!-- knime-qf-error legacy selector -->
  <label class="knime-qf-error">
    {{ error }}
  </label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

label.knime-qf-error {
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  line-height: 18px;
  height: 18px;
  display: block;
  position: relative;
}
</style>
