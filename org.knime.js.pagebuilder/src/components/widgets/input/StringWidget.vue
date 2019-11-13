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
            const value = getProp(this.nodeConfig, CURRENT_VALUE_KEY);
            return !value && value !== '' ? getProp(this.nodeConfig, DEFAULT_VALUE_KEY) : value;
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
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newValue = e.value;
            const newWebNodeConfig = {
                type: 'String Input',
                nodeId: this.nodeId,
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
            if (this.viewRep.required) {
                if (!value) {
                    return false;
                }
            }
            return true;
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
      v-if="editorType === 'Multi-line'"
      :value="value"
      :cols="multiColumns"
      :rows="multiRows"
      :pattern="regex"
      :is-valid="isValid"
      @updateValue="onChange"
    />
    <InputField
      v-else
      :value="value"
      type="text"
      :pattern="regex"
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
.knime-string-widget {
  overflow: hidden !important;
}
</style>
