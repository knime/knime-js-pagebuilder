<script>
import Slider from '../baseElements/input/Slider.vue';
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';
import formatTooltip from '../../../util/tooltipFormatter';
import { createTicks } from '../../../util/widgetUtil/slider/tickUtil';

const DATA_TYPE = 'double';
const MINIMUM_SLIDER_STEP = .0000001;
const MAX_DECIMAL_PRECISION = 7;
const VERTICAL_SLIDER_HEIGHT = 533;

/**
 * This is the implementation of the Slider Input Widget and the
 * Interactive Range Slider Filter Definition. This
 * component uses the Slider Vue component (KNIME implementation) which
 * in turn relies on the vue-slider-component (npm) library. The primary
 * goal of the SliderWidget component is to parse the various settings from
 * the nodeConfig provided by the parent Widget component and prepare them
 * correctly for the child Slider (mainly the vue-slider-component).
 *
 * This widget has two rendering options and two functionality levels. The
 * rendering options are: vertical and horizontal. The functionality levels
 * are: Slider Input Widget and the Interactive Range Slider Filter
 * Definition.
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
                return nodeId !== '';
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
            type: [Object, Array]
        },
        /**
         * If the process (colored bar) should be flipped to connect the draggable handle
         * from one origin on the slider to the other.
         */
        invertProcess: {
            type: Boolean,
            default: false
        },
        errorMessage: {
            default: null,
            type: String
        }
    },
    emits: ['updateWidget'],
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        sliderSettings() {
            return this.viewRep.sliderSettings;
        },
        label() {
            return this.viewRep.label;
        },
        min() {
            /* Currently vue-slider-component only supports limited precision. The backend is using
            BigDecimals, so it's possible to get a number with an very large precision. A feature
            request was opened with vue-slider-component to support more precision and it can be
            found here: https://github.com/NightCatSama/vue-slider-component/issues/462#issue-634463578 */
            return parseFloat(this.sliderSettings.range.min[0].toFixed(MAX_DECIMAL_PRECISION));
        },
        max() {
            /* Currently vue-slider-component only supports limited precision. The backend is using
            BigDecimals, so it's possible to get a number with an very large precision. A feature
            request was opened with vue-slider-component to support more precision and it can be
            found here: https://github.com/NightCatSama/vue-slider-component/issues/462#issue-634463578 */
            return parseFloat(this.sliderSettings.range.max[0].toFixed(MAX_DECIMAL_PRECISION));
        },
        value() {
            return Array.isArray(this.valuePair) ? this.valuePair : this.valuePair[DATA_TYPE];
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
         * Process is the bar which is shown in yellow in KNIME theme. Inverted it starts with 100% and ends with the
         * dot (handle).
         * @returns {(Function|Boolean)} true or a process function
         */
        process() {
            // invert only works with single dots
            if (!Array.isArray(this.value) && this.invertProcess) {
                return dotsPos => [[dotsPos[0], 100]];
            }
            return true;
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
        /**
         * Tooltips are configured via an array of options in the sliderSettings.
         * If the property "tooltips" is undefined, then the tooltips are disabled
         * by default. Tooltips can be disabled for a single handle by setting the
         * value in the array of options to false. If the option is truthy, then we
         * set the tooltip option to 'always'.
         *
         * @returns {Array} an array of objects containing the tooltip settings for
         *          each handle.
         */
        tooltips() {
            let createTooltip = setting => ({ tooltip: setting });
            if (this.sliderSettings.tooltips) {
                return this.sliderSettings.tooltips.map(options => createTooltip(options ? 'always' : 'none'));
            }
            return [createTooltip('none')];
        },
        /**
         * Tooltip formatting is done via function. For each handle present in the
         * slider, we configure the formatting function for its tooltip. We provide
         * a default formatting function for disabled or "true" (unconfigured) tool-
         * tip options.
         *
         * @returns {Array} an array of functions for formatting the tooltips.
         */
        tooltipFormat() {
            const { tooltips } = this.sliderSettings;
            const baseFormatter = val => `${val}`;
            if (tooltips) {
                return tooltips.map(options => {
                    if (typeof options === 'object') {
                        return (val) => formatTooltip(val, options);
                    }
                    return baseFormatter;
                });
            }
            return [baseFormatter];
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
         * If sliderSettings.connect is {undefined}, this means the slider doesn't
         * have connect settings and we will just return null;
         *
         * @returns {String} config for connecting the colored part of the slider
         *      to the slider handle.
         */
        connect() {
            const { connect } = this.sliderSettings;
            if (!connect) {
                return null;
            }
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
            let isValid = true;
            let errorMessage;
            let value = this.$refs.form.getValue();
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = validateEvent.isValid && Boolean(value || value === 0);
                errorMessage = validateEvent.errorMessage || 'Current input is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <div>
    <Label
      #default="{ labelForId }"
      :text="label"
      :class="[`slider-${sliderSettings.orientation}-label`,
               { 'tooltip-label': tooltips }]"
      large
    >
      <Slider
        :id="labelForId"
        ref="form"
        :minimum="min"
        :maximum="max"
        :model-value="value"
        :process="process"
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
        @update:model-value="onChange"
      />
      <ErrorMessage
        :error="errorMessage"
        :class="[`slider-${sliderSettings.orientation}-error`,
                 {'tooltip-error': tooltips}]"
      />
    </Label>
  </div>
</template>

<style lang="postcss" scoped>
.slider-horizontal {
  padding: 10px 15px 25px;
}

.slider-horizontal.tooltip-slider {
  padding-top: 45px;
  padding-right: 25px;
  padding-left: 25px;
}

.slider-vertical {
  padding: 10px 20px 10px 10px;
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
