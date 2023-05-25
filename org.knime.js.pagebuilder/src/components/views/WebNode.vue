<script>
import WebNodeIFrame from './WebNodeIFrame.vue';
import Widget from '../widgets/Widget.vue';
import { classToComponentMap, legacyExclusions } from '../widgets/widgets.config';
import layoutMixin from '../mixins/layoutMixin';

/**
 * Wrapper for a WebNode based visualization implementation or a Widget. Determines the type of component to render,
 * legacy mode considerations and applies styles provided by the visual layout editor (such as resize method and
 * additional styles). Also detects changes to it's configuration and increments a local counter to help with re-
 * renders of iframe-based components.
 */

export default {
    components: {
        WebNodeIFrame,
        Widget
    },
    mixins: [layoutMixin],
    props: {
        /**
         * View configuration, mainly layout and sizing options
         */
        viewConfig: {
            default: () => ({}),
            type: Object
        },
        /**
         * Node configuration as received by API
         */
        nodeConfig: {
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
            nodeViewIFrameKey: 0
        };
    },
    computed: {
        nodeState() {
            return this.nodeConfig?.nodeInfo?.nodeState;
        },
        legacyModeDisabled() {
            // TODO HUB-3311 remove legacy mode
            // only return true if legacy flag *explicitly* set to false; default workflows with unset legacy flag to
            // use legacy mode
            return this.viewConfig.useLegacyMode === false;
        },
        // checks the node configuration for a matching Vue Widget Component name and provides that name
        widgetComponentName() {
            // check the node representation class for a matching Vue Component name
            return { ...classToComponentMap, ...legacyExclusions }[this.nodeConfig?.viewRepresentation?.['@class']];
        },
        isWidget() {
            return Boolean(legacyExclusions[this.nodeConfig?.viewRepresentation?.['@class']] ||
                (this.legacyModeDisabled && this.widgetComponentName));
        }
    },
    watch: {
        nodeConfig() {
            this.nodeViewIFrameKey += 1;
        }
    }
};
</script>

<template>
  <div
    :class="layoutClasses"
    :style="layoutStyle"
  >
    <Widget
      v-if="isWidget"
      :widget-name="widgetComponentName"
      :node-config="nodeConfig"
      :node-id="nodeId"
    />
    <WebNodeIFrame
      v-else
      :key="nodeViewIFrameKey"
      v-bind="$props"
    />
  </div>
</template>

<style lang="postcss" scoped>
@import url('../mixins/layoutMixin.css');
</style>
