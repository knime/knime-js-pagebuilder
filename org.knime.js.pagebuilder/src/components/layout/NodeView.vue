<script>
import { mapGetters } from 'vuex';

import WebNode from '~/src/components/views/WebNode';
import UIExtension from '~/src/components/views/UIExtension';
import NotDisplayable from '~/src/components/views/NotDisplayable';
import ExecutingOverlay from '~/src/components/ui/ExecutingOverlay';

/**
 * A node-level member of the layout tree, this component is responsible for shared functionality
 * associated with being an instance of a KNIME visualization. This includes:
 *
 *  - retrieving the view configuration from the global store
 *  - displaying defaults when a configuration/node is missing/non-displayable
 *  - displaying styles/animations during (re)execution
 *  - determining which child component to use based on the configuration
 *
 */
export default {
    components: {
        WebNode,
        UIExtension,
        NotDisplayable,
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
    computed: {
        ...mapGetters({
            nodesReExecuting: 'pagebuilder/nodesReExecuting',
            updateCount: 'pagebuilder/reExecutionUpdates'
        }),
        pageIdPrefix() {
            return this.$store.state.pagebuilder.page?.wizardPageContent?.webNodePageConfiguration
                ?.projectRelativePageIDSuffix;
        },
        nodeId() {
            return this.pageIdPrefix ? `${this.pageIdPrefix}:${this.viewConfig.nodeID}` : this.viewConfig.nodeID;
        },
        webNodeConfig() {
            return this.$store.state.pagebuilder.page.wizardPageContent?.webNodes?.[this.nodeId];
        },
        uiExtensionConfig() {
            return this.$store.state.pagebuilder.page.wizardPageContent?.nodeViews?.[this.nodeId];
        },
        isWebNodeView() {
            return Boolean(this.webNodeConfig);
        },
        isUIExtension() {
            return Boolean(this.uiExtensionConfig);
        },
        viewAvailable() {
            // if the user removes a node that has already been part of a layout, then KNIME Analytics Platform does not
            // update the layout configuration, so we get a phantom item
            return this.isWebNodeView || this.isUIExtension;
        },
        viewDisplayable() {
            // TODO: UIEXT-110 Handle displayability of UIExtensions
            if (this.isUIExtension) {
                return true;
            }
            // a node can be available but not displayable
            // in that case we simply display a corresponding message to show that the node is not displayable
            return this.webNodeConfig?.nodeInfo?.displayPossible;
        },
        showExecutionOverlay() {
            /* we do not update the webNode during "proper" re-execution, but if refresh/reload happens during this
               time, detect execution before polling starts to prevent jumping */
            let isReExecuting = this.nodesReExecuting?.includes(this.nodeId);
            if (this.isWebNodeView && !isReExecuting) {
                // only the original "webNodes" have node state
                isReExecuting = this.webNodeConfig?.nodeInfo?.nodeState === 'executing';
            }
            return isReExecuting;
        },
        showSpinner() {
            return this.updateCount >= 2;
        }
    }
};
</script>

<template>
  <div class="node-view">
    <template v-if="viewAvailable">
      <NotDisplayable
        v-if="!viewDisplayable"
        :node-info="webNodeConfig.nodeInfo"
        :node-id="nodeId"
        :show-error="!showExecutionOverlay"
      />
      <WebNode
        v-else-if="isWebNodeView"
        :view-config="viewConfig"
        :node-config="webNodeConfig"
        :node-id="nodeId"
      />
      <UIExtension
        v-else-if="isUIExtension"
        :extension-config="uiExtensionConfig"
        :node-id="nodeId"
      />
      <ExecutingOverlay
        :show="showExecutionOverlay"
        :show-spinner="showSpinner"
      />
    </template>
  </div>
</template>

<style lang="postcss" scoped>
.node-view {
  background-color: var(--knime-white);
}
</style>
