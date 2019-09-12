<script>
import Layout from '../layout/Layout';

export default {
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
    class="container-fluid"
    :layout="layout"
  />
</template>
