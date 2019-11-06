<script>
import NumberInput from '../baseElements/input/NumberInput';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.integer';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.integer';
const DEBOUNCER_TIMEOUT = 250;

/**
 * This is the Integer Input widget implementation.
 */
export default {
    components: {
        Label,
        NumberInput,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.viewRepresentation && obj.nodeInfo;
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
            return this.viewRep.description || '';
        },
        errorMessage() {
            if (this.isValid) {
                return '';
            } else if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            } else if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            } else {
                return 'Current integer input value is invalid';
            }
        },
        val() {
            return getProp(this.nodeConfig, CURRENT_VALUE_KEY) ||
                getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        },
        min() {
            return this.viewRep.usemin ? this.viewRep.min : -Number.MAX_SAFE_INTEGER;
        },
        max() {
            return this.viewRep.usemax ? this.viewRep.max : Number.MAX_SAFE_INTEGER;
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newValue = e.val;
            const newWebNodeConfig = {
                type: 'Integer Input',
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
            if (this.viewRep.required && (!value && value !== 0)) {
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
    <NumberInput
      type="integer"
      :value="val"
      :min="min"
      :max="max"
      :is-valid="isValid"
      :description="description"
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
