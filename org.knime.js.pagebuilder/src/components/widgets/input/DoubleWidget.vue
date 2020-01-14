<script>
import NumberInput from '../baseElements/input/NumberInput';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.double';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.double';

/**
 * This is the implementation of the Double Input Widget. This component relies
 * on the NumberInput component. The primary goal of the DoubleWidget component
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
            default: true,
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
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current double input value is invalid';
        },
        value() {
            let currentValue = getProp(this.nodeConfig, CURRENT_VALUE_KEY);
            let defaultValue = getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
            if (typeof currentValue === 'number') {
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
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                update: {
                    [CURRENT_VALUE_KEY]: value
                }
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            if (!this.viewRep.required) {
                return true;
            }
            let value = this.$refs.form.getValue();
            let isValid = true;
            if (isNaN(value)) {
                isValid = false;
            }
            if (value < this.min || this.max < value) {
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
  >
    <Label
      :text="label"
      class="knime-label"
    />
    <NumberInput
      ref="form"
      type="double"
      :value="value"
      :min="min"
      :max="max"
      :is-valid="isValid"
      :description="description"
      class="knime-input-container"
      @input="onChange"
    />
    <ErrorMessage
      :error="errorMessage"
      class="knime-error"
    />
  </div>
</template>
