<script>
import { mapState } from "vuex";
import PageBuilder from "./PageBuilder.vue";
import DebugButton from "./ui/DebugButton.vue";
import RefreshButton from "./ui/RefreshButton.vue";

export default {
  components: {
    PageBuilder,
    RefreshButton,
    DebugButton,
  },
  data() {
    return {
      debugInfo: null,
    };
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout", "isReporting"]),
    debugPort() {
      return this.debugInfo?.remoteDebuggingPort;
    },
    classes() {
      let classes = ["ap-wrapper"];
      return classes;
    },
  },
  created() {
    if (window.getDebugInfo) {
      try {
        this.debugInfo = JSON.parse(window.getDebugInfo());
      } catch (err) {
        consola.debug("Debug information present but unable to load.");
      }
    }

    PageBuilder.initStore(this.$store);
  },
};
</script>

<template>
  <div :class="classes">
    <PageBuilder />
    <template v-if="debugPort">
      <DebugButton :debug-port="debugPort" />
      <RefreshButton v-if="debugInfo.refreshRequired" />
    </template>
  </div>
</template>

<style lang="postcss">
@import url("modern-normalize/modern-normalize.css");
@import url("webapps-common/ui/css/variables");
@import url("webapps-common/ui/css/basics");
@import url("webapps-common/ui/css/fonts");
@import url("webapps-common/ui/css/grid");
</style>
