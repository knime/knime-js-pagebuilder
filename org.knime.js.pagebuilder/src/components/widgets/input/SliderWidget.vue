<script>
import Slider from '../baseElements/input/Slider';
import Label from '../baseElements/text/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { format } from '../../../util/numStrFormatter';
import { getProp } from '../../../util/nestedProperty';
import { createTicks } from '../../../util/widgetUtil/slider/tickUtil';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.double';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.double';
const MINIMUM_SLIDER_STEP = .000001;
const VERTICAL_SLIDER_HEIGHT = 533;
const DEBOUNCER_TIMEOUT = 250;

/**
 * At the SliderWidget component level (2nd level), the component will know more about its
 * context, such as nodeId, full config, etc. It will also be able to
 * so second level validation (after the base component validation).
 *
 * It will be responsible for knowing its incomming nodeConfig object,
 * as well as the keys for its corresponding properties. When the 2nd level
 * receives an update event from the 1st (lower) level child component, it
 * will validate and then emit an updateWidget event to the parent Widget
 * which contains the widget specific information needed to update the global
 * state on the store.
 *
 * 2nd level (this) components will not know or care about the global store,
 * so API changes will no affect them.
 *
 */
export default {
    components: {
        Label,
        Slider,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            default: () => ({}),
            type: Object
        },
        nodeId: {
            default: () => null,
            type: String
        },
        isValid: {
            default: () => false,
            type: Boolean
        }
    },
    data() {
        return {
            viewRep: this.nodeConfig.viewRepresentation,
            sliderSettings: this.nodeConfig.viewRepresentation.sliderSettings
        };
    },
    updateDebouncer: null,
    computed: {
        label() {
            return this.viewRep.label;
        },
        errorMessage() {
            if (this.isValid) {
                return '';
            } else if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            } else if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            } else {
                return 'Current slider value is invalid';
            }
        },
        min() {
            if (this.viewRep.useCustomMin) { return this.viewRep.customMin; }
            return this.sliderSettings.range.min[0];
        },
        max() {
            if (this.viewRep.useCustomMax) { return this.viewRep.customMax; }
            return this.sliderSettings.range.max[0];
        },
        val() {
            return getProp(this.nodeConfig, CURRENT_VALUE_KEY) ||
                getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        },
        direction() {
            const vertConfig = this.sliderSettings.direction === 'ltr' ? 'ttb' : 'btt';
            return this.sliderSettings.orientation === 'horizontal'
                ? this.sliderSettings.direction
                : vertConfig;
        },
        stepSize() {
            return this.sliderSettings.step || MINIMUM_SLIDER_STEP;
        },
        height() {
            if (this.direction.includes('b')) {
                return VERTICAL_SLIDER_HEIGHT;
            }
            return null;
        },
        tooltips() {
            return this.sliderSettings.tooltips ? 'always' : 'none';
        },
        tooltipFormat() {
            const tt = this.sliderSettings.tooltips;
            if (tt && typeof tt[0] === 'object') {
                return (val) => format(val, tt[0]);
            }
            return (val) => val;
        },
        marks() {
            
            return createTicks({
                config: this.sliderSettings.pips,
                min: this.min,
                max: this.max,
                direction: this.direction,
                stepSize: this.stepSize
            });
        },
        connect() {
            const conSet = this.sliderSettings.connect;
            if (conSet[0]) {
                return conSet[1] ? 'both' : 'top';
            } else {
                return conSet[1] ? 'bottom' : 'none';
            }
        },
        sliderClass() {
            return [
                'knime-slider',
                `knime-slider-${this.sliderSettings.orientation}`,
                this.tooltips === 'none' ? '' : 'tooltip-slider'
            ];
        },
        labelClass() {
            return [
                'knime-label',
                `knime-slider-${this.sliderSettings.orientation}-label`,
                this.tooltips === 'none' ? '' : 'tooltip-label'
            ];
        },
        errorClass() {
            return [
                'knime-error',
                `knime-slider-${this.sliderSettings.orientation}-error`,
                this.tooltips === 'none' ? '' : 'tooltip-error'
            ];
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newValue = parseFloat(e.val);
            const newWebNodeConfig = {
                type: 'Slider',
                nodeId: this.nodeId,
                originalEvent: e.originalEvent,
                isValid: e.isValid && this.validate(newValue),
                update: {
                    [CURRENT_VALUE_KEY]: newValue
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
             * currently fake validation to test styling
             */
            return true;
        }
    }
};
</script>

<template>
  <div>
    <Label
      :text="label"
      :class="labelClass"
    />
    <Slider
      :minimum="min"
      :maximum="max"
      :value="val"
      :is-valid="isValid"
      :direction="direction"
      :step-size="stepSize"
      :height="height"
      :tooltips="tooltips"
      :tooltip-format="tooltipFormat"
      :marks="marks"
      :connect="connect"
      :class="sliderClass"
      @updateValue="onChange"
    />
    <ErrorMessage
      :error="errorMessage"
      :class="errorClass"
    />
  </div>
</template>

<style lang="postcss" scoped>
/* Dynamically style container at some point */
.knime-slider-horizontal {
  padding-top: 10px;
  padding-right: 15px;
  padding-bottom: 25px;
  padding-left: 15px;
}

.knime-slider-horizontal.tooltip-slider {
  padding-top: 45px;
  padding-right: 25px;
  padding-left: 25px;
}

.knime-slider-vertical {
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 10px;
}

.knime-slider-vertical.tooltip-slider {
  padding-top: 15px;
  padding-left: 50px;
}

.knime-slider-horizontal-label,
.knime-slider-horizontal-error {
  padding-left: 15px;
}

.knime-slider-horizontal-label.tooltip-label,
.knime-slider-horizontal-error.tooltip-error {
  padding-left: 25px;
}
</style>
