<script lang="ts">
import UIExtComponent from "./UIExtComponent.vue";
import UIExtIFrame from "./UIExtIFrame.vue";
import AlertLocal from "../../ui/AlertLocal.vue";
import WarningLocal from "../../ui/WarningLocal.vue";
import {
  AlertType,
  type Alert,
  type UIExtensionPushEvents,
} from "@knime/ui-extension-service";
import type { PropType } from "vue";
import type { UIExtensionAPILayer } from "./types/UIExtensionAPILayer";
import type { ExtensionConfig } from "./types/ExtensionConfig";
import { toServiceAPILayer } from "./toServiceAPILayer";
/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-based).
 * Also detects changes to it's configuration and increments a local counter to help with re-renders of iframe-based
 * components.
 */
export default {
  components: {
    UIExtComponent,
    UIExtIFrame,
    AlertLocal,
    WarningLocal,
  },
  props: {
    apiLayer: {
      required: true,
      type: Object as PropType<UIExtensionAPILayer>,
    },
    extensionConfig: {
      required: true,
      type: Object as PropType<ExtensionConfig>,
    },
    resourceLocation: {
      required: true,
      type: String,
    },
    isReporting: {
      default: false,
      type: Boolean,
    },
    isDialogLayout: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      alert: null as null | Alert,
      deregisterOldService: null as null | (() => void),
    };
  },
  computed: {
    isUIExtComponent() {
      return this.extensionConfig?.resourceInfo?.type === "VUE_COMPONENT_LIB";
    },
    displayError() {
      return this.alert?.type === "error" && !this.isReporting;
    },
    displayWarning() {
      return this.alert?.type === "warn" && !this.isReporting;
    },
    serviceAPILayer() {
      const setAlert = this.handleAlert.bind(this);
      return toServiceAPILayer(this.apiLayer, {
        config: this.extensionConfig,
        setAlert,
      });
    },
  },
  beforeUnmount() {
    this.deregisterOldService?.();
  },
  mounted() {
    const nodeInfo = this.extensionConfig.nodeInfo;
    const alertMessage =
      nodeInfo?.nodeErrorMessage || nodeInfo?.nodeWarnMessage;
    if (alertMessage) {
      const isError = nodeInfo?.nodeErrorMessage;
      const nodeId = this.extensionConfig.nodeId;
      this.handleAlert({
        message: alertMessage,
        type: isError ? AlertType.ERROR : AlertType.WARN,
        subtitle: "",
        nodeId,
      });
    }
  },
  methods: {
    onServiceCreated(service: {
      dispatchPushEvent: (event: UIExtensionPushEvents.PushEvent<any>) => void;
    }) {
      this.deregisterOldService =
        this.apiLayer.registerPushEventService(service);
    },
    handleAlert(alert: Alert) {
      if (this.isDialogLayout) {
        this.apiLayer.sendAlert(alert);
      } else {
        this.alert = alert;
      }
    },
    /**
     * Callback function passed to the alert store to close the local alert when a global alert action is
     * triggered. Can be used locally if needed.
     *
     * @param {Boolean} [remove] - optionally if the local alert should be cleared.
     * @returns {undefined}
     */
    closeAlert(remove?: boolean) {
      if (remove) {
        this.alert = null;
      }
    },
  },
};
</script>

<template>
  <UIExtComponent
    v-if="isUIExtComponent"
    ref="uiext"
    :api-layer="serviceAPILayer"
    :resource-location="resourceLocation"
    @service-created="onServiceCreated"
  />
  <UIExtIFrame
    v-else
    ref="uiext"
    :api-layer="serviceAPILayer"
    :resource-location="resourceLocation"
    @service-created="onServiceCreated"
  />
  <AlertLocal
    v-if="displayError"
    active
    @show-alert="apiLayer.sendAlert(alert!)"
  />
  <WarningLocal
    v-if="displayWarning"
    class="local-warning"
    @click="apiLayer.sendAlert(alert!)"
  />
</template>

<style lang="postcss" scoped>
.local-warning {
  position: absolute;
  bottom: 0;
  top: unset;
}
</style>
