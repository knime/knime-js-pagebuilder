<script>
import ArrowIcon from 'webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';

const INTERVAL_TIMEOUT_DELAY = 200;
const MOUSE_DOWN_CHANGE_INTERVAL = 50;
const DEFAULT_STEP_SIZE_DOUBLE = 0.1;
const DEFAULT_STEP_SIZE_INTEGER = 1;
const BASE_10_CONSTANT = 10;

/**
 * Default number (spinner) input field for widgets. It can either be a double input widget
 * or an integer input widget, based on the type received as a prop. It implements custom
 * user controls to augment the existing native HTML <input> component funcitonality and
 * provide consistent KNIME styling.
 */
export default {
    components: {
        ArrowIcon
    },
    props: {
        value: {
            default: () => 0,
            type: Number
        },
        min: {
            default: () => 0,
            type: Number
        },
        max: {
            default: () => 1,
            type: Number
        },
        isValid: {
            default: () => false,
            type: Boolean
        },
        /**
         * This prop sets the significant digit of the
         * spinner input. The value 'double' will allow
         * decimals in the spinner, whereas the value
         * 'integer' will only allow whole numbers in
         * the spinner. These are the *ONLY* two values
         * allowed. If there is an invalid value provided
         * this input will default to 'double' (decimals).
         *
         * Possible values: 'double' | 'integer'
         */
        type: {
            default: 'double',
            type: String
        },
        description: {
            default: 'KNIME number input',
            type: String
        }
    },
    /**
     * @returns {Object} clicked should be false to prevent un-
     *      intended 'mouseup' or 'mouseleave' events.
     */
    data: () => ({
        clicked: false
    }),
    /**
     * The reference to the timeout which is set when
     * a user clicks one of the numeric spinner wheels. This
     * Timeout will trigger the rapid change of the number input
     * value if the mouse is held down on an arrow.
     */
    spinnerArrowTimeout: null,
    /**
     * The reference to the interval which is set when
     * the Timeout expires and the user is still holding the mouse.
     * This interval rapid calls the change value method until the
     * user releases the mouse (emitting a 'mouseup' event) or
     * leaves the element (emitting a 'mouseleave' event).
     */
    spinnerArrowInterval: null,
    computed: {
        /**
         * @returns {Number} either 1 for integer input or 0.1 for double.
         */
        stepSize() {
            if (this.type === 'integer') {
                return DEFAULT_STEP_SIZE_INTEGER;
            }
            return DEFAULT_STEP_SIZE_DOUBLE;
        },
        /**
         * @returns {String[]} the CSS classes for the<input> element.
         */
        inputClass() {
            const classes = ['knime-qf-input', 'knime-spinner'];
            if (this.type === 'integer') {
                classes.push('knime-integer');
            } else {
                classes.push('knime-double');
            }
            if (!this.isValid) {
                classes.push('knime-input-invalid');
            }
            return classes;
        }
    },
    mounted() {
        this.$el.childNodes[0].value = this.value;
        this.onValueChange({});
    },
    methods: {
        getValue() {
            if (this.type === 'integer') {
                return parseInt(this.$el.childNodes[0].value, BASE_10_CONSTANT);
            }
            return parseFloat(this.$el.childNodes[0].value);
        },
        onValueChange(e) {
            const newValue = this.getValue();
            this.$emit('updateValue', {
                value: newValue,
                originalEvent: e,
                isValid: this.validate(newValue)
            });
        },
        validate(value) {
            let newValue = value || this.getValue();
            // type check the value
            if (typeof newValue !== 'number' || isNaN(newValue)) {
                return false;
            }
            // check against the configured maximum and minimum
            if (newValue < this.min || newValue > this.max) {
                return false;
            }
            // finally return the native <input type='number'/> validity
            return this.$el.childNodes[0].validity.valid;
        },
        /**
         * This method is used by the input controls to change the value of the numeric input.
         * The provided value (valDiff) should be signed (+/-) based on which button was pressed
         * (negative for the down arrow, etc.). This method will attempt to parse the value. It also
         * steps based on the current value to the next nearest step, regardless of the number of
         * significant digits in the current value (1.00001 => 1.1). This preserves the existing
         * behavior of KNIME numeric inputs
         *
         * @param  {Number} valDiff - the amount by which to change the current value.
         * @param  {Boolean} publishChange - if the change should trigger an upwards event.
         * @param {Event} event - the original event object which trigger the changeValue call.
         * @returns {undefined}
         */
        changeValue(valDiff, publishChange, event) {
            let parsedVal = this.getValue();
            /** Mimic stepping to nearest step with safe value rounding */
            parsedVal = (parsedVal + valDiff) * BASE_10_CONSTANT;
            parsedVal = Math.round(parsedVal) / BASE_10_CONSTANT;
            if (this.validate(parsedVal)) {
                this.$el.childNodes[0].value = parsedVal;
                if (publishChange) {
                    this.onValueChange(event);
                }
            }
        },
        /**
         * This method is the callback handler for mouse events on the input field controls.
         * It is fired when either the up-arrow or down-arrow is pressed by the user. It manages
         * both mousedown and mouseup events. It clears any exisiting timeouts or intervals whihc
         * may have been set previously and decides how the user would like the value updated
         * (holding the button will rapidly change the value after a short delay; quickly clicking
         * the button will use short increments instead).
         *
         * @param {Event} e - the DOM event object which triggered the handler.
         * @param {String} type - the type of button pressed (either 'increased' or 'decreased').
         * @returns {undefined}
         */
        mouseEvent(e, type) {
            // on any mouse event, clear existing timers and intervals
            clearTimeout(this.spinnerArrowDebouncer);
            clearInterval(this.spinnerArrowTimeout);
            // set the increment size
            let valueDifference = this.stepSize;
            // if the decrease button has been selected, make negative
            if (type === 'decrease') {
                valueDifference *= -1;
            }
            // on 'mousedown' trigger timer to start rapid increments
            if (e.type === 'mousedown') {
                // enable 'mouseup' and 'mouseleave' events by setting clicked to true
                this.clicked = true;
                this.spinnerArrowDebouncer = setTimeout(() => {
                    this.spinnerArrowTimeout = setInterval(() => {
                        // don't trigger publish events for every change
                        this.changeValue(valueDifference, false, e);
                    }, MOUSE_DOWN_CHANGE_INTERVAL);
                }, INTERVAL_TIMEOUT_DELAY);
                return;
            }
            if (this.clicked) {
                // disable additional events from being fired
                this.clicked = false;
                // on 'mouseup' or 'mouseleave' publish change
                this.changeValue(valueDifference, true, e);
            }
        }
    }
};
</script>

