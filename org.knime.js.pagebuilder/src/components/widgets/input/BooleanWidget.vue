<script>
import Label from '../baseElements/text/Label';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.boolean';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.boolean';

/**
 * This is the Boolean Input widget implementation.
 */
export default {
    components: {
        Label,
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
            this.$el.querySelector('.knime-boolean').focus();
            const newWebNodeConfig = {
                type: 'Boolean Input',
                nodeId: this.nodeId,
                isValid: this.validate(e),
                update: {
                    [CURRENT_VALUE_KEY]: e
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
            return typeof value === 'boolean';
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
      :value="value"
      box-size="14px"
      box-padding="5px 0 3px 26px"
      check-height="5px"
      check-width="10px"
      check-left="-1.25px"
      check-top="4px"
      class="knime-boolean"
      @input="onChange"
    />
    <Label
      :text="label"
      class="knime-label"
      @input="onChange"
      @click.native="()=>onChange(!value)"
    />
  </div>
</template>

<style lang="postcss" scoped>
.knime-checkbox {
  display: flex;

  & .knime-label {
    overflow: hidden;
  }
}
</style>
