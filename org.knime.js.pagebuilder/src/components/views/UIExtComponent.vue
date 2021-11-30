<script>
import { KnimeService } from 'knime-ui-extension-service';

export default {
    components: {
        // UIExtension
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
            return this.extensionConfig?.resourceInfo;
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
    async mounted() {
        // check if component library needs to be loaded or if it was already loaded before
        if (!window[this.componentId]) {
            await this.loadComponentLibrary();
        }
        // register the component locally
        this.$options.components[this.componentId] = window[this.componentId];
        this.componentLoaded = true;
    },
    methods: {
        async loadComponentLibrary() {
            // Load and mount component library
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.async = true;
                script.addEventListener('load', () => {
                    resolve(script);
                });
                script.addEventListener('error', () => {
                    reject(new Error(`Script loading of "${this.resourceLocation}" failed`));
                    document.head.removeChild(script);
                });
                script.src = this.resourceLocation;
                document.head.appendChild(script);
            });

            // Lib build defines component on `window` using the name defined during build.
            // This name should match the componentId (this.extensionConfig.resourceInfo.id).
            let Component = window[this.componentId];
            if (!Component) {
                throw new Error(`Component loading failed. Script invalid.`);
            }
        }
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
