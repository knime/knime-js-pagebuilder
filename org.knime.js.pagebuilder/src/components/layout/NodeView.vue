<script>
import NodeViewIFrame from './NodeViewIFrame';
import Widget from '../widgets/Widget';
import NotAvailable from './NotAvailable';
import { configToComponentMap } from '../widgets/widgets.config';

/**
 * Wrapper for a single node view iframe or widget
 */
export default {
    components: {
        NodeViewIFrame,
        Widget,
        NotAvailable
    },
    props: {
        /**
         * View configuration as received from the REST API
         */
        viewConfig: {
            default: () => ({}),
            type: Object,
            validate(viewConfig) {
                if (typeof viewConfig !== 'object') {
                    return false;
                }
                if (!viewConfig.hasOwnProperty('nodeID')) {
                    return false;
                }
                return true;
            }
        }
    },
    computed: {
        webNodeConfig() {
            let nodeConfigs = this.$store.state.pagebuilder.page.wizardPageContent.webNodes;
            let { nodeID } = this.viewConfig;
            return nodeConfigs[nodeID];
        },
        webNodeAvailable() {
            // if the user removes a node that has already been part of a layout, then KNIME Analytics Platform does not
            // update the layout configuration, so we get a phantom item
            return typeof this.webNodeConfig !== 'undefined';
        },
        webNodeDisplayable() {
            // a node can be available but not displayable
            // in that case we simply display a corresponding message to show that the node is not displayable
            return this.webNodeConfig.nodeInfo.displayPossible;
        },
        resizeMethod() {
            return this.viewConfig.resizeMethod || '';
        },
        classes() {
            let classes = ['view'];
            if (this.webNodeAvailable) {
                // add aspect ratio sizing classes; other resize methods are handled by NodeViewIFrame itself
                if (this.resizeMethod.startsWith('aspectRatio')) {
                    classes.push(this.resizeMethod);
                }
                if (Array.isArray(this.viewConfig.additionalClasses)) {
                    classes = classes.concat(this.viewConfig.additionalClasses);
                }
            }
            return classes;
        },
        style() {
            let style = [];
            if (this.webNodeAvailable && this.viewConfig.additionalStyles) {
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
        // returns the Vue Widget Component name for the node it is a widget
        componentMapping() {
            // check the representation class or the node name (for widgets which share code with the old quickforms)
            return configToComponentMap[this.webNodeConfig.viewRepresentation['@class']] ||
                configToComponentMap[this.webNodeConfig.nodeInfo.nodeName];
        },
        isWidget() {
            return this.legacyModeDisabled && this.webNodeConfig && this.webNodeConfig.viewRepresentation &&
                this.componentMapping;
        }
    }
};
</script>

<template>
  <div
    :class="classes"
    :style="style"
  >
    <template v-if="webNodeAvailable">
      <NotAvailable
        v-if="!webNodeDisplayable"
        :node-info="webNodeConfig.nodeInfo"
        :node-id="viewConfig.nodeID"
      />
      <Widget
        v-else-if="isWidget"
        :type="componentMapping"
        :node-config="webNodeConfig"
        :node-id="viewConfig.nodeID"
      />
      <NodeViewIFrame
        v-else
        :view-config="viewConfig"
        :node-config="webNodeConfig"
      />
    </template>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.view {
  background-color: var(--theme-color-white);

  &.aspectRatio16by9,
  &.aspectRatio4by3,
  &.aspectRatio1by1 {
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

  &.aspectRatio16by9 {
    padding-bottom: calc(100% / (16 / 9));
  }

  &.aspectRatio4by3 {
    padding-bottom: calc(100% / (4 / 3));
  }

  &.aspectRatio1by1 {
    padding-bottom: 100%;
  }
}
</style>
