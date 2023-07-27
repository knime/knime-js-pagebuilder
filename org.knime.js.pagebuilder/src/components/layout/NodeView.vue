<script>
import { mapState, mapGetters } from "vuex";

import WebNode from "../views/WebNode.vue";
import UIExtension from "../views/UIExtension.vue";
import ViewExecutable from "../views/ViewExecutable.vue";
import NotDisplayable from "../views/NotDisplayable.vue";
import ExecutingOverlay from "../ui/ExecutingOverlay.vue";

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
    ViewExecutable,
    ExecutingOverlay,
  },
  props: {
    /**
     * View configuration as defined in the page.
     */
    viewConfig: {
      default: () => ({}),
      type: Object,
      validate(viewConfig) {
        if (typeof viewConfig !== "object") {
          return false;
        }
        if (!viewConfig.hasOwnProperty("nodeID")) {
          return false;
        }
        return true;
      },
    },
  },
  computed: {
    ...mapState("pagebuilder", ["page", "isDialogLayout", "isReporting"]),
    ...mapState("pagebuilder/dialog", ["dirtyModelSettings"]),
    ...mapGetters("pagebuilder", ["nodesReExecuting", "reExecutionUpdates"]),
    pageIdPrefix() {
      return this.page?.wizardPageContent?.webNodePageConfiguration
        ?.projectRelativePageIDSuffix;
    },
    nodeId() {
      return this.pageIdPrefix
        ? `${this.pageIdPrefix}:${this.viewConfig.nodeID}`
        : this.viewConfig.nodeID;
    },
    webNodeConfig() {
      return this.page.wizardPageContent?.webNodes?.[this.nodeId];
    },
    uiExtensionConfig() {
      return this.page.wizardPageContent?.nodeViews?.[this.nodeId];
    },
    nodeInfo() {
      return (this.webNodeConfig || this.uiExtensionConfig)?.nodeInfo;
    },
    isWebNodeView() {
      return Boolean(this.webNodeConfig);
    },
    isUIExtension() {
      return Boolean(this.uiExtensionConfig);
    },
    isNodeDialog() {
      if (!this.isUIExtension) {
        return false;
      }
      return (
        this.nodeId === "DIALOG" ||
        this.uiExtensionConfig.extensionType === "dialog"
      );
    },
    isSingleView() {
      return this.isUIExtension && this.nodeId === "SINGLE";
    },
    isInComponentView() {
      return (
        this.nodeId !== "SINGLE" &&
        this.nodeId !== "DIALOG" &&
        this.nodeId !== "VIEW"
      );
    },
    isExecuted() {
      return this.nodeInfo?.nodeState === "executed";
    },
    isImageGeneration() {
      return (
        this.isUIExtension && this.uiExtensionConfig?.generatedImageActionId
      );
    },
    viewAvailable() {
      // if the user removes a node that has already been part of a layout, then KNIME Analytics Platform does not
      // update the layout configuration, so we get a phantom item
      return this.isWebNodeView || this.isUIExtension;
    },
    viewDisplayable() {
      if (this.isUIExtension) {
        return (
          this.isExecuted ||
          this.isImageGeneration ||
          this.isDialogLayout ||
          this.isNodeDialog
        );
      }
      // a node can be available but not displayable
      // in that case we simply display a corresponding message to show that the node is not displayable
      return this.nodeInfo?.displayPossible;
    },
    showViewExecutable() {
      return (
        this.isUIExtension &&
        !this.isNodeDialog &&
        (!this.isExecuted || this.dirtyModelSettings) &&
        !this.isImageGeneration
      );
    },
    showExecutionOverlay() {
      /* we do not update the webNode during "proper" re-execution, but if refresh/reload happens during this
               time, detect execution before polling starts to prevent jumping */
      let isReExecuting = this.nodesReExecuting?.includes(this.nodeId);
      if (this.isWebNodeView && !isReExecuting) {
        // only the original "webNodes" have node state
        isReExecuting = this.nodeInfo?.nodeState === "executing";
      }
      return isReExecuting;
    },
    showSpinner() {
      return this.reExecutionUpdates >= 2;
    },
  },
};
</script>

<template>
  <div class="node-view">
    <template v-if="viewAvailable">
      <NotDisplayable
        v-if="!viewDisplayable"
        :node-info="nodeInfo"
        :node-id="nodeId"
        :show-error="!showExecutionOverlay"
      />
      <ViewExecutable
        v-else-if="showViewExecutable"
        :extension-config="uiExtensionConfig"
      />
      <WebNode
        v-else-if="isWebNodeView"
        :view-config="viewConfig"
        :node-config="webNodeConfig"
        :node-id="nodeId"
      />
      <UIExtension
        v-else-if="isUIExtension"
        :view-config="viewConfig"
        :class="{
          'single-view': isSingleView,
          'single-dialog': isNodeDialog && isSingleView,
          'view-and-dialog':
            !isNodeDialog && !isSingleView && !isInComponentView,
        }"
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
  height: 100%;
  background-color: var(--knime-white);
}

.single-view {
  height: 100vh;
}

/* TODO UIEXT-310 get rid of this once we removed the margin in the APWrapper component
    15px are coming from APWrapper.vue and 12px from the parent Row */
.single-dialog {
  margin-left: -27px;
  margin-right: -27px;
}

.view-and-dialog {
  height: 100%;
}
</style>
