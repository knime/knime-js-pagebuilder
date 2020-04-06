<script>
import Slider from '../baseElements/input/Slider';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import { format as sliderLabelFormatter } from '../../../util/numStrFormatter';
import { createTicks } from '../../../util/widgetUtil/slider/tickUtil';

const DATA_TYPE = 'double';
const MINIMUM_SLIDER_STEP = .000001;
const VERTICAL_SLIDER_HEIGHT = 533;

/**
 * This is the implementation of the Slider Input Widget and the
 * Interactive Range Slider Filter Definition (TODO: AP-12916). This
 * component uses the Slider Vue component (KNIME implementation) which
 * in turn relies on the vue-slider-component (npm) library. The primary
 * goal of the SliderWidget component is to parse the various settings from
 * the nodeConfig provided by the parent Widget component and prepare them
 * correctly for the child Slider (mainly the vue-slider-component).
 *
 * This widget has two rendering options and two functionality levels. The
 * rendering options are: vertical and horizontal. The functionality levels
 * are: Slider Input Widget and the Interactive Range Slider Filter
 * Definition (TODO: AP-12916).
 */
export default {
    components: {
        Label,
        Slider,
        ErrorMessage
    },
    props: {
        /**
         * The nodeConfig provided to the SliderWidget component should have the
         * necessary fields as seen in the validator below:
         *
         * ex:  nodeConfig = {
         *          nodeInfo: {...},
         *          viewRepresentation: {
         *              sliderSettings: {...},
         *              ...
         *          },
         *          ...
         *      };
         */
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo && obj.viewRepresentation.sliderSettings;
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
                [DATA_TYPE]: 0
            }),
            type: Object
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        sliderSettings() {
            return this.viewRep.sliderSettings;
        },
        /**
         * TODO: AP-12916 Frontend: rewrite interactive range slider filter widget
         *
         * Returns true if the slider component represents an Interactive Range
         * Slider Filter Widget Node and, therefore, should publish interactivity events.
         *
         * @returns {undefined}
         */
        isInteractiveRangeSlider() {
            return this.viewRep['@class'].includes('range');
        },
        label() {
            return this.viewRep.label;
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current slider value is invalid';
        },
        min() {
            if (this.isInteractiveRangeSlider && this.viewRep.useCustomMin) {
                return this.viewRep.customMin;
            }
            return this.sliderSettings.range.min[0];
        },
        max() {
            if (this.isInteractiveRangeSlider && this.viewRep.useCustomMax) {
                return this.viewRep.customMax;
            }
            return this.sliderSettings.range.max[0];
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        /**
         * Maps the KNIME configuration settings to the appropriate direction
         * configuration string for the vue-slider-widget component. In KNIME
         * there are two settings: ...sliderSettings.orientation (possible
         * values: 'horizontal' or 'vertical') and ...sliderSettings.direction
         * (possible values: 'ltr' or 'rtl'). The vue-slider-component accepts
         * four possible values: 'ltr' (left-to-right), 'rtl' (right-to-left),
         * 'ttb' (top-to-bottom), 'btt' (bottom-to-top). This computed value
         * maps the two different schemas to match the behavior found in the
         * old webportal. See the mappings here:
         *
         *  orientation = 'horizontal' && direction = 'ltr' => 'ltr'
         *  orientation = 'horizontal' && direction = 'rtl' => 'rtl'
         *  orientation = 'vertical' && direction = 'rtl' => 'ttb'
         *  orientation = 'vertical' && direction = 'rtl' => 'btt'
         *
         * @returns {String} the slider direction config in the correct format
         * for vue-slider-component (npm).
         */
        direction() {
            const vertConfig = this.sliderSettings.direction === 'ltr' ? 'ttb' : 'btt';
            return this.sliderSettings.orientation === 'horizontal'
                ? this.sliderSettings.direction
                : vertConfig;
        },
        stepSize() {
            return this.sliderSettings.step || MINIMUM_SLIDER_STEP;
        },
        /**
         * Because we computed the direction above, we can check for the 'b' in
         * 'ttb' or 'btt' to determine if the height of the slider needs to be
         * explicitly set (which it does for vertical sliders).
         * @returns {(Number|null)} slider height (in px) or null.
         */
        height() {
            if (this.direction.includes('b')) {
                return VERTICAL_SLIDER_HEIGHT;
            }
            return null;
        },
        tooltips() {
            return this.sliderSettings.tooltips ? 'always' : 'none';
        },
        /**
         * This method provided the function to be passed to the vue-slider-component
         * (npm) which it uses to format the tooltips of the slider. The function should
         * accept a value as a parameter and return the String (label) to be shown on
         * the slider. The sliderLabelFormatter utility function consumes a tooltip
         * settings from the KNIME AP (seen below as tooltips[0]) and returns a function
         * that correctly formats labels based on all of the existing configuration
         * options from KNIME AP.
         *
         * @returns {Function} the formatting function to be used on the tooltips.
         */
        tooltipFormat() {
            const { tooltips } = this.sliderSettings;
            if (tooltips && typeof tooltips[0] === 'object') {
                return (val) => sliderLabelFormatter(val, tooltips[0]);
            }
            return (val) => val.toString();
        },
        /**
         * This config option comes from KNIME as an array of length 2 containing
         * Boolean values. If both values are true, then we will connect the whole
         * slider with the larger colored bar with the class 'both' on the vue-
         * slider-component (npm). If both settings from KNIME are false, then we
         * will only show the "rail" of the slider with the class 'none'. Otherwise,
         * we will map the true and false values and their positions to the existing
         * behavior in the KNIME AP and return either 'top' or 'bottom' to be used
         * on the vue-slider-component.
         *
         * @returns {String} config for connecting the colored part of the slider
         *      to the slider handle.
         */
        connect() {
            const { connect } = this.sliderSettings;
            if (connect[0]) {
                return connect[1] ? 'both' : 'top';
            }
            return connect[1] ? 'bottom' : 'none';
        },
        /**
         * This method parses the settings from the existing KNIME Slider
         * Widget API into options the child Slider Vue component can then
         * handle.
         *
         * Important to have this as a computed property, as setting
         * this.marks directly on the component instance during mounted()
         * results in missing labels on the slider. The implementation is
         * also important (Object.freeze()). This method (createTicks)
         * can, in some cases, create an object with many 1,000's of
         * keys representing the ticks on the slider. The Object it-
         * self is needed to pass to the vue-slider-component, and
         * it must be "computed" based on settings this SliderWidget
         * receives in the props, but we want to *avoid* Vue from
         * attaching getters and setters to the Object (as would)
         * happen if this.marks was a regular computed property. This is
         * all done to improve performance and it has a large, positive
         * impact.
         *
         * @returns {Object} marks for configuring the labels of the
         *    child slider component.
         */
        marks() {
            return Object.freeze(createTicks({
                config: this.sliderSettings.pips,
                min: this.min,
                max: this.max,
                direction: this.direction,
                stepSize: this.stepSize,
                hasSteps: this.sliderSettings.step
            }));
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
            if (!this.viewRep.required) {
                return true;
            }
            let value = this.$refs.form.getValue();
            return Boolean(this.$refs.form.validate() && (value || value === 0));
        }
    }
};
</script>

