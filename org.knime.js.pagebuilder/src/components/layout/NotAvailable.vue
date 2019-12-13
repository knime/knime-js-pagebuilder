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
        hasAnnotation() {
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
            return this.hasAnnotation
                ? `${this.nodeName}(${this.nodeId}) - ${this.nodeInfo.nodeAnnotation}`
                : `${this.nodeName}(${this.nodeId})`;
        }
    }
};
</script>

<template>
  <div class="red">
    <Label :text="text" />
    <p v-if="hasErrorMessage">
      Error Message on node: {{ nodeInfo.nodeErrorMessage }}
    </p>
    <p v-else-if="hasWarnMessages">
      Warn message on node: {{ nodeInfo.nodeWarnMessage }}
    </p>
    <p v-else>
      No further information on the node available. Please check the configuration of the workflow
    </p>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.red {
  color: var(--theme-color-error);
}
</style>
