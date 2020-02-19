<script>
import Layout from './Layout';

export default {
    name: 'Page',
    components: {
        Layout
    },
    computed: {
        pageContent() {
            return this.$store.state.pagebuilder.page && this.$store.state.pagebuilder.page.wizardPageContent;
        },
        layout() {
            return this.pageContent && this.pageContent.webNodePageConfiguration &&
                this.pageContent.webNodePageConfiguration.layout;
        }
    }
};
</script>

<template>
  <Layout
    v-if="pageContent"
    :layout="layout"
  />
</template>
