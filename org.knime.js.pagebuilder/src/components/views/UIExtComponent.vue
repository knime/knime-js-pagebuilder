<script>
import { mapState } from "vuex";
import { loadAsyncComponent } from "webapps-common/ui/util/loadComponentLibrary";

export default {
  components: {
    // Any Vue-based component library
  },
  inject: ["getKnimeService"],
  props: {
    resourceLocation: {
      default: null,
      type: String,
      required: true,
    },
    nodeId: {
      default: null,
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState("pagebuilder", ["isReporting"]),
    knimeService() {
      return this.getKnimeService();
    },
    extensionConfig() {
      return this.knimeService?.extensionConfig;
    },
    resourceInfo() {
      return this.extensionConfig?.resourceInfo;
    },
    /**
     * A unique identifier based on the factory class of a node. Will be shared with other node instances of the
     * same type across an installation, but is guaranteed to be unique against other node-types (regardless of
     * naming conflicts; i.e. two scatter plots with the node name "Scatter Plot").
     *
     * @returns {string} - unique id for the resource registered to this node.
     */
    componentId() {
      return this.resourceInfo?.id;
    },
  },
  created() {
    this.$options.components[this.componentId] = loadAsyncComponent({
      resourceLocation: this.resourceLocation,
      componentName: this.componentId,
    });
  },
};
</script>

<template>
  <component :is="componentId" class="ui-ext-component" />
</template>

<style scoped>
.ui-ext-component {
  overflow: hidden;
}
</style>
