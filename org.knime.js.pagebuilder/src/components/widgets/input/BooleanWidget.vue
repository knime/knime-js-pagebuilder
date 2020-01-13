<script>
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.boolean';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.boolean';

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
            default: () => true,
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
        value() {
            let currentValue = getProp(this.nodeConfig, CURRENT_VALUE_KEY);
            return typeof currentValue === 'boolean'
                ? currentValue
                : getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        }
    },
    methods: {
        onChange(e) {
            const changeEventObj = {
                nodeId: this.nodeId,
                update: {
                    [CURRENT_VALUE_KEY]: e
                }
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
