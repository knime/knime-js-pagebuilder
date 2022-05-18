<script>
import { mapState } from 'vuex';
import * as pagebuilderStoreConfig from '~/store/pagebuilder';
import * as interactivityStoreConfig from '~/store/interactivity';
import * as alertStoreConfig from '~/store/alert';
import * as serviceStoreConfig from '~/store/service';
import Page from '~/src/components/layout/Page';
import AlertGlobal from '~/src/components/ui/AlertGlobal';

export default {
    components: {
        Page,
        AlertGlobal
    },
    provide() {
        return { platform: this.platform };
    },
    props: {
        platform: {
            type: String,
            default: 'Webportal'
        }
    },
    initStore(store) { // this method is to be called by the embedding app, cf. README
        store.registerModule('pagebuilder', pagebuilderStoreConfig);
        store.registerModule('pagebuilder/interactivity', interactivityStoreConfig);
        store.registerModule('pagebuilder/alert', alertStoreConfig);
        store.registerModule('pagebuilder/service', serviceStoreConfig);
    },
    computed: {
        ...mapState('pagebuilder', ['isDialogLayout']),
        hasPage() {
            let page = this.$store.state.pagebuilder.page;
            return Boolean(page?.wizardPageContent);
        }
    }
};
</script>

<template>
  <div>
    <Page v-if="hasPage" />
    <AlertGlobal v-if="!isDialogLayout" />
  </div>
</template>
