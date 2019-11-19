<script>
import NumberInput from '../baseElements/input/NumberInput';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.integer';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.integer';

/**
 * This is the implementation of the Integer Input Widget. This component relies
 * on the NumberInput component. The primary goal of the IntegerWidget component
 * is to parse the various settings from the nodeConfig provided by the parent
 * Widget component and parse them correctly for the NumberInput component.
 */
export default {
    components: {
        Label,
        NumberInput,
        ErrorMessage
    },
    props: {
        /**
        * The nodeConfig provided to the DoubleWidget component should have the
        * necessary fields as seen in the validator below:
        *
        * ex:  nodeConfig = {
        *          viewRepresentation: {...},
        *          nodeInfo: {...},
        *          ...
        *      };
        */
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
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current integer input value is invalid';
        },
        value() {
            let currentValue = getProp(this.nodeConfig, CURRENT_VALUE_KEY);
            let defaultValue = getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
            if (typeof currentValue === 'number' && this.validate(currentValue)) {
                return currentValue;
            }
            return defaultValue;
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
            const newValue = e.value;
            const newWebNodeConfig = {
                type: 'Integer Input',
                nodeId: this.nodeId,
                isValid: e.isValid && this.validate(newValue),
                update: {
                    [CURRENT_VALUE_KEY]: newValue
                }
            };
            this.$emit('updateWidget', newWebNodeConfig);
        },
        validate(value) {
            /**
             * TODO: SRV-2626
             *
             * insert additional custom widget validation
             */
            if (this.viewRep.required) {
                if (isNaN(value)) {
                    return false;
                }
                if (value < this.min || value > this.max) {
                    return false;
                }
                return value || value === 0;
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
      :value="value"
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
