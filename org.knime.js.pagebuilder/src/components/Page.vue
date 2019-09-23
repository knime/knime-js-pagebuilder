<script>
import Layout from './layout/Layout';

export default {
    name: 'Page',
    components: {
        Layout
    },
    computed: {
        page() {
            return this.$store.state.pagebuilder.page;
        },
        layout() {
            return this.page && this.page.webNodePageConfiguration.layout;
        }
    }
};
</script>

<template>
  <Layout
    v-if="page"
    :layout="layout"
  />
</template>
