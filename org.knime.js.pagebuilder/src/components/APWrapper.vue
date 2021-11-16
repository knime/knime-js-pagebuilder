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
            let debugInfo = null;
            if (window.getDebugInfo) {
                try {
                    debugInfo = JSON.parse(window.getDebugInfo());
                } catch (err) {
                    consola.debug('Debug information present but unable to load.');
                }
            }
            return debugInfo;
        },
        /* For now debugging is assumed to be enabled if a remote debugging port is set */
        debugEnabled() {
            return this.debugInfo?.remoteDebuggingPort;
        }

    }
};
</script>

<template>
  <div>
    <PageBuilder v-if="pageBuilderLoaded" />
    <template v-if="debugEnabled">
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
