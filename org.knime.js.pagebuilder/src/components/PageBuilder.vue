<script>
import validKeys from '~/store/keys';
import * as storeConfig from '~/store/pagebuilder';
import Controls from './Controls';
import ExecutionFrame from './frames/ExecutionFrame';
import PageFrame from './frames/PageFrame';
import ResultFrame from './frames/ResultFrame';

const supportedViewStates = ['page', 'executing', 'result'];

export default {
    components: {
        Controls,
        ExecutionFrame,
        PageFrame,
        ResultFrame
    },
    initStore(actions, store) { // this method is to be called by the embedding app
        consola.debug('PageBuilder initStore');
        
        // validate store API
        let actualKeys = JSON.stringify(Object.keys(actions).sort());
        let expectedKeys = JSON.stringify([...validKeys].sort());
        consola.debug(actualKeys, expectedKeys);
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
        viewState() {
            let viewState = this.$store.state.pagebuilder.viewState;
            if (viewState && !supportedViewStates.includes(viewState)) {
                consola.error(`PageBuilder used with unsupported viewState: ${viewState}`);
            }
            return viewState;
        },
        showPageBuilder() {
            return supportedViewStates.includes(this.viewState);
        }
    }
};
</script>

<template>
  <div v-if="showPageBuilder">
    <PageFrame v-if="viewState === 'page'" />
    <ExecutionFrame v-else-if="viewState === 'executing'" />
    <ResultFrame v-else-if="viewState === 'result'" />

    <Controls />
  </div>
</template>
