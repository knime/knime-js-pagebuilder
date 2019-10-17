<script>
import VueSlider from 'vue-slider-component';

/**
 * At the html component level (1st level), functionality will be limited to 
 * validating settings on a low level to allow proper browser functionality.
 */
export default {
    components: {
        VueSlider
    },
    props: {
        value: {
            default: () => (.5),
            type: Number,
            required: true
        },
        maximum: {
            default: () => (1),
            type: Number,
            required: true
        },
        minimum: {
            default: () => (0),
            type: Number,
            required: true
        },
        isValid: {
            default: () => (false),
            type: Boolean,
            required: true
        },
        direction: {
            default: () => ('ltr'),
            type: String
        },
        stepSize: {
            default: () => (.1),
            type: Number
        },
        height: {
            default: () => (20),
            type: Number
        },
        tooltips: {
            default: () => ('always'),
            type: String
        },
        tooltipFormat: {},
        marks: {},
        connect: {
            default: () => ('both'),
            type: String
        }
    },
    methods: {
        getValue() {
            return this.$refs.slider.getValue();
        },
        onValueChange(e) {
            this.$emit('updateValue', {
                val: this.getValue(),
                originalEvent: e,
                isValid: this.validate()
            });
        },
        validate() {
            if (typeof this.getValue() === 'undefined') {
                return false;
            }
            if (this.getValue() < this.minimum || this.getValue() > this.maximum) {
                return false;
            }
            if (this.minimum >= this.maximum || this.maximum <= this.minimum) {
                return false;
            }
            return true;
        }
    },
    mounted() {
        this.$refs.slider.setValue(this.value)
        this.onValueChange({});
    }
};
</script>

<template>
    <div class="scoped-parent">
        <VueSlider
            ref="slider"
            :min="minimum"
            :max="maximum"
            :direction="direction"
            :interval="stepSize"
            :marks="marks"
            :height="height"
            :tooltip="tooltips"
            :tooltip-formatter="tooltipFormat"
            :class="[connect]"
            v-on:change="onValueChange"
        />
    </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css/variables";

  .vue-slider {
    box-sizing: unset !important;
  }
  .vue-slider-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  /* rail style */
  .vue-slider-rail {
    background-color: var(--theme-color-porcelain);
    border-radius: 0px;
  }
  /* invalid state */
  .slider-invalid .vue-slider-rail {
    background-color: red;
  }
  .vue-slider-rtl .vue-slider-rail,
  .vue-slider-ltr .vue-slider-rail {
    height: 3px !important
  }
  /* process style */
  .vue-slider-process {
    background-color: var(--theme-color-yellow);
    border-radius: 0px;
  }
  /* invalid state */
  .knime-invalid-widget .vue-slider-process {
    background-color: red;
  }
  .vue-slider-ttb .vue-slider-process,
  .vue-slider-btt .vue-slider-process {
    width: 7px !important;
    left: -1.5px !important;
  }
  .vue-slider-rtl .vue-slider-process,
  .vue-slider-ltr .vue-slider-process {
    height: 7px !important;
    top: -2px !important;
  }
  .none .vue-slider-process {
    display: none !important;
  }
  .both.vue-slider-rtl .vue-slider-process,
  .both.vue-slider-ltr .vue-slider-process {
    width: 100% !important;
  }
  .both.vue-slider-ttb .vue-slider-process,
  .both.vue-slider-btt .vue-slider-process {
    height: 100% !important;
  }
  /* mark style */
  .vue-slider-mark {
    z-index: 4;
  }
  .vue-slider-mark:first-child .vue-slider-mark-step,
  .vue-slider-mark:last-child .vue-slider-mark-step {
    display: none;
  }
  .vue-slider-mark-step {
    background-color: var(--theme-color-silver-sand);
  }
  .vue-slider-ttb .vue-slider-mark-step,
  .vue-slider-btt .vue-slider-mark-step {
    width: 10px !important;
    height: 1px !important;
    left: 10px !important;
  }
  .vue-slider-ltr .vue-slider-mark-step,
  .vue-slider-rtl .vue-slider-mark-step {
    width: 1px !important;
    height: 10px !important;
    top: 10px !important;
  }
  .vue-slider-mark-label {
    font-size: 14px;
    white-space: nowrap;
  }
  .vue-slider-ttb .vue-slider-mark-label,
  .vue-slider-btt .vue-slider-mark-label {
    margin-left: 20px !important;
  }
  .vue-slider-ltr .vue-slider-mark-label,
  .vue-slider-rtl .vue-slider-mark-label {
    margin-top: 20px !important;
  }
  /* dot style */
  .vue-slider-dot {
    height: 29px !important;
    width: 19px !important;
    background-color: var(--theme-color-porcelain);
  }
  .vue-slider-ttb .vue-slider-dot,
  .vue-slider-btt .vue-slider-dot {
    left: -8px !important;
  }
  .vue-slider-ttb .vue-slider-dot {
    transform: rotate(-90deg) translate(14px, 0px) !important;
  }
  .vue-slider-btt .vue-slider-dot {
    transform: rotate(-90deg) translate(-14px, 0px) !important;
  }
  .vue-slider-dot-focus {
    background-color: var(--theme-color-masala);
  }
  .vue-slider-dot-handle {
    cursor: pointer;
    width: 5px;
    height: 11px;
    border-color: var(--theme-color-masala);
    border-style: solid;
    border-top: 0px;
    border-bottom: 0px;
    border-left-width: 1px;
    border-right-width: 1px;
    box-sizing: border-box;
    position: relative;
    left: 7px !important;
    top: 9px !important;
  }
  .vue-slider-dot-handle-focus {
    border-color: var(--theme-color-white);
  }
  .vue-slider-dot-handle-disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }
  .vue-slider-dot-tooltip-left,
  .vue-slider-dot-tooltip-left::after {
    box-sizing: unset !important;
    transform: rotate(90deg) translate(-54px, -1.5px)
  }
  .vue-slider-dot-tooltip-left *,
  .vue-slider-dot-tooltip-left::after * {
    box-sizing: unset !important;
  }
  .vue-slider-dot-tooltip-inner {
    font-size: 13px;
    line-height: 18px;
    white-space: nowrap;
    padding: 5px;
    min-width: 20px;
    text-align: center;
    color: #fff;
    border-color: var(--theme-color-masala);
    background-color: var(--theme-color-masala);
    box-sizing: content-box !important;
  }
  .vue-slider-dot-tooltip-inner::after {
    content: "";
    position: absolute;
  }
  .vue-slider-dot-tooltip-inner-top::after {
    top: 100%;
    left: 50%;
    transform: translate(-50%, 0);
    height: 0;
    width: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 5px;
    border-top-color: inherit;
  }
  .vue-slider-dot-tooltip-inner-bottom::after {
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, 0);
    height: 0;
    width: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 5px;
    border-bottom-color: inherit;
  }
  .vue-slider-dot-tooltip-inner-left::after {
    left: 100%;
    top: 50%;
    transform: translate(0, -50%);
    height: 0;
    width: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 5px;
    border-left-color: inherit;
  }
  .vue-slider-dot-tooltip-inner-right::after {
    right: 100%;
    top: 50%;
    transform: translate(0, -50%);
    height: 0;
    width: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 5px;
    border-right-color: inherit;
  }
  .vue-slider-dot-tooltip-wrapper {
    opacity: 0;
    transition: all 0.3s;
  }
  .vue-slider-dot-tooltip-wrapper-show {
    opacity: 1;
  }

</style>
