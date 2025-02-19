<script>
import { Button } from "@knime/components";

import ExecutableImage from "../../assets/executable-plot.svg";
import ExecutingOverlay from "../ui/ExecutingOverlay.vue";

/**
 * Stylized overlay displayed in the Dialog-Preview when the node is not executed or requires
 * re-execution. Displays a button to trigger the execution of the underlying node.
 */
export default {
  components: {
    Button,
    ExecutingOverlay,
    ExecutableImage,
  },
  props: {
    extensionConfig: {
      default: () => ({}),
      type: Object,
      validate(extensionConfig) {
        if (
          typeof extensionConfig !== "object" ||
          Array.isArray(extensionConfig)
        ) {
          return false;
        }
        const requiredProperties = [
          "nodeId",
          "workflowId",
          "projectId",
          "nodeInfo",
        ];
        return requiredProperties.every((key) =>
          extensionConfig.hasOwnProperty(key),
        );
      },
    },
  },
  computed: {
    canExecute() {
      return this.extensionConfig.nodeInfo.canExecute !== false;
    },
    isExecuting() {
      return this.extensionConfig.nodeInfo.nodeState === "executing";
    },
  },
  watch: {
    "extensionConfig.nodeInfo": {
      handler() {
        this.showAlert();
      },
      deep: true,
    },
  },
  mounted() {
    this.showAlert();
  },
  methods: {
    async executeViewSaveSettings() {
      const { isApplied } = await this.$store.dispatch(
        "pagebuilder/dialog/callApplySettings",
      );
      if (isApplied) {
        await this.$store.dispatch("api/changeNodeStates", {
          extensionConfig: this.extensionConfig,
          action: "execute",
        });
      }
    },
    showAlert() {
      const nodeInfo = this.extensionConfig.nodeInfo;
      const alertMessage =
        nodeInfo?.nodeErrorMessage || nodeInfo?.nodeWarnMessage;
      if (alertMessage) {
        const isError = nodeInfo?.nodeErrorMessage;
        const nodeId = this.extensionConfig.nodeId;
        const alert = {
          message: alertMessage,
          type: isError ? "error" : "warn",
          subtitle: "",
          nodeId,
        };
        this.$store.dispatch("pagebuilder/alert/showAlert", alert);
      }
    },
  },
};
</script>

<template>
  <div class="view-container">
    <p v-if="canExecute" class="message">
      Please execute the node to see the preview.
    </p>
    <p v-else class="message">
      Node cannot be executed in order to show the preview. Please check the
      workflow.
    </p>
    <ExecutableImage />
    <Button
      :disabled="!canExecute"
      with-border
      title="Save & execute"
      @click="executeViewSaveSettings"
    >
      Save & execute
    </Button>
    <ExecutingOverlay
      :show="isExecuting"
      :show-spinner="isExecuting"
      :use-css-transition="false"
    />
  </div>
</template>

<style lang="postcss" scoped>
.view-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & .message {
    font-size: 16px;
    line-height: 21px;
    font-weight: 300;
    color: var(--knime-masala);
  }

  & svg {
    max-height: 200px;
    max-width: 200px;
    stroke: var(--knime-silver-sand);
    margin-bottom: 20px;
  }
}
</style>
