<script lang="ts">
import { mapState } from "vuex";
import { type PropType } from "vue";

import layoutMixin from "../mixins/layoutMixin";
import {
  UIExtension,
  type ExtensionConfig,
  type UIExtensionAPILayer,
} from "webapps-common/ui/uiExtensions";
import DialogControls from "./DialogControls.vue";
import NotDisplayable from "./NotDisplayable.vue";
import { UIExtensionPushEvents, type Alert } from "@knime/ui-extension-service";
import useCloseAndApplyHandling from "./useCloseAndApplyHandling";

/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-based).
 * Also detects changes to it's configuration and increments a local counter to help with re-renders of iframe-based
 * components.
 */
export default {
  components: {
    UIExtension,
    NotDisplayable,
    DialogControls,
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
    isNodeDialog: {
      type: Boolean,
      default: false,
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
  setup() {
    const { applyAndClose, close, isMetaKeyPressed, onKeyDown, onKeyUp } =
      useCloseAndApplyHandling();
    return {
      applyAndClose,
      close,
      isMetaKeyPressed,
      onKeyDown,
      onKeyUp,
    };
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  data() {
    return {
      /**
       * This is used within the {@link layoutMixin}
       */
      isWidget: false,
      resolveApplyDataPromise: null as
        | null
        | ((payload: { isApplied: boolean }) => void),
    };
  },
  computed: {
    ...mapState("pagebuilder", ["page", "isDialogLayout", "isReporting"]),
    ...mapState("pagebuilder/dialog", ["settingsOnClean"]),
    isUIExtShadowApp() {
      return this.extensionConfig?.resourceInfo?.type === "SHADOW_APP";
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
            this.isReporting && !this.isUIExtShadowApp;

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
        onApplied: (payload) => {
          this.resolveApplyDataPromise?.(payload);
        },
        registerPushEventService: ({ dispatchPushEvent }) => {
          const service = {
            onServiceEvent: dispatchPushEvent,
            serviceId: this.serviceId,
          };
          if (this.isNodeDialog) {
            this.$store.dispatch("pagebuilder/dialog/setApplySettings", {
              applySettings: () => {
                dispatchPushEvent<UIExtensionPushEvents.EventTypes.ApplyDataEvent>(
                  {
                    eventType: UIExtensionPushEvents.EventTypes.ApplyDataEvent,
                  },
                );
                return new Promise<{ isApplied: boolean }>((resolve) => {
                  this.resolveApplyDataPromise = resolve;
                });
              },
            });
          }
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
              remove?: boolean,
            ) => {
              if (remove) {
                closeAlert?.();
              }
            },
          });
        },
        setSettingsWithCleanModelSettings: (cleanData: any) => {
          this.$store.dispatch("pagebuilder/dialog/cleanSettings", cleanData);
        },
        setDirtyModelSettings: () => {
          this.$store.dispatch("pagebuilder/dialog/dirtySettings", true);
        },
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
  <div
    v-else
    :tabindex="-1"
    :class="['ui-ext-adapter', ...layoutClasses]"
    :style="layoutStyle"
    @keydown="isNodeDialog && onKeyDown($event)"
    @keyup="isNodeDialog && onKeyUp($event)"
  >
    <UIExtension
      :api-layer="apiLayer"
      :resource-location="resourceLocation"
      :extension-config="extensionConfig"
      :settings-on-clean="settingsOnClean"
      :is-reporting="isReporting"
      :is-dialog-layout="isDialogLayout"
      :shadow-app-style="{ 'flex-grow': 1 }"
    />
    <DialogControls
      v-if="isNodeDialog"
      :is-write-protected="extensionConfig.writeProtected"
      :is-meta-key-pressed="isMetaKeyPressed"
      @ok="applyAndClose"
      @cancel="close"
    />
  </div>
</template>

<style lang="postcss" scoped>
@import url("../mixins/layoutMixin.css");

.ui-ext-adapter {
  display: flex;
  flex-direction: column;
}
</style>
