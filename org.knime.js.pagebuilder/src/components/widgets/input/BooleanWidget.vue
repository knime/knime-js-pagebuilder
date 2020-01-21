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
            return typeof this.value === 'boolean';
        }
    }
};
</script>

<template>
  <div
    :title="description"
    class="checkbox-widget"
  >
    <Checkbox
      ref="form"
      :value="value"
      box-size="medium"
      class="checkbox-input"
      @input="onChange"
    >
      {{ label }}
    </Checkbox>
  </div>
</template>

<style lang="postcss" scoped>

div {
  display: flex;

  & .checkbox-input {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    display: block;
    margin-bottom: 5px;

    &.medium {
      padding-top: 0;
    }

    &.large {
      padding-top: 3px;
    }
  }
}
</style>
