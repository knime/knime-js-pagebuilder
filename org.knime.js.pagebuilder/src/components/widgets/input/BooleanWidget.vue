<script>
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';

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
                return Boolean(nodeId);
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
            return typeof this.value === 'boolean';
        }
    }
};
</script>

<template>
  <Checkbox
    ref="form"
    label-size="large"
    :value="value"
    :title="description"
    @input="onChange"
  >
    <span :title="label">{{ label }}</span>
  </Checkbox>
  <!-- no ErrorMessage needed yet -->
</template>
