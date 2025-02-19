<script>
import { Label } from "@knime/components";

import { getProp } from "../../../util/nestedProperty";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const DEFAULT_VALUE_KEY = "viewRepresentation.text";

/**
 * This is the Text Output widget. This widget has three rendering options:
 * a standard <p>{text...}</p> output, a preformatted <pre>{text...}</pre>
 * output and an HTML format.
 */
export default {
  components: {
    Label,
    ErrorMessage,
  },
  props: {
    /**
     * The nodeConfig provided to the Text Output Widget component should
     * have the necessary fields as seen in the validator below:
     *
     * ex:  nodeConfig = {
     *          nodeInfo: {...},
     *          viewRepresentation: {
     *              text: "{String}"
     *          },
     *          ...
     *      };
     */
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return (
          obj.nodeInfo &&
          obj.viewRepresentation &&
          typeof getProp(obj, DEFAULT_VALUE_KEY) === "string"
        );
      },
    },
    nodeId: {
      required: true,
      type: String,
      validator(nodeId) {
        return nodeId !== "";
      },
    },
    isValid: {
      default: true,
      type: Boolean,
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
    errorMessage() {
      if (this.isValid) {
        return null;
      }
      if (this.viewRep.errorMessage) {
        return this.viewRep.errorMessage;
      }
      if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
        return this.nodeConfig.nodeInfo.nodeErrorMessage;
      }
      if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
        return this.nodeConfig.nodeInfo.nodeWarnMessage;
      }
      return "Current text output value is invalid";
    },
    /**
     * Unlike some other widgets, the Text Output only has one value.
     *
     * @returns {String} the text output to be displayed.
     */
    value() {
      return getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
    },
    /**
     * This property determines the type of element to be rendered in the component
     * based on the settings from the nodeConfig. There are three possible rendering
     * options in this node; controlled by the nodeConfig.viewRepresentation.textFor-
     * mat value. The configuration options map to HTML elements as follows: 'Text' =>
     * 'p' (<p></p> for regular text), 'Preformatted' => 'pre' (<pre></pre> for pre-
     * formatted text) and 'Html' => false (boolean, which will trigger a Vue HTML
     * injection).
     *
     * @returns {(String|Boolean)} either the element tag (string) or false (boolean)
     */
    elementType() {
      if (this.viewRep.textFormat === "Text") {
        return "p";
      }
      if (this.viewRep.textFormat === "Preformatted") {
        return "pre";
      }
      return false;
    },
  },
};
</script>

<template>
  <div :title="description">
    <Label :text="label" large />
    <!-- eslint-disable vue/no-v-text-v-html-on-component -->
    <Component
      :is="elementType"
      v-if="elementType"
      class="multiline"
      v-text="value"
    />
    <!-- v-html needed to enable all existing behavior -->
    <!-- eslint-disable vue/no-v-html -->
    <div v-else class="multiline" v-html="value" />
    <ErrorMessage :error="errorMessage" />
  </div>
</template>

<style lang="postcss" scoped>
.multiline {
  line-height: 18px;
  font-size: 13px;
  text-overflow: ellipsis;
}
</style>
