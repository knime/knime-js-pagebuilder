<script>
/**
 * Default label for widgets.
 */
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
  <!-- knime-qf-title legacy selector -->
  <label class="knime-qf-title">
    {{ text }}
  </label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

label.knime-qf-title {
  font-weight: bold;
  font-size: 16px;
  color: var(--theme-color-masala);
  line-height: 24px;
  display: block;
  position: relative;
  margin-bottom: 5px;
}
</style>
