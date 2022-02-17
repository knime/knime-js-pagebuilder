<script>
import { mapState } from 'vuex';
import Layout from './Layout';
import DialogLayout from './DialogLayout';

export default {
    name: 'Page',
    components: {
        Layout,
        DialogLayout
    },
    computed: {
        ...mapState('pagebuilder', ['isNodeDialog']),
        pageContent() {
            return this.$store.state.pagebuilder.page?.wizardPageContent;
        },
        layout() {
            return this.pageContent?.webNodePageConfiguration?.layout;
        }
    }
};
</script>

<template>
  <div>
    <template v-if="pageContent">
      <DialogLayout
        v-if="isNodeDialog"
        :layout="layout"
      />
      <Layout
        v-else
        :layout="layout"
      />
    </template>
  </div>
</template>
