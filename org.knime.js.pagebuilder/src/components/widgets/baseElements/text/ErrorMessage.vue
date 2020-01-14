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
  <label class="knime-error knime-qf-error">
    <!-- In case of empty text, render a non-breaking space '\u00a0' for MS Edge. Otherwise, there is a bug that causes
     the validation message to be visible even after the text has been updated to the empty string. -->
    {{ error || '\u00a0' }}
  </label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

label.knime-error {
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  line-height: 18px;
  height: 18px;
  display: block;
  position: relative;
}
</style>
