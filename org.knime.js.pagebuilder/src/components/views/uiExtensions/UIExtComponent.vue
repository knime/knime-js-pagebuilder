<script lang="ts">
import {
  type UIExtensionServiceAPILayer,
  type UIExtensionPushEvents,
  type UIExtensionService,
  setUpEmbedderService,
} from "@knime/ui-extension-service";
import { markRaw, type PropType } from "vue";
import { loadAsyncComponent } from "webapps-common/ui/util/loadComponentLibrary";

export default {
  components: {
    // Any Vue-based component library
  },
  // using provide/inject instead of a prop to pass the knimeService to the children because
  // 1) we don't want reactivity in this case
  // 2) any deeply nested child of the UIComponent can get access to knimeService if needed
  provide() {
    this.initKnimeService();
    const getKnimeService = () => this.knimeService;
    return { getKnimeService };
  },
  props: {
    resourceLocation: {
      type: String,
      required: true,
    },
    resourceInfo: {
      type: Object as PropType<{ id: string }>,
      required: true,
    },
    apiLayer: {
      type: Object as PropType<UIExtensionServiceAPILayer>,
      required: true,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serviceCreated: (_service: {
      dispatchPushEvent: (event: UIExtensionPushEvents.PushEvent<any>) => void;
    }) => true,
  },
  data() {
    return {
      knimeService: null as null | UIExtensionService,
    };
  },
  computed: {
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
    // @ts-ignore
    this.$options.components[this.componentId] = loadAsyncComponent({
      resourceLocation: this.resourceLocation,
      componentName: this.componentId,
    });
  },
  methods: {
    initKnimeService() {
      const embedderService = setUpEmbedderService(this.apiLayer);
      this.knimeService = markRaw(embedderService.service);
      this.$emit("serviceCreated", embedderService);
    },
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
