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
  <span>{{ error || '' }}</span>
</template>

<style lang="postcss" scoped>
span {
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  display: inline-block;
  position: relative;
}
</style>
