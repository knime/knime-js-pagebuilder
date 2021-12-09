<script>
import { loadComponentLibrary } from '~/src/util/loadComponentLibrary';
import { KnimeService } from 'knime-ui-extension-service';

export default {
    components: {
        // Any Vue-based component library
    },
    props: {
        knimeService: {
            default: null,
            type: KnimeService,
            required: true
        }
    },
    data() {
        return {
            componentLoaded: false
        };
    },
    computed: {
        resourceInfo() {
            return this.knimeService?.extensionConfig?.resourceInfo;
        },
        resourceLocation() {
            // TODO: NXT-732 handle relative paths for webportal
            return this.resourceInfo?.url;
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
        }
    },
    async created() {
        // TODO: NXT-856 remove dialog workaround when componentId is generalized by the framework
        let componentId = this.componentId;
        if (this.knimeService?.extensionConfig?.extensionType === 'dialog' &&
        this.resourceInfo?.type === 'VUE_COMPONENT_LIB') {
            componentId = 'NodeDialog';
        }
        // check if component library needs to be loaded or if it was already loaded before
        if (!window[componentId]) {
            await loadComponentLibrary(window, this.resourceLocation, componentId);
        }
        // register the component locally
        this.$options.components[componentId] = window[componentId];
        this.componentLoaded = true;
    }
};
</script>

<template>
  <component
    :is="componentId"
    v-if="componentLoaded"
    :knime-service="knimeService"
  />
</template>
