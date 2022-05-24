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
                const requiredProperties = ['nodeId', 'workflowId', 'projectId'];
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
    methods: {
        async executeViewSaveSettings() {
            this.showReexecutionOverlay = true;
            this.showReexecutionSpinner = true;
            await this.$store.dispatch('pagebuilder/dialog/callApplySettings');
            await this.$store.dispatch('api/changeNodeStates', {
                extensionConfig: this.extensionConfig,
                newNodeState: 'execute'
            });
        }
    }
};
</script>

<template>
  <div class="view-container">
    <p class="message">
      Please execute the node to see the preview again.
    </p>
    <ExecutableImage />
    <Button
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
  display: flex;
  flex-direction: column;
  align-items: center;

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
