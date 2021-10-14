<script>
import Vue from 'vue';
import DebugButton from '~/src/components/ui/DebugButton';
import RefreshButton from '~/src/components/ui/RefreshButton';

export default {
    components: {
        // PageBuilder,
        RefreshButton,
        DebugButton
    },
    computed: {
        /* Checks if pageBuilderLoader middleware was successful */
        pageBuilderLoaded() {
            return Boolean(Vue.component('PageBuilder'));
        },
        debugInfo() {
            if (window.getDebugInfo) {
                let debugInfo = JSON.parse(window.getDebugInfo());
                if (debugInfo.remoteDebuggingPort) {
                    return debugInfo;
                }
            }
            return null;
        }

    }
};
</script>

<template>
  <div>
    <PageBuilder v-if="pageBuilderLoaded" />
    <template v-if="debugInfo">
      <DebugButton :debug-port="debugInfo.remoteDebuggingPort" />
      <RefreshButton v-if="debugInfo.refreshRequired" />
    </template>
  </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css";

body {
  padding: 0 15px; /* simulate reduced WebPortal margins */
}
</style>
