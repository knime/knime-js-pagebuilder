<script>
// TODO move this to webapps-common because it's needed in WebPortal as well?

import Button from '~/webapps-common/ui/components/Button';

export default {
    components: {
        Button
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<template>
  <Button
    :disabled="loading"
    @click="$emit('click')"
  >
    <slot /> <span
      v-if="loading"
      class="loading"
    >⟳</span>
  </Button>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

@keyframes spin { 100% { transform: rotate(360deg); } }

span {
  display: inline-block;
}

button .loading {
  animation: spin 1s linear infinite;
}

button:disabled {
  pointer-events: none;
}
</style>

