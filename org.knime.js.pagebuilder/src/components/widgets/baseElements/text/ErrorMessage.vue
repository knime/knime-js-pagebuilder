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
  <span :class="{ invisible: error === null }">{{ error || '' }}</span>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

/**
 * NOTE: The visibility was added to fix bugs in Edge classic with missing updates of empty strings
 */
.invisible {
  visibility: hidden;
}

span {
  font-weight: 300;
  font-size: 13px;
  color: var(--theme-color-error);
  display: inline-block;
  position: relative;
}
</style>
