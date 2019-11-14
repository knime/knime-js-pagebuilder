<script>
import InputField from '../baseElements/input/InputField';
import TextArea from '../baseElements/input/TextArea';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.string';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.string';
const DEBOUNCER_TIMEOUT = 250;

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
            default: () => ({}),
            type: Object
        },
        nodeId: {
            default: () => null,
            type: String
        },
        isValid: {
            default: () => false,
            type: Boolean
        }
    },
    data() {
        return {
            viewRep: this.nodeConfig.viewRepresentation
        };
    },
    updateDebouncer: null,
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
        val() {
            return getProp(this.nodeConfig, CURRENT_VALUE_KEY) || getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        },
        editorType() {
            return this.viewRep.editorType;
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
        placeholder() {
            return '';
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newValue = e.val;
            const newWebNodeConfig = {
                type: 'String Input',
                nodeId: this.nodeId,
                originalEvent: e.originalEvent,
                isValid: e.isValid && this.validate(newValue),
                update: {
                    [CURRENT_VALUE_KEY]: newValue
                }
            };
            this.updateDebouncer = setTimeout(() => {
                this.$emit('updateWidget', newWebNodeConfig);
            }, DEBOUNCER_TIMEOUT);
        },
        validate(value) {
            /**
             * TODO: SRV-2626
             *
             * insert additional custom widget validation
             */
            if (this.viewRep.required && !value) {
                return false;
            }
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
    <TextArea
      v-if="editorType === 'Multi-line'"
      :value="val"
      :cols="multiColumns"
      :rows="multiRows"
      :pattern="regex"
      :placeholder="placeholder"
      :is-valid="isValid"
      @updateValue="onChange"
    />
    <InputField
      v-else
      :value="val"
      type="text"
      :pattern="regex"
      :placeholder="placeholder"
      :is-valid="isValid"
      @updateValue="onChange"
    />
    <ErrorMessage
      :error="errorMessage"
      class="knime-error"
    />
  </div>
</template>

<style lang="postcss" scoped>

</style>
