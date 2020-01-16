<script>
/**
 * Default error message for widgets.
 */
export default {
    props: {
        error: {
            default: null,
            type: String
        }
    }
};
</script>

<template>
  <!-- knime-qf-error legacy selector -->
  <span class="knime-error knime-qf-error">{{ error || '' }}</span>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

span {
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  line-height: 18px;
  height: 18px;
  display: block;
  position: relative;
}
</style>
