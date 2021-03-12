<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Button from '~/webapps-common/ui/components/Button';

/**
 * Refresh button widget.
 *
 * @emits updateWidget event to trigger a partial re-execution of the component.
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
            this.$emit('updateWidget', {
                nodeId: this.nodeId
            });
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
      primary
      compact
      class="refresh-button"
      @click="onClick"
    >
      {{ viewRep.buttonText }}
    </Button>
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>
