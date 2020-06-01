<script>
import InputField from '~/webapps-common/ui/components/forms/InputField';
import TextArea from '~/webapps-common/ui/components/forms/TextArea';
import Label from 'webapps-common/ui/components/forms/Label';
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
        },
        errorMessage: {
            type: String,
            default: null
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
            return this.viewRep.description || null;
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
            return this.viewRep.regex || null;
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
            let errorMessage;
            if (this.viewRep.required === false) {
                return { isValid, errorMessage };
            }
            if (!this.$refs.form.getValue()) {
                isValid = false;
                errorMessage = 'Input is required.';
            }
            // text area doesn't have a validate method
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current input is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <div>
    <Label
      :text="label"
    >
      <TextArea
        v-if="isMultiLine"
        ref="form"
        :value="value"
        :cols="multiColumns"
        :rows="multiRows"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <InputField
        v-else
        ref="form"
        :value="value"
        :is-valid="isValid"
        :title="description"
        :pattern="regex"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Label>
  </div>
</template>

<style lang="postcss" scoped>
div {
  overflow: hidden !important;
}
</style>
