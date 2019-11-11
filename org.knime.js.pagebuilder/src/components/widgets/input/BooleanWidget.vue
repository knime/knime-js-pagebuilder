<script>
import Label from '../baseElements/text/Label';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.boolean';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.boolean';
const DEBOUNCER_TIMEOUT = 250;

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
    updateDebouncer: null,
    computed: {
        label() {
            return this.viewRep.label;
        },
        description() {
            return this.viewRep.description || '';
        },
        value() {
            return getProp(this.nodeConfig, CURRENT_VALUE_KEY) ||
                getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newWebNodeConfig = {
                type: 'Boolean Input',
                nodeId: this.nodeId,
                originalEvent: { value: e },
                isValid: this.validate(e),
                update: {
                    [CURRENT_VALUE_KEY]: e
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
            return typeof value !== 'undefined';
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
