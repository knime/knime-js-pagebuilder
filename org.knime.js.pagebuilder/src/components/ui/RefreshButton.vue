<script>
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import RefreshIcon from '~/webapps-common/ui/assets/img/icons/load.svg?inline';

export default {
    components: {
        FunctionButton,
        RefreshIcon
    },
    computed: {
        position() {
            return this.isNodeDialog ? 'button-left' : 'button-right';
        },
        isNodeDialog() {
            return this.$store.state.pagebuilder.isNodeDialog;
        }
    },
    methods: {
        refresh() {
            if (window.reloadCEFWindow) {
                window.reloadCEFWindow();
            } else {
                // eslint-disable-next-line no-console
                console.warn("No 'reloadCEFWindow'-browser function available");
            }
        }
    }
};
</script>

<template>
  <FunctionButton
    primary
    :class="['button', position]"
    title="Refresh"
    @click="refresh"
  >
    <RefreshIcon />
  </FunctionButton>
</template>

<style lang="postcss" scoped>
.button {
  position: fixed;
  bottom: 10px;
}

.button-right {
  right: 50px;
}

.button-left {
  left: 50px;
}
</style>

