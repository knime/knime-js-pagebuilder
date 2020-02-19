<script>
import * as storeConfig from '~/store/pagebuilder';
import Page from '~/src/components/layout/Page';

export default {
    components: {
        Page
    },
    initStore(store) { // this method is to be called by the embedding app, cf. README
        consola.debug('PageBuilder initStore');
        store.registerModule('pagebuilder', storeConfig);
    },
    computed: {
        hasPage() {
            let page = this.$store.state.pagebuilder.page;
            let state = page && page.wizardExecutionState;
            if (state === 'INTERACTION_REQUIRED') {
                return true;
            } else {
                consola.error(`PageBuilder used with unsupported state: ${state}`);
                return false;
            }
        }
    }
};
</script>

<template>
  <Page v-if="hasPage" />
</template>
