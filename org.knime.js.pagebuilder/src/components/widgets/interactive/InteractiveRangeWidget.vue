<script>
import SliderWidget from '@/components/widgets/input/SliderWidget';

const DATA_TYPE = 'double';
const UPDATE_KEY_MIN = 'viewValue.filter.columns.0.minimum';
const UPDATE_KEY_MAX = 'viewValue.filter.columns.0.maximum';
const MAX_DECIMAL_PRECISION = 6;

/**
 * Interactive Range Slider Filter Widget.
 *
 * Publishes filters for interacting with subscriber-views in the WebPortal and KAP.
 */
export default {
    components: {
        SliderWidget
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
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
        errorMessage: {
            type: String,
            default: null
        }
    },
    computed: {
        viewValue() {
            return this.nodeConfig.viewValue;
        },
        filter() {
            return this.viewValue.filter;
        },
        valueMinimum() {
            /* Currently vue-slider-component only supports limited precision. The backend is using
            BigDecimals, so it's possible to get a number with an very large precision. A feature
            request was opened with vue-slider-component to support more precision and it can be
            found here: https://github.com/NightCatSama/vue-slider-component/issues/462#issue-634463578 */
            let min = this.filter.columns[0].minimum;
            return min === '-Infinity' ? false : parseFloat(min.toFixed(MAX_DECIMAL_PRECISION));
        },
        valueMaximum() {
            /* Currently vue-slider-component only supports limited precision. The backend is using
            BigDecimals, so it's possible to get a number with an very large precision. A feature
            request was opened with vue-slider-component to support more precision and it can be
            found here: https://github.com/NightCatSama/vue-slider-component/issues/462#issue-634463578 */
            let max = this.filter.columns[0].maximum;
            return max === 'Infinity' ? false : parseFloat(max.toFixed(MAX_DECIMAL_PRECISION));
        },
        isRangeSlider() {
            return this.valueMinimum !== false && this.valueMaximum !== false;
        },
        value() {
            if (!this.isRangeSlider) {
                return {
                    [DATA_TYPE]: this.valueMinimum === false
                        ? this.valueMaximum
                        : this.valueMinimum
                };
            }
            return [this.valueMinimum, this.valueMaximum];
        }
    },
    mounted() {
        this.updateCallback();
    },
    methods: {
        getValue() {
            return this.viewValue;
        },
        onChange(value) {
            let update = {};
            if (this.isRangeSlider) {
                update[UPDATE_KEY_MIN] = value.value[0];
                update[UPDATE_KEY_MAX] = value.value[1];
            } else {
                let key =  this.valueMinimum === false ? [UPDATE_KEY_MAX] : [UPDATE_KEY_MIN];
                update[key] = value.value;
            }
            this.$emit('updateWidget', {
                nodeId: this.nodeId,
                update,
                callback: this.updateCallback
            });
        },
        /**
         * Do not call directly except in mounted. Must be called after the asynchronous data
         * for this widget has been updated in the store.
         *
         * @returns {undefined}
         */
        updateCallback() {
            this.$store.dispatch('pagebuilder/interactivity/updateFilter', {
                id: `filter-${this.nodeConfig.viewRepresentation.tableId}`,
                data: this.filter
            });
        },
        validate() {
            return { isValid: typeof this.getValue() !== 'undefined' };
        }
    }
};
</script>

<template>
  <SliderWidget
    v-bind="$props"
    :value-pair="value"
    @updateWidget="onChange"
  />
</template>
