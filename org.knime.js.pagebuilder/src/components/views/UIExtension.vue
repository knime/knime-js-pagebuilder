<script>
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
        },
        /**
         * The unique string node ID as it exists
         * in the store webNodes
         */
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        }
    },
    data() {
        return {
            configKey: 0
        };
    },
    computed: {
        isUIExtComponent() {
            return this.extensionConfig?.resourceInfo?.type === 'VUE_COMPONENT_LIB';
        },
        workflowRelativeConfig() {
            return {
                ...this.extensionConfig,
                nodeId: this.nodeId
            };
        }
    },
    watch: {
        extensionConfig() {
            this.configKey += 1;
        }
    }
};
</script>

<template>
  <div>
    <UIExtComponent
      v-if="isUIExtComponent"
      :extension-config="workflowRelativeConfig"
    />
    <UIExtIFrame
      v-else
      :key="configKey"
      :extension-config="workflowRelativeConfig"
    />
  </div>
</template>
