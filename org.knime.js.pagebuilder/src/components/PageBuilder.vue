<script>
import { mapState } from "vuex";

import * as alertStoreConfig from "../store/alert";
import * as dialogStoreConfig from "../store/dialog";
import * as interactivityStoreConfig from "../store/interactivity";
import * as pagebuilderStoreConfig from "../store/pagebuilder";
import * as serviceStoreConfig from "../store/service";

import Page from "./layout/Page.vue";
import AlertGlobal from "./ui/AlertGlobal.vue";
import "../assets/css/global-z-indices.css";

export default {
  components: {
    Page,
    AlertGlobal,
  },
  initStore(store) {
    // this method is to be called by the embedding app, cf. README
    store.registerModule("pagebuilder", pagebuilderStoreConfig);
    store.registerModule("pagebuilder/interactivity", interactivityStoreConfig);
    store.registerModule("pagebuilder/alert", alertStoreConfig);
    store.registerModule("pagebuilder/service", serviceStoreConfig);
    store.registerModule("pagebuilder/dialog", dialogStoreConfig);
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout", "isReporting"]),
    hasPage() {
      let page = this.$store.state.pagebuilder.page;
      return Boolean(page?.wizardPageContent);
    },
  },
};
</script>

<template>
  <div>
    <Page v-if="hasPage" />
    <AlertGlobal v-if="!isDialogLayout && !isReporting" />
  </div>
</template>
