<script>
import ArrowIcon from 'webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';

const INTERVAL_TIMEOUT_DELAY = 200;
const MOUSE_DOWN_CHANGE_INTERVAL = 50;
const DEFAULT_STEP_SIZE_DOUBLE = 0.1;
const DEFAULT_STEP_SIZE_INTEGER = 1;
const BASE_10_HELPER = 10;

/**
 * Default number (spinner) input field for widgets.
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
        type: {
            default: 'double',
            type: String
        },
        description: {
            default: 'KNIME number input',
            type: String
        }
    },
    arrowManipulationDebouncer: null,
    arrowManipulationInterval: null,
    computed: {
        stepSize() {
            if (this.type === 'double') {
                return DEFAULT_STEP_SIZE_DOUBLE;
            }
            return DEFAULT_STEP_SIZE_INTEGER;
        },
        inputClass() {
            const classes = ['knime-qf-input', 'knime-spinner'];
            switch (this.type) {
            case 'double':
                classes.push('knime-double');
                break;
            case 'integer':
                classes.push('knime-integer');
                break;
            default:
                  //  nothing
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
            return this.type === 'double'
                ? parseFloat(this.$el.childNodes[0].value)
                : parseInt(this.$el.childNodes[0].value, 10);
        },
        onValueChange(e) {
            this.$emit('updateValue', {
                val: this.getValue(),
                originalEvent: e,
                isValid: this.validate()
            });
        },
        validate() {
            let newValue = this.getValue();
            if (typeof newValue !== 'number') {
                return false;
            }
            if (newValue < this.min || newValue > this.max) {
                return false;
            }
            return true;
        },
        changeValue(valDiff, publishChange, event) {
            let parsedVal = this.getValue();
            if (!isNaN(parsedVal)) {
                parsedVal = (parsedVal + valDiff) * BASE_10_HELPER;
                parsedVal = Math.round(parsedVal) / BASE_10_HELPER;
                if ((parsedVal <= this.max || valDiff < 0) &&
                (parsedVal >= this.min || valDiff > 0)) {
                    this.$el.childNodes[0].value = parsedVal;
                    if (publishChange) {
                        this.onValueChange(event);
                    }
                }
            }
        },
        mouseEvent(e, type) {
            clearTimeout(this.arrowManipulationDebouncer);
            clearInterval(this.arrowManipulationInterval);
            let valDiff = type === 'increase'
                ? this.stepSize
                : -this.stepSize;
            switch (e.type) {
            case 'mousedown': {
                this.arrowManipulationDebouncer = setTimeout(() => {
                    this.arrowManipulationInterval = setInterval(() => {
                        this.changeValue(valDiff, false, e);
                    }, MOUSE_DOWN_CHANGE_INTERVAL);
                }, INTERVAL_TIMEOUT_DELAY);
                break;
            }
            case 'mouseup':
                this.changeValue(valDiff, true, e);
                break;
            default:
                // do nothing
            }
        }
    }
};
</script>

<template>
  <!-- knime-qf-input legacy selector -->
  <div class="knime-input-container">
    <input
      :class="inputClass"
      type="number"
      role="spinButton"
      :title="description"
      :min="min"
      :max="max"
      :step="stepSize"
      @change="onValueChange"
      @input="onValueChange"
    >
    <span
      id="knime-increase"
      @mousedown="(e) => mouseEvent(e, 'increase')"
      @mouseup="(e) => mouseEvent(e, 'increase')"
    >
      <ArrowIcon />
    </span>
    <span
      id="knime-decrease"
      @mousedown="(e) => mouseEvent(e, 'decrease')"
      @mouseup="(e) => mouseEvent(e, 'decrease')"
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
  min-width: 100px;
  max-width: 400px;

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
    min-width: 40px;
    max-width: 400px;
    border: none;
    outline: none;
  }

  & input.knime-input-invalid {
    border-left-width: 3px;
    border-left-color: var(--theme-color-error);
    border-left-style: solid;
  }

  & #knime-increase {
    position: absolute;
    z-index: 1001;
    top: 0;
    right: 0;
    width: 33px;
    height: 20px;
    padding-left: 10px;
    padding-bottom: 3px;
    padding-right: 9px;
    padding-top: 3px;
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
    padding-bottom: 3px;
    padding-right: 10px;
    padding-top: 3px;
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

