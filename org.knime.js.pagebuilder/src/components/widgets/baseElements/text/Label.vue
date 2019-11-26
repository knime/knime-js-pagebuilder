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
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  display: block;
  margin-bottom: 5px;
}
</style>
