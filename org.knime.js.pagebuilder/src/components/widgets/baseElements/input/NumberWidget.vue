<script>
import NumberInput from '~/webapps-common/ui/components/forms/NumberInput';
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../text/ErrorMessage';

/**
 * This is the implementation of the Number Input Widget. The primary goal of this component
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
        * The nodeConfig provided to the component should have the
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
        },
        type: {
            default: 'double',
            type: String,
            validator(val) {
                return ['double', 'integer'].includes(val);
            }
        },
        valuePair: {
            default: () => ({
                double: 0
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
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current input value is invalid';
        },
        value() {
            return this.valuePair[this.type];
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
                type: this.type,
                value
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
  <div>
    <Label :text="label">
      <NumberInput
        ref="form"
        :type="type"
        :value="value"
        :min="min"
        :max="max"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
    </Label>
    <ErrorMessage :error="errorMessage" />
  </div>
</template>
