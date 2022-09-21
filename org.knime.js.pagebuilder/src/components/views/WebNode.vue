<script>
// import WebNodeIFrame from './WebNodeIFrame.vue';
import Widget from '../widgets/Widget.vue';
import { classToComponentMap, legacyExclusions } from '../widgets/widgets.config';

/**
 * Wrapper for a WebNode based visualization implementation or a Widget. Determines the type of component to render,
 * legacy mode considerations and applies styles provided by the visual layout editor (such as resize method and
 * additional styles). Also detects changes to it's configuration and increments a local counter to help with re-
 * renders of iframe-based components.
 */
export default {
    components: {
        // WebNodeIFrame,
        Widget
    },
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
        resizeMethod() {
            return this.viewConfig.resizeMethod || '';
        },
        classes() {
            let classes = [];
            // add aspect ratio sizing classes; other resize methods are handled by WebNodeIFrame itself
            if (this.resizeMethod.startsWith('aspectRatio')) {
                classes.push(this.resizeMethod);
            }
            if (Array.isArray(this.viewConfig.additionalClasses)) {
                classes = classes.concat(this.viewConfig.additionalClasses);
            }
            return classes;
        },
        style() {
            let style = [];
            if (this.viewConfig.additionalStyles) {
                style = style.concat(this.viewConfig.additionalStyles);
            }
            if (this.resizeMethod.startsWith('viewLowestElement') && this.isWidget) {
                let { maxHeight = null, maxWidth = null, minHeight = null, minWidth = null } = this.viewConfig;
                if (maxHeight !== null) {
                    style.push(`max-height:${maxHeight}px`);
                }
                if (maxWidth !== null) {
                    style.push(`max-width:${maxHeight}px`);
                }
                if (minHeight !== null) {
                    style.push(`min-height:${maxHeight}px`);
                }
                if (minWidth !== null) {
                    style.push(`min-width:${maxHeight}px`);
                }
            }
            return style.join(';').replace(/;;/g, ';');
        },
        legacyModeDisabled() {
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
    :class="classes"
    :style="style"
  >
    <Widget
      v-if="isWidget"
      :widget-name="widgetComponentName"
      :node-config="nodeConfig"
      :node-id="nodeId"
    />
    <div v-else>
      <div>this is a WebNodeIFrame or a linked widget which was not found (e.g. unresolved quickform references)</div>
    </div>
    <!-- <WebNodeIFrame
      v-else
      :key="nodeViewIFrameKey"
      v-bind="$props"
    /> -->
  </div>
</template>

<style lang="postcss" scoped>
.aspectRatio16by9,
.aspectRatio4by3,
.aspectRatio1by1 {
  position: relative;
  width: 100%;
  height: 0;

  & > :first-child {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}

.aspectRatio16by9 {
  padding-bottom: calc(100% / (16 / 9));
}

.aspectRatio4by3 {
  padding-bottom: calc(100% / (4 / 3));
}

.aspectRatio1by1 {
  padding-bottom: 100%;
}
</style>
