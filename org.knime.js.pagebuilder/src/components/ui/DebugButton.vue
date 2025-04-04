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
  data() {
    return {
      debugUrl: "",
      multipleTargets: false,
    };
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout"]),
  },
  async mounted() {
    // get all existing debugger instances
    const remoteDebuggingUrl = `http://localhost:${this.debugPort}`;
    const response = await fetch(`${remoteDebuggingUrl}/json`);
    const targets = await response.json();
    targets.forEach((target) => {
      if (target.type === "page" && target.title === "KNIME PageBuilder") {
        if (this.debugUrl) {
          this.multipleTargets = true;
        } else {
          this.debugUrl = `${remoteDebuggingUrl}${target.devtoolsFrontendUrl}`;
        }
      }
    });
  },
  methods: {
    openNewWindow(url) {
      window.open(url, "_blank");
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
    :disabled="multipleTargets"
    @click="openNewWindow(debugUrl)"
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
