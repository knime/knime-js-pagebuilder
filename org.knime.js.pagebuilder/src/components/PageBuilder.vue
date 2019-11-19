<script>
import validKeys from '~/store/keys';
import * as storeConfig from '~/store/pagebuilder';
import Controls from './Controls';
import Page from '~/src/components/Page';

export default {
    components: {
        Controls,
        Page
    },

    initStore(actions, store) { // this method is to be called by the embedding app, cf. README
        consola.debug('PageBuilder initStore');

        // validate store API
        let actualKeys = JSON.stringify(Object.keys(actions).sort());
        let expectedKeys = JSON.stringify([...validKeys].sort());
        consola.debug('Validating store actions', actualKeys, expectedKeys);
        if (actualKeys !== expectedKeys) {
            throw new Error(`Validation of PageBuilder actions ${actualKeys} failed (expecting ${expectedKeys})`);
        }

        consola.trace('Registering PageBuilder store');
        store.registerModule('pagebuilder', storeConfig);
        store.registerModule(['pagebuilder', 'outbound'], {
            namespaced: true,
            actions
        });
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
  <div>
    <Page v-if="hasPage" />

    <Controls />
  </div>
</template>
