<script>
import * as pagebuilderStoreConfig from '~/store/pagebuilder';
import * as interactivityStoreConfig from '~/store/interactivity';
import Page from '~/src/components/layout/Page';

export default {
    components: {
        Page
    },
    initStore(store) { // this method is to be called by the embedding app, cf. README
        consola.debug('PageBuilder initStore');
        store.registerModule('pagebuilder', pagebuilderStoreConfig);
        store.registerModule('pagebuilder/interactivity', interactivityStoreConfig);
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
