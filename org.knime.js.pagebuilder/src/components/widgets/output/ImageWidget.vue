<script>
import { Label } from "@knime/components";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

/**
 * This is the Image Output widget. It supports SVG and PNG image formats.
 */
export default {
  components: {
    Label,
    ErrorMessage,
  },
  props: {
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return obj.nodeInfo && obj.viewRepresentation;
      },
    },
    nodeId: {
      required: true,
      type: String,
      validator(nodeId) {
        return Boolean(nodeId);
      },
    },
    isValid: {
      default: true,
      type: Boolean,
    },
    errorMessage: {
      default: null,
      type: String,
    },
  },
  computed: {
    viewRep() {
      return this.nodeConfig.viewRepresentation;
    },
    label() {
      return this.viewRep.label;
    },
    description() {
      return this.viewRep.description || "";
    },
    value() {
      return this.viewRep.imageData;
    },
    imageFormat() {
      return this.viewRep.imageFormat || "";
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
        maxWidth: this.maxWidth > 0 ? `${this.maxWidth}px` : null,
      };
    },
    valueAsDataUri() {
      // only used for base64 encoded PNGs (possibly other base64 encoded format)
      return `data:image/${this.imageFormat.toLowerCase()};base64,${
        this.value
      }`;
    },
  },
  watch: {
    value() {
      this.$nextTick(this.updateSvgSize);
    },
  },
  mounted() {
    this.updateSvgSize();
  },
  methods: {
    updateSvgSize() {
      let svg = this.$refs.svg?.children[0];
      if (svg) {
        this.svgModifySize(svg, this.maxWidth, this.maxHeight);
      }
    },
    svgModifySize(element, width, height) {
      let originalWidth = parseInt(element.getAttribute("width"), 10);
      let originalHeight = parseInt(element.getAttribute("height"), 10);
      let svgWidth = originalWidth;
      let svgHeight = originalHeight;
      let svgAspect = svgWidth / svgHeight;
      if (width >= 0 && svgWidth > width) {
        svgWidth = width;
        svgHeight = svgWidth / svgAspect;
        this.svgCreateViewBox(
          element,
          svgWidth,
          svgHeight,
          originalWidth,
          originalHeight,
        );
        element.style.overflow = "hidden";
      }
      if (height >= 0 && svgHeight > height) {
        svgHeight = height;
        svgWidth = svgHeight * svgAspect;
        this.svgCreateViewBox(
          element,
          svgWidth,
          svgHeight,
          originalWidth,
          originalHeight,
        );
        element.style.overflow = "hidden";
      }
      element.style.width = `${svgWidth}px`;
      element.style.height = `${svgHeight}px`;
    },
    // eslint-disable-next-line max-params
    svgCreateViewBox(element, width, height, oldWidth, oldHeight) {
      element.setAttribute("viewBox", `0 0 ${oldWidth} ${oldHeight}`);
      element.setAttribute("preserveAspectRatio", "xMinYMin meet");
      element.setAttribute("width", Math.round(width));
      element.setAttribute("height", Math.round(height));
      element.style.width = `${Math.round(width)}px`;
      element.style.height = `${Math.round(height)}px`;
    },
    validate() {
      if (!["SVG", "PNG"].includes(this.imageFormat)) {
        return {
          isValid: true,
          errorMessage: `Unsupported image format: ${this.imageFormat}`,
        };
      }
      return {
        isValid: true,
        errorMessage: null,
      };
    },
  },
};
</script>

<template>
  <div class="image-output" :title="description">
    <Label :text="label" large />
    <!-- eslint-disable vue/no-v-html -->
    <div v-if="imageFormat === 'SVG'" ref="svg" v-html="value" />
    <img v-else :style="cssStyle" :src="valueAsDataUri" :alt="description" />
    <ErrorMessage :error="errorMessage" />
  </div>
</template>

<style lang="postcss" scoped>
.image-output {
  & > img {
    display: block;
  }

  & > div {
    /* fix firefox bug when resizing svg */
    line-height: 100%;
  }
}
</style>
