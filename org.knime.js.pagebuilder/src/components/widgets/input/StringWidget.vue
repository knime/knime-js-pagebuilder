<script>
import InputField from '~/webapps-common/ui/components/forms/InputField';
import TextArea from '~/webapps-common/ui/components/forms/TextArea';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';

const DATA_TYPE = 'string';

/**
 * This is the String Input widget implementation. At this component
 * level, the primary goal is to parse the view representation into
 * the necessary configuration values to render the correct input
 * element.
 *
 * This widget has two rendering options: a standard input field or
 * a text area.
 */
export default {
    components: {
        Label,
        InputField,
        TextArea,
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
                return Boolean(nodeId);
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE]: 0
            }),
            type: Object
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
            return this.viewRep.description || null;
        },
        errorMessage() {
            if (this.isValid) {
                return '';
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
            return 'Current string input value is invalid';
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        isMultiLine() {
            return this.viewRep.editorType === 'Multi-line';
        },
        multiColumns() {
            return this.viewRep.multilineEditorWidth;
        },
        multiRows() {
            return this.viewRep.multilineEditorHeight;
        },
        regex() {
            return this.viewRep.regex || '.*';
        },
        inputClasses() {
            let classList = 'knime-qf-input knime-string ';
            classList += this.isMultiLine ? 'knime-multi-line' : 'knime-single-line';
            return classList;
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            if (this.viewRep.required && !this.$refs.form.getValue()) {
                isValid = false;
            }
            return this.$refs.form.validate() && isValid;
        }
    }
};
</script>

<template>
  <div
    :title="description"
    class="knime-string-widget"
  >
    <Label
      :text="label"
      class="knime-label"
    />
    <TextArea
      v-if="isMultiLine"
      ref="form"
      :value="value"
      :cols="multiColumns"
      :rows="multiRows"
      :is-valid="isValid"
      :input-classes="inputClasses"
      @input="onChange"
    />
    <InputField
      v-else
      ref="form"
      :value="value"
      :is-valid="isValid"
      :input-classes="inputClasses"
      @input="onChange"
    />
    <ErrorMessage
      :error="errorMessage"
      :class="['knime-error', { 'ms-edge-valid': isValid }]"
    />
  </div>
</template>

<style lang="postcss" scoped>
.knime-string-widget {
  overflow: hidden !important;
}

/* Microsoft edge has trouble updating props in a timely manner, so hide if necessary */
.ms-edge-valid {
  visibility: hidden;
}
</style>
