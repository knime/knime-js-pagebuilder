<script>
import { mapState } from "vuex";
import { FunctionButton } from "@knime/components";
import RefreshIcon from "@knime/styles/img/icons/load.svg";

export default {
  components: {
    FunctionButton,
    RefreshIcon,
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout"]),
  },
  methods: {
    refresh() {
      if (window.reloadCEFWindow) {
        window.reloadCEFWindow();
      } else {
        // eslint-disable-next-line no-console
        console.warn("No 'reloadCEFWindow'-browser function available");
      }
    },
  },
};
</script>

<template>
  <FunctionButton primary class="button" title="Refresh" @click="refresh">
    <RefreshIcon />
  </FunctionButton>
</template>

<style lang="postcss" scoped>
.button {
  position: fixed;
  bottom: 10px;
  left: 50px;
}
</style>
