<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';

/**
 * This is the Image Output widget. It supports SVG and PNG image formats.
 */
export default {
    components: {
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo && obj.viewRepresentation;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return Boolean(nodeId);
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        errorMessage: {
            default: null,
            type: String
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        description() {
            return this.viewRep.description || '';
        },
        value() {
            return this.viewRep.imageData;
        },
        imageFormat() {
            return this.viewRep.imageFormat || '';
        },
        maxHeight() {
            return this.viewRep.maxHeight || -1;
        },
        maxWidth() {
            return this.viewRep.maxWidth || -1;
        },
        cssStyle() {
            return {
                maxHeight: this.maxHeight > 0 ? `${this.maxHeight}px` : null,
                maxWidth: this.maxWidth > 0 ? `${this.maxWidth}px` : null
            };
        },
        valueAsDataUri() {
            return ['data:image/', this.imageFormat.toLowerCase(), ';base64,', this.value].join('');
        }
    }
};
</script>

<template>
  <div
    class="imageOutput"
    :title="description"
  >
    <Label
      :text="label"
    />
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="imageFormat === 'SVG'"
      :style="cssStyle"
      v-html="value"
    />
    <img
      v-else
      :style="cssStyle"
      :src="valueAsDataUri"
      :alt="description"
    >
    <ErrorMessage :error="errorMessage" />
  </div>
</template>
<style lang="postcss" scoped>
.imageOutput {
  & img {
    display: block;
  }

  & svg {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
</style>
