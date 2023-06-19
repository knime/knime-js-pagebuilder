<script>
import Label from 'webapps-common/ui/components/forms/Label.vue';
import SignWarningIcon from 'webapps-common/ui/assets/img/icons/sign-warning.svg';

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
        },
        notSupported: {
            type: Boolean,
            default: false
        }

    },
    computed: {
        nodeAnnotation() {
            return this.nodeInfo?.nodeAnnotation;
        },
        hasErrorMessage() {
            return this.nodeInfo?.nodeErrorMessage;
        },
        hasWarnMessages() {
            return this.nodeInfo?.nodeWarnMessage;
        },
        nodeName() {
            return this.nodeInfo?.nodeName || 'Missing node';
        },
        text() {
            let annotation = this.nodeAnnotation ? ` - ${this.nodeAnnotation}` : '';
            return `${this.nodeName}${annotation} (${this.nodeId}) can’t be displayed`;
        }
    }
};
</script>

<template>
  <div :class="{'not-supported': notSupported}">
    <template v-if="notSupported">
      <span>
        This view is currently not supported.
      </span>
    </template>
    <template v-else-if="showError">
      <SignWarningIcon class="icon" />
      <Label
        :text="text"
        large
      />
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

  &.not-supported {
    height: 100%;
  }
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
