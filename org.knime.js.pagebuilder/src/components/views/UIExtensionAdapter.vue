<script lang="ts">
import { mapState } from "vuex";
import { defineComponent, toRaw, type PropType } from "vue";

import layoutMixin from "../mixins/layoutMixin";
import {
  UIExtension,
  UIExtensionAlerts,
  type ExtensionConfig,
  type UIExtensionAPILayer,
} from "@knime/ui-extension-renderer/vue";

import DialogControls from "./DialogControls.vue";
import NotDisplayable from "./NotDisplayable.vue";
import {
  type Alert,
  ImageGenerationRenderingConfig,
  ReportRenderingConfig,
  ErrorAlert,
  WarningAlert,
} from "@knime/ui-extension-renderer/api";
import useCloseAndApplyHandling from "./useCloseAndApplyHandling";
import {
  errorToGlobalAlertParams,
  type GlobalAlertParams,
  warningToGlobalAlertParams,
} from "./util/globalAlert";

/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-based).
 * Also detects changes to it's configuration and increments a local counter to help with re-renders of iframe-based
 * components.
 */
export default defineComponent({
  components: {
    UIExtension,
    UIExtensionAlerts,
    NotDisplayable,
    DialogControls,
  },
  mixins: [layoutMixin],
  props: {
    extensionConfig: {
      default: () => ({}),
      type: Object as PropType<
        ExtensionConfig & {
          resourceInfo: { baseUrl: string };
          nodeInfo?: { nodeName: string };
          canBeEnlarged?: boolean;
        }
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
      currentPublishedData: null,
      dialogControlsShouldBeVisible: true,
      resolveApplyDataPromise: null as
        | null
        | ((payload: { isApplied: boolean }) => void),
      currentAlert: null as null | Alert,
    };
  },
  computed: {
    ...mapState("pagebuilder", ["page", "isDialogLayout", "isReporting"]),
    ...mapState("pagebuilder/dialog", ["settingsOnClean"]),
    isUIExtShadowApp() {
      return this.extensionConfig?.resourceInfo?.type === "SHADOW_APP";
    },
    isEnlargedDialog() {
      return this.extensionConfig?.canBeEnlarged && this.isNodeDialog;
    },
    extensionConfigWithStartEnlarged() {
      return {
        ...toRaw(this.extensionConfig),
        startEnlarged: this.isEnlargedDialog,
      };
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
        this.isReporting &&
        !(this.extensionConfig?.renderingConfig as ReportRenderingConfig)
          ?.canBeUsedInReport
      );
    },
    showAlertsImmediately() {
      return this.isDialogLayout || this.isNodeDialog;
    },
    apiLayer(): UIExtensionAPILayer {
      return {
        getResourceLocation: (path) => {
          return Promise.resolve(
            this.$store.getters["api/uiExtResourceLocation"]({
              resourceInfo: {
                baseUrl: this.extensionConfig.resourceInfo.baseUrl,
                path,
              },
            }),
          );
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
          this.currentPublishedData = data;
          this.$emit("publishData", data);
        },
        setReportingContent: (reportingContent) => {
          return this.$store.dispatch("pagebuilder/setReportingContent", {
            nodeId: this.nodeId,
            reportingContent,
          });
        },
        imageGenerated: (generatedImage) => {
          const { renderingConfig } = this.extensionConfig;
          if (renderingConfig?.type === "IMAGE") {
            window.EquoCommService.send(
              (renderingConfig as ImageGenerationRenderingConfig).actionId,
              generatedImage,
            );
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
                dispatchPushEvent<"ApplyDataEvent">({
                  eventType: "ApplyDataEvent",
                });
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
        sendAlert: (alert: Alert) => {
          if (this.showAlertsImmediately) {
            this.displayAlert(alert);
          } else {
            this.currentAlert = alert;
          }
        },
        onDirtyStateChange: ({ view }) => {
          if (view === "configured" || view === "idle") {
            this.$store.dispatch("pagebuilder/dialog/dirtySettings", true);
          } else {
            this.$store.dispatch(
              "pagebuilder/dialog/cleanSettings",
              this.currentPublishedData,
            );
          }
        },
        setControlsVisibility: ({ shouldBeVisible }) => {
          this.dialogControlsShouldBeVisible = shouldBeVisible;
        },
        showDataValueView: () => {
          // Do noting
        },
        closeDataValueView: () => {
          // Do noting
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
  methods: {
    displayAlert(alert: Alert) {
      if (alert.type === "error") {
        this.displayError(alert);
      } else {
        this.displayWarnings(alert);
      }
    },
    displayError(errorAlert: ErrorAlert) {
      this.displayGlobalAlertOverlay(errorToGlobalAlertParams(errorAlert));
    },
    displayWarnings(warning: WarningAlert) {
      this.displayGlobalAlertOverlay(warningToGlobalAlertParams(warning));
    },
    displayGlobalAlertOverlay(alert: GlobalAlertParams) {
      this.$store.dispatch("pagebuilder/alert/showAlert", {
        type: alert.type,
        subtitle: alert.subtitle,
        message: alert.message,
        nodeId: this.extensionConfig.nodeId,
        nodeInfo: {
          /**
           * With an empty truthy string as default we circumvent the "Missing Node" headline we get in case of dialog error alerts
           */
          nodeName: this.extensionConfig?.nodeInfo?.nodeName ?? " ",
          ...this.extensionConfig?.nodeInfo,
        },
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
            this.removeAlert();
          }
        },
      });
    },
    removeAlert() {
      this.currentAlert = null;
    },
  },
});
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
      :extension-config="extensionConfigWithStartEnlarged"
      :initial-shared-data="settingsOnClean"
      :is-reporting="isReporting"
      :is-dialog-layout="isDialogLayout"
      :shadow-app-style="{ 'flex-grow': 1 }"
    />

    <UIExtensionAlerts
      v-if="!isReporting && !showAlertsImmediately"
      :alert="currentAlert"
      @display="displayAlert($event)"
    />

    <DialogControls
      v-if="isNodeDialog && dialogControlsShouldBeVisible"
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
