<script>
import { defineComponent } from "vue";
import { mapState } from "vuex";

import ExecutingOverlay from "../ui/ExecutingOverlay.vue";
import NotDisplayable from "../views/NotDisplayable.vue";
import UIExtensionAdapter from "../views/UIExtensionAdapter.vue";
import ViewExecutable from "../views/ViewExecutable.vue";
import WebNode from "../views/WebNode.vue";

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
export default defineComponent({
  components: {
    WebNode,
    NotDisplayable,
    ViewExecutable,
    ExecutingOverlay,
    UIExtensionAdapter,
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
        return viewConfig.hasOwnProperty("nodeID");
      },
    },
  },
  emits: ["publishData", "registerPushEventService"],
  computed: {
    ...mapState("pagebuilder", [
      "page",
      "isDialogLayout",
      "isReporting",
      "nodesReExecuting",
      "reExecutionUpdates",
    ]),
    ...mapState("pagebuilder/dialog", ["dirtyModelSettings"]),
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
        this.isUIExtension &&
        this.uiExtensionConfig?.renderingConfig?.type === "IMAGE"
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
});
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
      <UIExtensionAdapter
        v-else-if="isUIExtension"
        :view-config="viewConfig"
        :class="{
          'single-view': isSingleView,
          'view-and-dialog':
            !isNodeDialog && !isSingleView && !isInComponentView,
        }"
        :is-node-dialog="isNodeDialog"
        :extension-config="uiExtensionConfig"
        :node-id="nodeId"
        @publish-data="$emit('publishData', $event)"
        @register-push-event-service="$emit('registerPushEventService', $event)"
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
  @media screen {
    /* height 100% does not mix well with flex-box on print 
     (https://issues.chromium.org/issues/365922171) */
    height: 100%;
  }

  background-color: var(--knime-white);
}

.single-view {
  height: 100vh;
}

.view-and-dialog {
  height: 100%;
}
</style>
