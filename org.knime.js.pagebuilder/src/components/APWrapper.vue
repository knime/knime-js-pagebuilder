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
        containsUIExtensionDialog() {
            return this.$store.state.pagebuilder.page.wizardPageContent?.nodeViews?.hasOwnProperty('DIALOG');
        },
        debugInfo() {
            let debugInfo = null;
            if (window.getDebugInfo) {
                try {
                    debugInfo = JSON.parse(window.getDebugInfo());
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.debug('Debug information present but unable to load.');
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
      <DebugButton
        :debug-port="debugInfo.remoteDebuggingPort"
        :position="containsUIExtensionDialog ? 'left' : 'right'"
      />
      <RefreshButton
        v-if="debugInfo.refreshRequired"
        :position="containsUIExtensionDialog ? 'left' : 'right'"
      />
    </template>
  </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css";

body {
  padding: 0 15px; /* simulate reduced WebPortal margins */
}
</style>
