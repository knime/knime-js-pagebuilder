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
            type: Number
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
            default: 'always',
            type: String
        },
        tooltipFormat: {
            default: x => x,
            type: Function
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
            if (this.minimum >= this.maximum || this.maximum <= this.minimum) {
                return false;
            }
            if (typeof value !== 'number') {
                return false;
            }
            if (value < this.minimum || value > this.maximum) {
                return false;
            }
            return true;
        }
    }
};
</script>

<template>
  <div>
    <VueSlider
      ref="slider"
      :width="direction.includes('tt') ? 1 : 'auto'"
      :value="value"
      :min="minimum"
      :max="maximum"
      :silent="true"
      :direction="direction"
      :interval="stepSize"
      :marks="marks"
      :height="direction.includes('tt') ? height : 1"
      :tooltip="tooltips"
      :tooltip-formatter="tooltipFormat"
      :class="[connect]"
      :drag-on-click="dragOnClick"
      :contained="contained"
      :lazy="true"
      @change="onInput"
    />
  </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css/variables";

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
  background-color: var(--theme-color-yellow);
  border-radius: 3.5px;
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
  border: 1px solid var(--theme-color-stone-gray);
  border-radius: 9.5px;
  background: var(--theme-color-white);
  z-index: 1;
}

.vue-slider-dot:hover {
  background-color: var(--theme-color-porcelain);
}

.vue-slider-ttb .vue-slider-dot,
.vue-slider-btt .vue-slider-dot {
  left: 0 !important;
  height: 13px !important;
  width: 29px !important;
}

.vue-slider-dot-focus {
  background-color: var(--theme-color-masala) !important;
  border-color: var(--theme-color-masala) !important;
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
  color: var(--theme-color-white);
  border-color: var(--theme-color-masala);
  background-color: var(--theme-color-masala);
  box-sizing: content-box !important;
  backface-visibility: hidden; /* prevent chrome blurry text */
  transform: perspective(1px) translateZ(0); /* prevent chrome blurry text */
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
