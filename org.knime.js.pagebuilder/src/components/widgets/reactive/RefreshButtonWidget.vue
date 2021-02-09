<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Button from '~/webapps-common/ui/components/Button';

/**
 * Refresh button widget.
 *
 * TODO: WEBP-678 - document reactive event API.
 */
export default {
    components: {
        Button,
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        }
    },
    methods: {
        onClick() {
            // TODO: WEBP-678 - emit reactive events
            // this.$emit('reactiveEvent', {
            //     nodeId: this.nodeId
            // });
        }
    }
};
</script>

<template>
  <Label
    :text="viewRep.label"
    :title="viewRep.description"
  >
    <Button
      ref="refreshButton"
      primary
      compact
      class="refresh-button"
      @click="onClick"
    >
      {{ viewRep.text }}
    </Button>
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style lang="postcss" scoped>

.now-button {
  height: 30px;
  align-self: center;
}

</style>
