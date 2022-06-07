<script>
import Button from '~/webapps-common/ui/components/Button';
import ExecutingOverlay from '../ui/ExecutingOverlay';
import ExecutableImage from '../../assets/executable-plot.svg?inline';

export default {
    components: {
        Button,
        ExecutingOverlay,
        ExecutableImage
    },
    props: {
        extensionConfig: {
            default: () => ({}),
            type: Object,
            validate(extensionConfig) {
                if (typeof extensionConfig !== 'object' || Array.isArray(extensionConfig)) {
                    return false;
                }
                const requiredProperties = ['nodeId', 'workflowId', 'projectId', 'nodeInfo'];
                return requiredProperties.every(key => extensionConfig.hasOwnProperty(key));
            }
        }
    },
    data() {
        return {
            showReexecutionOverlay: false,
            showReexecutionSpinner: false
        };
    },
    computed: {
        canExecute() {
            // Strictly speaking there are situations where a node could still be executed even if it's in state 'idle'.
            // However, since 'idle' implies that no input spec is available, it will become available upon execution
            // (because the predecessors nodes are being executed then, too). And, since the node dialog (with the
            // view preview) has been opened without input specs available (e.g. column choices), we actually would need
            // to update the node dialog settings (i.e. the json schema) after execution (which we don't support, yet).
            // That's why we decided to not support that to avoid node dialogs which are not in sync with the input specs.
            return this.extensionConfig.nodeInfo.nodeState !== 'idle';
        }
    },
    methods: {
        async executeViewSaveSettings() {
            this.showReexecutionOverlay = true;
            this.showReexecutionSpinner = true;
            await this.$store.dispatch('pagebuilder/dialog/callApplySettings');
            await this.$store.dispatch('api/changeNodeStates', {
                extensionConfig: this.extensionConfig,
                action: 'execute'
            });
        }
    }
};
</script>

<template>
  <div class="view-container">
    <p
      v-if="canExecute"
      class="message"
    >
      Please execute the node to see the preview again.
    </p>
    <p
      v-else
      class="message"
    >
      Node cannot be executed in order to show the preview. Please check the workflow.
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
      :show="showReexecutionOverlay"
      :show-spinner="showReexecutionSpinner"
      :use-css-transition="false"
    />
  </div>
</template>

<style lang="postcss" scoped>
.view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > * {
    margin-block-start: 1em;
    margin-block-end: 1em;
  }

  & .message {
    font-size: 16px;
    line-height: 21px;
    font-weight: 300;
    color: var(--knime-masala);
  }

  & svg {
    max-height: 200px;
    max-width: 200px;
    stroke: var(--knime-gray-dark-semi);
  }
}
</style>
