<script>
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
@import url("@knime/styles/css/variables");
@import url("@knime/styles/css/basics");
@import url("@knime/styles/css/fonts");
@import url("@knime/styles/css/grid");

/* add small extra side padding for single or component views in AP view window */
.ap-wrapper .view-layout {
  padding: 0 5px;
}
</style>
