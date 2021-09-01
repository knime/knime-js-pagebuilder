<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import SignWarningIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg?inline';

export default {
    components: {
        Label,
        SignWarningIcon
    },
    props: {
        nodeInfo: {
            type: Object,
            default: () => {}
        },
        nodeId: {
            type: String,
            default: ''
        },
        showError: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        nodeAnnotation() {
            return this.nodeInfo && this.nodeInfo.nodeAnnotation;
        },
        hasErrorMessage() {
            return this.nodeInfo && this.nodeInfo.nodeErrorMessage;
        },
        hasWarnMessages() {
            return this.nodeInfo && this.nodeInfo.nodeWarnMessage;
        },
        nodeName() {
            return this.nodeInfo ? this.nodeInfo.nodeName : 'Missing node';
        },
        text() {
            let annotation = this.nodeAnnotation ? ` - ${this.nodeAnnotation}` : '';
            return `${this.nodeName}${annotation} (${this.nodeId}) can’t be displayed`;
        }
    }
};
</script>

<template>
  <div>
    <template v-if="showError">
      <SignWarningIcon class="icon" />
      <Label :text="text" />
      <span v-if="hasErrorMessage">
        Error message on node: {{ nodeInfo.nodeErrorMessage }}
      </span>
      <span v-else-if="hasWarnMessages">
        Warn message on node: {{ nodeInfo.nodeWarnMessage }}
      </span>
      <span v-else>
        No further information available. Please check the configuration of the workflow.
      </span>
    </template>
  </div>
</template>

<style lang="postcss" scoped>
div {
  color: var(--theme-color-error);
  border: 2px solid var(--knime-porcelain);
  padding: 18px 18px 18px 56px;
  font-size: 16px;
}

.icon {
  position: absolute;
  margin-left: -40px;
  width: 24px;
  height: 24px;
  stroke-width: calc(32px / 24);
  stroke: var(--theme-color-error);
}
</style>
