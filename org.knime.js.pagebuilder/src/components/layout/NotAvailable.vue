<script>
import Label from '../widgets/baseElements/text/Label';

export default {
    components: {
        Label
    },
    props: {
        nodeInfo: {
            type: Object,
            default: () => {}
        },
        nodeId: {
            type: String,
            default: ''
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
            if (this.nodeInfo) {
                return this.nodeInfo.nodeName;
            }
            return 'Missing Node';
        },
        text() {
            let annotation = this.nodeAnnotation ? ` - ${this.nodeAnnotation}` : '';
            return `${this.nodeName}${annotation} (${this.nodeId}) can’t be displayed`;
        }
    }
};
</script>

<template>
  <div class="red">
    <Label :text="text" />
    <p v-if="hasErrorMessage">
      Error message on node: {{ nodeInfo.nodeErrorMessage }}
    </p>
    <p v-else-if="hasWarnMessages">
      Warn message on node: {{ nodeInfo.nodeWarnMessage }}
    </p>
    <p v-else>
      No further information available. Please check the configuration of the workflow.
    </p>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.red {
  color: var(--theme-color-error);
}
</style>
