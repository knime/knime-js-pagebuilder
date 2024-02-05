<script lang="ts">
import { mapState } from "vuex";
import { toRaw, type PropType } from "vue";

import layoutMixin from "../mixins/layoutMixin";
import { type ExtensionConfig } from "./uiExtensions/types/ExtensionConfig";
import type { UIExtensionAPILayer } from "./uiExtensions/types/UIExtensionAPILayer";
import UIExtension from "./uiExtensions/UIExtension.vue";
import NotDisplayable from "./NotDisplayable.vue";
import type { Alert } from "@knime/ui-extension-service";

/* declare global {
  export interface Window {
    closeCEFWindow: (executeNode: boolean) => void;
  }
} */

/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-based).
 * Also detects changes to it's configuration and increments a local counter to help with re-renders of iframe-based
 * components.
 */
export default {
  components: {
    UIExtension,
    NotDisplayable,
  },
  mixins: [layoutMixin],
  props: {
    extensionConfig: {
      default: () => ({}),
      type: Object as PropType<
        ExtensionConfig & { resourceInfo: { baseUrl: string } }
      >,
      validate(extensionConfig: any) {
        if (typeof extensionConfig !== "object") {
          return false;
        }
        const requiredProperties = [
          "nodeId",
          "workflowId",
          "projectId",
          "resourceInfo",
        ];
        return requiredProperties.every((key) =>
          extensionConfig.hasOwnProperty(key),
        );
      },
    },
    /**
     * View configuration, mainly layout and sizing options
     */
    viewConfig: {
      default: () => ({}),
      type: Object,
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    publishData: (_data: any) => true,
    registerPushEventService: (
      _dispatchPushEvent: Parameters<
        UIExtensionAPILayer["registerPushEventService"]
      >[0]["dispatchPushEvent"],
    ) => true,
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  data() {
    return {
      /**
       * This is used within the {@link layoutMixin}
       */
      isWidget: false,
    };
  },
  computed: {
    ...mapState("pagebuilder", ["page", "isDialogLayout", "isReporting"]),
    ...mapState("pagebuilder/dialog", ["settingsOnClean"]),
    isUIExtComponent() {
      return this.extensionConfig?.resourceInfo?.type === "VUE_COMPONENT_LIB";
    },
    resourceLocation() {
      return this.$store.getters["api/uiExtResourceLocation"]({
        resourceInfo: this.extensionConfig?.resourceInfo,
      });
    },
    pageIdPrefix() {
      return this.page?.wizardPageContent?.webNodePageConfiguration
        ?.projectRelativePageIDSuffix;
    },
    nodeId() {
      return this.pageIdPrefix
        ? `${this.pageIdPrefix}:${this.viewConfig.nodeID}`
        : this.viewConfig.nodeID;
    },
    /**
     * This ID unique among node instances in a workflow but shared
     * between KnimeService instances instantiated by the same node instance (i.e. between sessions, refreshes, reloads,
     * etc.).
     *
     * @returns {String} the id derived from the provided service.
     */
    serviceId() {
      const { nodeId, projectId, workflowId, extensionType } =
        this.extensionConfig;
      return `${nodeId}.${projectId}.${workflowId}.${extensionType}`;
    },
    isReportingButDoesNotSupportReporting() {
      return (
        this.isReporting && this.extensionConfig.generatedImageActionId === null
      );
    },
    apiLayer(): UIExtensionAPILayer {
      return {
        getResourceLocation: (path) => {
          return this.$store.getters["api/uiExtResourceLocation"]({
            resourceInfo: {
              baseUrl: this.extensionConfig.resourceInfo.baseUrl,
              path,
            },
          });
        },
        callNodeDataService: (params) => {
          return this.$store.dispatch("api/callService", {
            nodeService: "NodeService.callNodeDataService",
            extensionConfig: {
              projectId: params.projectId,
              workflowId: params.workflowId,
              nodeId: params.nodeId,
              extensionType: params.extensionType,
            },
            serviceRequest: params.serviceType,
            requestParams: params.dataServiceRequest,
          });
        },
        updateDataPointSelection: (params) => {
          return this.$store.dispatch("api/callService", {
            nodeService: "NodeService.updateDataPointSelection",
            extensionConfig: {
              projectId: params.projectId,
              workflowId: params.workflowId,
              nodeId: params.nodeId,
            },
            serviceRequest: params.mode,
            requestParams: params.selection,
          });
        },
        publishData: (data) => {
          this.$emit("publishData", data);
        },
        setReportingContent: (reportingContent) => {
          return this.$store.dispatch("pagebuilder/setReportingContent", {
            nodeId: this.nodeId,
            reportingContent,
          });
        },
        imageGenerated: (generatedImage) => {
          const isReportingForIframeComponent =
            this.isReporting && !this.isUIExtComponent;

          const generatedImageActionId =
            this.extensionConfig?.generatedImageActionId;
          if (isReportingForIframeComponent) {
            const elementWidth = this.$el.offsetWidth;
            this.$store.dispatch("pagebuilder/setReportingContent", {
              nodeId: this.nodeId,
              reportingContent: `<img style="width:${elementWidth}px" src="${generatedImage}" />`,
            });
          } else if (generatedImageActionId) {
            window.EquoCommService.send(generatedImageActionId, generatedImage);
          }
        },
        registerPushEventService: ({ dispatchPushEvent }) => {
          const service = {
            onServiceEvent: dispatchPushEvent,
            serviceId: this.serviceId,
          };
          this.$store.dispatch("pagebuilder/service/registerService", {
            service,
          });
          this.$emit("registerPushEventService", dispatchPushEvent);
          return () =>
            this.$store.dispatch("pagebuilder/service/deregisterService", {
              service,
            });
        },
        /**
         * Dispatches an event to show the local alert details with the global alert via store action.
         *
         * @param {Object} alert - the alert to display.
         * @returns {Promise}
         */
        sendAlert: (alert: Alert, closeAlert?: () => void) => {
          return this.$store.dispatch("pagebuilder/alert/showAlert", {
            ...alert,
            /**
             * Callback function passed to the alert store to close the local alert when a global alert action is
             * triggered.
             */
            callback: (
              /**
               * optionally if the local alert should be cleared.
               */
              remove?: Boolean,
            ) => {
              if (remove) {
                closeAlert?.();
              }
            },
          });
        },
        close(isMetaKeyPressed: boolean) {
          window.closeCEFWindow(isMetaKeyPressed);
        },
      };
    },
    extensionConfigWithDialogSettings(): ExtensionConfig {
      return {
        ...toRaw(this.extensionConfig),
        dialogSettings: toRaw(this.settingsOnClean),
      };
    },
  },
  mounted() {
    if (this.isReportingButDoesNotSupportReporting) {
      this.$store.dispatch("pagebuilder/setReportingContent", {
        nodeId: this.nodeId,
      });
    }
  },
};
</script>

<template>
  <NotDisplayable v-if="isReportingButDoesNotSupportReporting" not-supported />
  <div v-else :class="layoutClasses" :style="layoutStyle">
    <UIExtension
      :api-layer="apiLayer"
      :resource-location="resourceLocation"
      :extension-config="extensionConfigWithDialogSettings"
      :is-reporting="isReporting"
      :is-dialog-layout="isDialogLayout"
    />
  </div>
</template>

<style lang="postcss" scoped>
@import url("../mixins/layoutMixin.css");
</style>
