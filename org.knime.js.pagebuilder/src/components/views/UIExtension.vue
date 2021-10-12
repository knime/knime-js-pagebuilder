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
        nodeInfo: {
            default: () => ({}),
            type: Object
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
            nodeInfoKey: 0
        };
    },
    watch: {
        nodeInfo() {
            this.nodeInfoKey += 1;
        }
    }
};
</script>

<template>
  <div>
    <UIExtComponent
      v-if="nodeInfo.uicomponent"
      :ext-info="nodeInfo"
    />
    <UIExtIFrame
      v-else
      :key="nodeInfoKey"
      :node-id="nodeId"
      :iframe-src="nodeInfo.url"
      :project-id="nodeInfo.projectId"
      :workflow-id="nodeInfo.workflowId"
      :init-data="nodeInfo.initData"
    />
  </div>
</template>
