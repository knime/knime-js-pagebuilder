<script>
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';

const DATA_TYPE = 'boolean';

/**
 * This is the Boolean Input widget implementation.
 */
export default {
    components: {
        Checkbox
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
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                boolean: true
            }),
            type: Object
        }
    },
    emits: ['updateWidget'],
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        description() {
            return this.viewRep.description || '';
        },
        value() {
            return this.valuePair[DATA_TYPE];
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
            let isValid = typeof this.value === 'boolean';
            return { isValid, errorMessage: isValid ? null : 'Input is not responding.' };
        }
    }
};
</script>

<template>
  <Checkbox
    ref="form"
    label-size="large"
    :model-value="value"
    :title="description"
    @update:model-value="onChange"
  >
    <span :title="label">{{ label }}</span>
  </Checkbox>
  <!-- no ErrorMessage needed yet -->
</template>