<template>
  <!-- knime-qf-input legacy selector -->
  <div class="knime-input-container">
    <input
      type="number"
      role="spinButton"
      :min="min"
      :max="max"
      :step="stepSize"
      :class="inputClass"
      :title="description"
      @input="onValueChange"
    >
    <span
      id="knime-increase"
      @mousedown="(e) => mouseEvent(e, 'increase')"
      @mouseup="(e) => mouseEvent(e, 'increase')"
      @mouseleave="(e) => mouseEvent(e, 'increase')"
    >
      <ArrowIcon />
    </span>
    <span
      id="knime-decrease"
      @mousedown="(e) => mouseEvent(e, 'decrease')"
      @mouseup="(e) => mouseEvent(e, 'decrease')"
      @mouseleave="(e) => mouseEvent(e, 'decrease')"
    >
      <ArrowIcon />
    </span>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.knime-input-container {
  position: relative;
  width: 100%;

  & input.knime-qf-input {
    font-family: 'Roboto', BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
      'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-color-masala);
    letter-spacing: 0.03px;
    line-height: 18px;
    background-color: var(--theme-color-porcelain);
    margin: 0;
    padding: 11px 10px 11px 10px;
    border-radius: 0;
    width: 100%;
    border-left-width: 3px;
    border-left-color: transparent;
    border-left-style: solid;
    border-top: none;
    border-bottom: none;
    outline: none;
  }

  & input.knime-input-invalid {
    border-left-color: var(--theme-color-error);
  }

  & #knime-increase {
    position: absolute;
    z-index: 1001;
    top: 0;
    right: 0;
    width: 33px;
    height: 20px;
    padding-left: 10px;
    padding-right: 9px;
    transform: rotate(180deg);
    background-color: var(--theme-color-porcelain);

    & svg {
      width: 100%;
      height: 100%;
      stroke-width: 1.5px;
    }
  }

  & #knime-increase:focus,
  & #knime-increase:active {
    background-color: var(--theme-color-silver-sand);
  }

  & #knime-decrease {
    position: absolute;
    z-index: 1001;
    bottom: 0;
    right: 0;
    width: 33px;
    height: 20px;
    padding-left: 9px;
    padding-right: 10px;
    background-color: var(--theme-color-porcelain);

    & svg {
      width: 100%;
      height: 100%;
      stroke-width: 1.5px;
    }
  }

  & #knime-decrease:focus,
  & #knime-decrease:active {
    background-color: var(--theme-color-silver-sand);
  }
}
</style>

