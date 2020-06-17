<script>
import Vue from 'vue';

export default {
    components: {
        // PageBuilder
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
</template>
<style lang="postcss">
@import "webapps-common/ui/css";

body {
  padding: 0 15px; /* simulate reduced WebPortal margins */
}
</style>
