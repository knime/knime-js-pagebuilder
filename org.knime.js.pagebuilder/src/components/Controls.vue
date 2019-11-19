<script>
import Button from '~/webapps-common/ui/components/Button';
import ArrowLeftIcon from '~/webapps-common/ui/assets/img/icons/arrow-left.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';

export default {
    components: {
        Button,
        ArrowLeftIcon,
        CloseIcon
    },
    data() {
        return {
            loading: false
        };
    },
    computed: {
        hasPreviousPage() {
            return this.$store.state.pagebuilder.page && this.$store.state.pagebuilder.page.hasPreviousPage;
        }
    },
    methods: {
        async previousPage() {
            this.loading = true;
            await this.$store.dispatch('pagebuilder/previousPage');
            this.loading = false;
        },
        async cancel() {
            // TODO
            // await this.$store.dispatch('pagebuilder/previousPage');
        },
        async nextPage() {
            this.loading = true;
            await this.$store.dispatch('pagebuilder/nextPage');
            this.loading = false;
        }
    }
};
</script>

<template>
  <section>
    <div class="grid-container">
      <div class="grid-item-12 controls">
        <div>
          <Button
            v-if="hasPreviousPage"
            compact
            :disabled="loading"
            @click="previousPage"
          >
            <ArrowLeftIcon />Back
          </Button>
        </div>
        <Button
          compact
          @click="cancel"
        >
          <CloseIcon />Cancel
        </Button>
        <Button
          primary
          class="next"
          :disabled="loading"
          @click="nextPage"
        >
          Next
        </Button>
      </div>
    </div>
  </section>
</template>

<style lang="postcss" scoped>
section {
  position: fixed;
  z-index: 10;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--theme-color-gray-ultra-light);
  box-shadow: 0 1px 4px 0 var(--theme-color-gray-dark-semi);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

button {
  &.next {
    width: 95px;
  }
}
</style>
