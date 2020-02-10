<script>
import SingleSelectWidget from '@/components/widgets/input/SingleSelectWidget';
import MultiSelectWidget from '@/components/widgets/input/MultiSelectWidget';

/**
 * Workaround until the @class for multi and single select is different
 * TODO: remove me and update widgets.config.js
 */
export default {
    components: {
        MultiSelectWidget,
        SingleSelectWidget
    },
    inheritAttrs: false,
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        }
    },
    methods: {
        validate() {
            return this.$refs.widget.validate();
        }
    }
};
</script>

<template>
  <div>
    <SingleSelectWidget
      v-if="this.nodeConfig.namespace === 'knimeSingleSelectionWidget'"
      ref="widget"
      :node-config="nodeConfig"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <MultiSelectWidget
      v-else
      ref="widget"
      :node-config="nodeConfig"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </div>
</template>
