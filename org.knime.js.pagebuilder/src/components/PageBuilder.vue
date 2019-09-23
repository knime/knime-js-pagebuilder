<script>
import validKeys from '~/store/keys';
import * as storeConfig from '~/store/pagebuilder';
import Controls from './Controls';
import Progress from '~/src/components/Progress';
import Page from '~/src/components/Page';
import Result from '~/src/components/Result';

const supportedViewStates = ['page', 'executing', 'result'];

export default {
    components: {
        Controls,
        Progress,
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
    <Page v-if="viewState === 'page'" />
    <Progress v-else-if="viewState === 'executing'" />
    <Result v-else-if="viewState === 'result'" />

    <Controls />
  </div>
</template>
