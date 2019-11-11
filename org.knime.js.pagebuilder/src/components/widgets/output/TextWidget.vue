/* eslint-disable vue/multiline-html-element-content-newline */
<script>
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { getProp } from '../../../util/nestedProperty';

const DEFAULT_VALUE_KEY = 'viewRepresentation.text';

/**
 * This is the Text Output widget. This widget has three rendering options:
 * a standard <p>{text...}</p> output, a preformatted <pre>{text...}</pre>
 * output and an HTML format.
 */
export default {
    components: {
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            default: () => ({}),
            type: Object
        },
        nodeId: {
            default: () => null,
            type: String
        },
        isValid: {
            default: () => true,
            type: Boolean
        }
    },
    data() {
        return {
            viewRep: this.nodeConfig.viewRepresentation
        };
    },
    computed: {
        label() {
            return this.viewRep.label;
        },
        description() {
            return this.viewRep.description || '';
        },
        errorMessage() {
            if (this.isValid) {
                return '';
            } else if (this.viewRep.errorMessage) {
                return this.viewRep.errorMessage;
            } else if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            } else if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            } else {
                return 'Current text output value is invalid';
            }
        },
        value() {
            return getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        },
        elementType() {
            switch (this.viewRep.textFormat) {
            case 'Text':
                return 'p';
            case 'Preformatted':
                return 'pre';
            default:
                return false;
            }
        }
    },
    methods: {
        validate(value) {
            /**
             * TODO: SRV-2626
             *
             * insert additional custom widget validation though likely
             * not needed for output widgets.
             */
            return true;
        }
    }
};
</script>

<template>
  <div
    :title="description"
  >
    <Label
      :text="label"
      class="knime-label"
    />
    <Component
      :is="elementType"
      v-if="elementType"
      class="knime-qf-text knime-multiline"
      v-text="value"
    />
    <!-- v-html needed to enable all existing behavior -->
    <div
      v-else
      class="knime-qf-text knime-multiline"
      v-html="value"
    />
    <ErrorMessage
      :error="errorMessage"
      class="knime-error"
    />
  </div>
</template>

<style lang="postcss" scoped>
.knime-multiline {
  line-height: 18px;
  font-size: 13px;
  letter-spacing: 0.08px;
}
</style>
