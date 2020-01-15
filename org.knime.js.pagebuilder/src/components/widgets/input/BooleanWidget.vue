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
                boolean: ''
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
            return typeof this.value === 'boolean' &&
                this.$refs.form.validate();
        }
    }
};
</script>

<template>
  <div
    :title="description"
    class="knime-checkbox"
  >
    <Checkbox
      ref="form"
      :value="value"
      box-size="medium"
      class="knime-boolean knime-qf-title"
      @input="onChange"
    >
      {{ label }}
    </Checkbox>
  </div>
</template>

<style lang="postcss" scoped>
.knime-checkbox {
  display: flex;

  & .knime-label {
    overflow: hidden;
  }

  & .knime-qf-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    display: block;
    margin-bottom: 5px;
  }
}
</style>
