<script>
import CompositeLayout from './Layout';
import DialogLayout from './DialogLayout';
import { mapGetters } from 'vuex';

export default {
    name: 'Page',
    components: {
        CompositeLayout,
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
        ...mapGetters({
            isNodeDialog: 'pagebuilder/isNodeDialog'
        })
    }
};
</script>

<template>
  <CompositeLayout
    v-if="pageContent && !isNodeDialog"
    :layout="layout"
  />
  <DialogLayout
    v-else-if="pageContent && isNodeDialog"
    :layout="layout"
  />
</template>
