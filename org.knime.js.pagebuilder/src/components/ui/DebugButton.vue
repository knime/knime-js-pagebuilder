<script>
import { mapState } from "vuex";
import { FunctionButton } from "@knime/components";
import InspectorIcon from "@knime/styles/img/icons/code-html.svg";

export default {
  components: {
    FunctionButton,
    InspectorIcon,
  },
  props: {
    debugPort: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout"]),
  },
  methods: {
    openInspector() {
      if (window.openBrowser) {
        window.openBrowser(
          "https://docs.equo.dev/chromium/128.x/developing/debugging.html",
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn("No 'open'-browser function available");
      }
    },
  },
};
</script>

<template>
  <FunctionButton
    primary
    target="_blank"
    class="button"
    title="Open developer tools"
    @click="openInspector()"
  >
    <InspectorIcon />
  </FunctionButton>
</template>

<style lang="postcss" scoped>
.button {
  position: fixed;
  bottom: 10px;
  left: 10px;
}
</style>
