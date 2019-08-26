<script>
import * as storeConfig from '~/store/pagebuilder';
import validKeys from '~/store/keys';
import DemoFrame from './DemoFrame';

export default {
    name: 'PageBuilder2',
    components: {
        DemoFrame
    },
    props: {
        actions: {
            required: true,
            validator(value = {}) {
                let actualKeys = JSON.stringify(Object.keys(value).sort());
                let expectedKeys = JSON.stringify([...validKeys].sort());
                consola.debug(`Validating actions ${actualKeys} (expecting ${expectedKeys})`);
                return actualKeys === expectedKeys;
            }
        }
    },
    created() {
        this.$store.registerModule('pagebuilder', storeConfig);
        this.$store.registerModule(['pagebuilder', 'outbound'], {
            namespaced: true,
            actions: this.actions
        });
    }
};
</script>

<template>
  <DemoFrame />
</template>
