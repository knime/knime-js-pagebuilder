<script>
import LoadingButton from './LoadingButton';

export default {
    components: {
        LoadingButton
    },
    data() {
        return {
            loadingPrev: false,
            loadingNext: false
        };
    },
    methods: {
        async previousPage() {
            this.loadingPrev = true;
            await this.$store.dispatch('pagebuilder/previousPage');
            this.loadingPrev = false;
        },
        async nextPage() {
            this.loadingNext = true;
            await this.$store.dispatch('pagebuilder/nextPage');
            this.loadingNext = false;
        }
    }
};
</script>

<template>
  <div>
    <LoadingButton
      :loading="loadingPrev"
      @click="previousPage"
    >
      ◀ back
    </LoadingButton>
    <LoadingButton
      :loading="loadingNext"
      @click="nextPage"
    >
      next ▶︎
    </LoadingButton>
  </div>
</template>

<style lang="postcss" scoped>
div {
  display: flex;
}
</style>
