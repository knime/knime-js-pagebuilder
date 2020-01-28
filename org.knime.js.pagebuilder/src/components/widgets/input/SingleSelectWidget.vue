<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
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
        RadioButtons,
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
            return 'Current string input value is invalid';
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        isRadioButtons() {
            return (this.viewRep.type === "Radio buttons (vertical)") ||
                    (this.viewRep.type === "Radio buttons (horizontal)");
        },
        radioButtonsAlignment() {
            if (this.viewRep.type === "Radio buttons (vertical)") {
                return 'vertical';
            } else if (this.viewRep.type === "Radio buttons (horizontal)") {
                return 'horizontal';
            }
            return '';
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
            // text area doesn't have a validate method
            let validForm = typeof this.$refs.form.validate === 'function'
                ? this.$refs.form.validate()
                : true;
            return validForm && isValid;
        }
    }
};
</script>

<template>
  <div>
    <Label
      :text="label"
    >
      <RadioButtons
        v-if="isRadioButtons"
        :alignment="radioButtonsAlignment"
        ref="form"
        :value="value"
        :is-valid="isValid"
        :input-classes="inputClasses"
        :title="description"
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