<template>
  <div>
    <Label
      :text="label"
      :class="[`slider-${sliderSettings.orientation}-label`,
               { 'tooltip-label': tooltips }]"
    />
    <Slider
      ref="form"
      :minimum="min"
      :maximum="max"
      :value="value"
      :is-valid="isValid"
      :direction="direction"
      :step-size="stepSize"
      :height="height"
      :tooltips="tooltips"
      :tooltip-format="tooltipFormat"
      :marks="marks"
      :connect="connect"
      :class="[`slider-${sliderSettings.orientation}`,
               {'tooltip-slider': tooltips }]"
      @input="onChange"
    />
    <ErrorMessage
      :error="errorMessage"
      :class="[`slider-${sliderSettings.orientation}-error`,
               {'tooltip-error': tooltips}]"
    />
  </div>
</template>

<style lang="postcss" scoped>
.slider-horizontal {
  padding-top: 10px;
  padding-right: 15px;
  padding-bottom: 25px;
  padding-left: 15px;
}

.slider-horizontal.tooltip-slider {
  padding-top: 45px;
  padding-right: 25px;
  padding-left: 25px;
}

.slider-vertical {
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 10px;
}

.slider-vertical.tooltip-slider {
  padding-top: 15px;
  padding-left: 50px;
}

.slider-horizontal-label,
.slider-horizontal-error {
  padding-left: 15px;
}

.slider-horizontal-label.tooltip-label,
.slider-horizontal-error.tooltip-error {
  padding-left: 25px;
}
</style>
