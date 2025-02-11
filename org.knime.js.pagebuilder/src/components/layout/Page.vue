<script>
import { mapState } from "vuex";

import DialogLayout from "./DialogLayout.vue";
import Layout from "./Layout.vue";

export default {
  name: "Page",
  components: {
    Layout,
    DialogLayout,
  },
  computed: {
    ...mapState("pagebuilder", ["isDialogLayout"]),
    pageContent() {
      return this.$store.state.pagebuilder.page?.wizardPageContent;
    },
    layout() {
      return this.pageContent?.webNodePageConfiguration?.layout;
    },
  },
};
</script>

<template>
  <div>
    <template v-if="pageContent">
      <DialogLayout v-if="isDialogLayout" :layout="layout" />
      <Layout v-else :layout="layout" />
    </template>
  </div>
</template>
