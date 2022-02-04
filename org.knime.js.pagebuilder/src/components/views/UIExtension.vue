<script>
import { KnimeService, IFrameKnimeServiceAdapter } from 'knime-ui-extension-service';
import UIExtComponent from '~/src/components/views/UIExtComponent';
import UIExtIFrame from '~/src/components/views/UIExtIFrame';

import muteReactivity from '~/src/util/muteReactivity';

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
    // using provide/inject instead of a prop to pass the knimeService to the children because
    // 1) we don't want reactivity in this case
    // 2) any deeply nested child of the UIComponent can get access to knimeService if needed
    provide() {
        const ServiceConstructor = this.isUIExtComponent ? KnimeService : IFrameKnimeServiceAdapter;
        let knimeService = new ServiceConstructor(this.extensionConfig, this.callService, this.pushNotification);
        muteReactivity({ target: knimeService, nonReactiveKeys: ['iFrameWindow'] });
        this.knimeService = knimeService;
        return { knimeService };
    },
    props: {
        extensionConfig: {
            default: () => ({}),
            type: Object,
            validate(extensionConfig) {
                if (typeof extensionConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['nodeId', 'workflowId', 'projectId', 'resourceInfo'];
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
        },
        resourceLocation() {
            return this.$store.getters['api/uiExtResourceLocation']({
                resourceInfo: this.extensionConfig?.resourceInfo
            });
        }
    },
    watch: {
        extensionConfig() {
            this.configKey += 1; // needed to force a complete re-rendering of UIExtIFrame
        }
    },
    created() {
        this.$store.dispatch('pagebuilder/service/registerService', { service: this.knimeService });
    },
    beforeDestroy() {
        this.$store.dispatch('pagebuilder/service/deregisterService', { service: this.knimeService });
    },
    methods: {
        callService(nodeService, serviceRequest, requestParams) {
            return this.$store.dispatch('api/callService', {
                extensionConfig: this.extensionConfig,
                nodeService,
                serviceRequest,
                requestParams
            });
        },
        pushNotification(notification) {
            return this.$store.dispatch('pagebuilder/service/pushNotification', notification);
        }
    }
};
</script>

<template>
  <div>
    <UIExtComponent
      v-if="isUIExtComponent"
      :resource-location="resourceLocation"
    />
    <UIExtIFrame
      v-else
      :key="configKey"
      :resource-location="resourceLocation"
    />
  </div>
</template>
