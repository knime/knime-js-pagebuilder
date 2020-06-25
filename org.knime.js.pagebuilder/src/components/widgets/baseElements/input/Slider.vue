<script>
import VueSlider from 'vue-slider-component';

const DEFAULT_SLIDER_VALUE = .5;
const DEFAULT_STEP_SIZE = .1;
const DEFAULT_HEIGHT = 20;

/**
 * This KNIME slider input element implementation relies on
 * the vue-slider-component (npm) library.
 */
export default {
    components: {
        VueSlider
    },
    props: {
        value: {
            default: DEFAULT_SLIDER_VALUE,
            type: [Number, Array]
        },
        maximum: {
            default: 1,
            type: Number
        },
        minimum: {
            default: 0,
            type: Number
        },
        isValid: {
            default: true,
            type: Boolean
        },
        direction: {
            default: 'ltr',
            type: String
        },
        stepSize: {
            default: DEFAULT_STEP_SIZE,
            type: Number
        },
        height: {
            default: DEFAULT_HEIGHT,
            type: Number
        },
        tooltips: {
            default: () => [{ tooltip: 'always' }],
            type: Array
        },
        tooltipFormat: {
            default: () => [x => `${x}`],
            type: Array
        },
        marks: {
            default: () => ({}),
            type: Object
        },
        connect: {
            default: 'both',
            type: String
        },
        dragOnClick: {
            default: false,
            type: Boolean
        },
        contained: {
            default: false,
            type: Boolean
        }
    },
    methods: {
        getValue() {
            return this.$refs.slider.getValue();
        },
        onInput(e) {
            this.$emit('input', this.getValue());
        },
        validate() {
            let value = this.getValue();
            let errorMessage;
            let isValid = true;
            if (this.minimum >= this.maximum || this.maximum <= this.minimum) {
                errorMessage = 'Specified range is not valid.';
                isValid = false;
            }
            if (typeof value !== 'number') {
                errorMessage = 'Value is not a number.';
                isValid = false;
            }
            if (value < this.minimum || value > this.maximum) {
                errorMessage = 'Value is not inside the valid range.';
                isValid = false;
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <div
    tabindex="0"
    class="slider-wrapper"
    @focus="$refs.slider.focus()"
    @blur="$refs.slider.blur()"
  >
    <VueSlider
      ref="slider"
      :width="direction.includes('tt') ? 1 : 'auto'"
      :value="value"
      :min="minimum"
      :max="maximum"
      :silent="true"
      :use-keyboard="true"
      :direction="direction"
      :interval="stepSize"
      :marks="marks"
      :height="direction.includes('tt') ? height : 1"
      :dot-options="tooltips"
      :tooltip-formatter="tooltipFormat"
      :class="[connect]"
      :drag-on-click="dragOnClick"
      :contained="contained"
      :lazy="true"
      :enable-cross="false"
      x-ms-format-detection="none"
      @change="onInput"
    />
  </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css/variables";

.slider-wrapper:focus {
  outline: none;
}

.vue-slider {
  cursor: pointer;
  box-sizing: unset !important;
}

.vue-slider-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* rail style */
.vue-slider-rail {
  cursor: pointer;
  background-color: var(--theme-color-stone-gray);
  border-radius: 0;
}

/* invalid state */
.slider-invalid .vue-slider-rail {
  background-color: var(--theme-color-error);
}

.vue-slider-rtl .vue-slider-rail,
.vue-slider-ltr .vue-slider-rail {
  height: 1px !important;
}

/* process style */
.vue-slider-process {
  cursor: pointer;
  background-color: var(--theme-slider-background-color);
  border-radius: var(--theme-slider-bar-radius, 3.5px);
}

/* invalid state */
.knime-invalid-widget .vue-slider-process {
  background-color: var(--theme-color-error);
}

.vue-slider-ttb .vue-slider-process,
.vue-slider-btt .vue-slider-process {
  width: 7px !important;
  left: -3px !important;
}

.vue-slider-rtl .vue-slider-process,
.vue-slider-ltr .vue-slider-process {
  height: 7px !important;
  top: -3px !important;
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
  cursor: pointer;
  z-index: 1;
}

.vue-slider-mark-step {
  cursor: pointer;
  background-color: var(--theme-color-silver-sand);
}

.vue-slider-ttb .vue-slider-mark-step,
.vue-slider-btt .vue-slider-mark-step {
  width: 10px !important;
  height: 1px !important;
  left: 11px !important;
}

.vue-slider-ltr .vue-slider-mark-step,
.vue-slider-rtl .vue-slider-mark-step {
  width: 1px !important;
  height: 10px !important;
  top: 11px !important;
}

.vue-slider-mark-label {
  cursor: pointer;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  color: var(--theme-color-masala);
}

.vue-slider-ttb .vue-slider-mark-label,
.vue-slider-btt .vue-slider-mark-label {
  margin-left: 24px !important;
}

.vue-slider-ltr .vue-slider-mark-label,
.vue-slider-rtl .vue-slider-mark-label {
  margin-top: 20px !important;
}

/* dot style */
.vue-slider-dot {
  cursor: pointer;
  height: 29px !important;
  width: 13px !important;
  border: 1px solid var(--theme-slider-border-color);
  border-radius: var(--theme-slider-border-radius, 9.5px);
  background: var(--theme-slider-foreground-color);
  z-index: 1;
}

.vue-slider-dot:hover {
  border-color: var(--theme-slider-border-color-hover);
  background-color: var(--theme-slider-foreground-color-hover); /* transparency not working here */
}

.vue-slider-ttb .vue-slider-dot,
.vue-slider-btt .vue-slider-dot {
  left: 0 !important;
  height: 13px !important;
  width: 29px !important;
}

.vue-slider-dot-focus {
  background-color: var(--theme-slider-foreground-color-focus) !important;
  border-color: var(--theme-slider-border-color-focus) !important;
}

.vue-slider-dot-handle {
  display: none;
}

.vue-slider-dot-tooltip-inner {
  cursor: pointer;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  padding: 5px;
  min-width: 20px;
  text-align: center;
  color: var(--theme-tooltip-foreground-color);
  border-color: var(--theme-tooltip-background-color);
  background-color: var(--theme-tooltip-background-color);
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
