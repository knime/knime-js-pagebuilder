<script>
import { mapGetters } from 'vuex';

import NodeViewIFrame from './NodeViewIFrame';
import Widget from '../widgets/Widget';
import NotAvailable from './NotAvailable';
import ExecutingOverlay from './ExecutingOverlay';
import { classToComponentMap, legacyExclusions } from '../widgets/widgets.config';

/**
 * Wrapper for a single node view iframe or widget
 */
export default {
    components: {
        NodeViewIFrame,
        Widget,
        NotAvailable,
        ExecutingOverlay
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
    data() {
        return {
            nodeViewIFrameKey: 0
        };
    },
    computed: {
        ...mapGetters({
            nodesReExecuting: 'pagebuilder/nodesReExecuting',
            updateCount: 'pagebuilder/reExecutionUpdates'
        }),
        nodeId() {
            return this.viewConfig.nodeID;
        },
        webNodeConfig() {
            return this.$store.state.pagebuilder.page.wizardPageContent.webNodes[this.nodeId];
        },
        webNodeAvailable() {
            // if the user removes a node that has already been part of a layout, then KNIME Analytics Platform does not
            // update the layout configuration, so we get a phantom item
            return typeof this.webNodeConfig !== 'undefined';
        },
        webNodeDisplayable() {
            // a node can be available but not displayable
            // in that case we simply display a corresponding message to show that the node is not displayable
            return this.webNodeConfig?.nodeInfo?.displayPossible;
        },
        nodeState() {
            return this.webNodeConfig?.nodeInfo?.nodeState;
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
        // checks the node configuration for a matching Vue Widget Component name and provides that name
        widgetComponentName() {
            // check the node representation class for a matching Vue Component name
            return { ...classToComponentMap, ...legacyExclusions }[this.webNodeConfig?.viewRepresentation?.['@class']];
        },
        isWidget() {
            return legacyExclusions[this.webNodeConfig?.viewRepresentation?.['@class']]  ||
                (this.legacyModeDisabled && this.widgetComponentName);
        },
        showExecutionOverlay() {
            /* we do not update the webNode during "proper" re-execution, but if refresh/reload happens during this
               time, detect execution before polling starts to prevent jumping */
            return this.nodesReExecuting?.includes(this.nodeId) || this.nodeState === 'executing';
        },
        showSpinner() {
            return this.updateCount >= 2;
        }
    },
    watch: {
        webNodeConfig() {
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
    <template v-if="webNodeAvailable">
      <NotAvailable
        v-if="!webNodeDisplayable"
        :node-info="webNodeConfig.nodeInfo"
        :node-id="nodeId"
        :show-error="!showExecutionOverlay"
      />
      <Widget
        v-else-if="isWidget"
        :type="widgetComponentName"
        :node-config="webNodeConfig"
        :node-id="nodeId"
      />
      <NodeViewIFrame
        v-else
        :key="nodeViewIFrameKey"
        :view-config="viewConfig"
        :node-config="webNodeConfig"
      />
      <ExecutingOverlay
        :show="showExecutionOverlay"
        :show-spinner="showSpinner"
      />
    </template>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.view {
  background-color: var(--knime-white);

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
