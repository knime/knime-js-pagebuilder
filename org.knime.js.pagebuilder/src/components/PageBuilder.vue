<script>
import validKeys from '~/store/keys';
import * as storeConfig from '~/store/pagebuilder';
import Controls from './Controls';
import Page from '~/src/components/Page';
import Result from '~/src/components/Result';

const supportedWizardExecutionStates = ['INTERACTION_REQUIRED', 'EXECUTING_FINISHED', 'EXECUTING_FAILED'];

export default {
    components: {
        Controls,
        Page,
        Result
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
        executionState() {
            let page = this.$store.state.pagebuilder.page;
            let state = page && page.wizardExecutionState;
            if (!supportedWizardExecutionStates.includes(state)) {
                consola.error(`PageBuilder used with unsupported viewState: ${state}`);
                return null;
            }
            return state;
        }
    }
};
</script>

<template>
  <div v-if="executionState">
    <Page v-if="executionState === 'INTERACTION_REQUIRED'" />
    <Result v-else-if="executionState === 'EXECUTING_FINISHED' || executionState === 'EXECUTING_FAILED'" />

    <Controls />
  </div>
</template>
