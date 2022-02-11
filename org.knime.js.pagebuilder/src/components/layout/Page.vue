<script>
import Layout from './Layout';
import DialogLayout from './DialogLayout';

export default {
    name: 'Page',
    components: {
        Layout,
        DialogLayout
    },
    computed: {
        pageContent() {
            return this.$store.state.pagebuilder.page && this.$store.state.pagebuilder.page.wizardPageContent;
        },
        layout() {
            return this.pageContent && this.pageContent.webNodePageConfiguration &&
                this.pageContent.webNodePageConfiguration.layout;
        },
        isNodeDialog() {
            return this.$store.state.pagebuilder.isNodeDialog;
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
