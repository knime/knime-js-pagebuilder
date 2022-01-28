<script>
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import RefreshIcon from '~/webapps-common/ui/assets/img/icons/load.svg?inline';

export default {
    components: {
        FunctionButton,
        RefreshIcon
    },
    props: {
        position: {
            type: String,
            required: false,
            default: 'right'
        }
    },
    computed: {
        classes() {
            return ['button', 'button-'.concat(this.position)];
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
    :class="classes"
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

