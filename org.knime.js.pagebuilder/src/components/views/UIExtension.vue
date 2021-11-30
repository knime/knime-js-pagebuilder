<script>
import { KnimeService, IFrameKnimeServiceAdapter } from 'knime-ui-extension-service';
import UIExtComponent from '~/src/components/views/UIExtComponent';
import UIExtIFrame from '~/src/components/views/UIExtIFrame';

/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-
 * based). Also detects changes to it's configuration and increments a local counter to help with re-renders of
 * iframe-based components.
 */
export default {
    components: {
        UIExtComponent,
        UIExtIFrame
    },
    props: {
        extensionConfig: {
            default: () => ({}),
            type: Object,
            validate(extensionConfig) {
                if (typeof extensionConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['nodeId', 'workflowId', 'projectId', 'info'];
                return requiredProperties.every(key => extensionConfig.hasOwnProperty(key));
            }
        }
    },
    data() {
        return {
            configKey: 0,
            knimeService: null
        };
    },
    computed: {
        isUIExtComponent() {
            return this.extensionConfig?.resourceInfo?.type === 'VUE_COMPONENT_LIB';
        }
    },
    watch: {
        extensionConfig() {
            this.configKey += 1;
        }
    },
    mounted() {
        const ServiceConstructor = this.isUIExtComponent ? KnimeService : IFrameKnimeServiceAdapter;
        this.knimeService = new ServiceConstructor(this.extensionConfig, this.callService);
        this.$store.dispatch('service/registerService', { service: this.knimeService });
    },
    methods: {
        callService(request) {
            return this.$store.dispatch('api/callService', { request });
        }
    }
};
</script>

<template>
  <div>
    <UIExtComponent
      v-if="isUIExtComponent"
      :knime-service="knimeService"
    />
    <UIExtIFrame
      v-else
      :key="configKey"
      :knime-service="knimeService"
    />
  </div>
</template>
