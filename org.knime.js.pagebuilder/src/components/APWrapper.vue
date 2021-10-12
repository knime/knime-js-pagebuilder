<script>
import Vue from 'vue';
// TODO: NXT-729 enable debug button when port added
// import DebugButton from '~/src/components/ui/DebugButton';
// import RefreshButton from '~/src/components/ui/RefreshButton';

export default {
    components: {
        // PageBuilder,
        // TODO: NXT-729 enable debug button when port added
        // RefreshButton,
        // DebugButton
    },
    computed: {
        /* Checks if pageBuilderLoader middleware was successful */
        pageBuilderLoaded() {
            return Boolean(Vue.component('PageBuilder'));
        }
    }
};
</script>

<template>
  <PageBuilder v-if="pageBuilderLoaded" />
  <!-- TODO: NXT-729 enable debug button when port added -->
  <!-- <template v-if="<insert logic, i.e. page.remoteDebugPort>">
      <DebugButton :debug-port="<insert logic, i.e. page.remoteDebugPort>" />
      <RefreshButton />
    </template> -->
</template>

<style lang="postcss">
@import "webapps-common/ui/css";

body {
  padding: 0 15px; /* simulate reduced WebPortal margins */
}
</style>
