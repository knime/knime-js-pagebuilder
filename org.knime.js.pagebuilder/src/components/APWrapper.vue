<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import DebugButton from '~/src/components/ui/DebugButton';
import RefreshButton from '~/src/components/ui/RefreshButton';

export default {
    components: {
        // PageBuilder,
        RefreshButton,
        DebugButton
    },
    computed: {
        ...mapState('pagebuilder', ['isDialogLayout']),
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
                    // eslint-disable-next-line no-console
                    console.debug('Debug information present but unable to load.');
                }
            }
            return debugInfo;
        },
        debugPort() {
            return this.debugInfo?.remoteDebuggingPort;
        }
    }
};
</script>

<template>
  <div>
    <PageBuilder
      v-if="pageBuilderLoaded"
      platform="AP"
    />
    <template v-if="debugPort">
      <DebugButton :debug-port="debugPort" />
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
