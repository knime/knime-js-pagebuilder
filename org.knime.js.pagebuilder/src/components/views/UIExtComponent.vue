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
        },
        resourceLocation: {
            default: null,
            type: String,
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
        /**
         * A unique identifier based on the factory class of a node. Will be shared with other node instances of the
         * same type across an installation, but is guaranteed to be unique against other node-types (regardless of
         * naming conflicts; i.e. two scatter plots with the node name "Scatter Plot").
         *
         * @returns {string} - unique id for the resource registered to this node.
         */
        componentId() {
            // TODO: NXT-856 remove dialog workaround when componentId is generalized by the framework
            let componentId = this.resourceInfo?.id;
            if (this.knimeService?.extensionConfig?.extensionType === 'dialog' &&
            this.resourceInfo?.type === 'VUE_COMPONENT_LIB') {
                componentId = 'NodeDialog';
            }
            return componentId;
        }
    },
    async created() {
        // check if component library needs to be loaded or if it was already loaded before
        if (!window[this.componentId]) {
            await loadComponentLibrary(window, this.resourceLocation, this.componentId);
        }
        // register the component locally
        this.$options.components[this.componentId] = window[this.componentId];
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
