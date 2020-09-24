<script>
import CalendarIcon from 'webapps-common/ui/assets/img/icons/calendar.svg?inline';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { format, parse, isAfter, isBefore } from 'date-fns';

/**
 * Date component shows input field with a button and a popover calendar to choose the date. Only date no time.
 * Uses DatePicker (<v-date-picker>) from v-calendar. See: https://vcalendar.io/
 */
export default {
    components: {
        CalendarIcon,
        DatePicker
    },
    props: {
        value: {
            type: Date,
            required: true
        },
        id: {
            type: String,
            default: null
        },
        format: {
            type: String,
            default: 'YYYY-MM-DD'
        },
        min: {
            default: null,
            type: Date
        },
        max: {
            default: null,
            type: Date
        },
        /**
         * Validity controlled by the parent component to be flexible.
         */
        isValid: {
            default: true,
            type: Boolean
        },
        required: {
            default: false,
            type: Boolean
        }
    },
    data() {
        return {
            theme: {
                // default: https://github.com/nathanreyes/v-calendar/blob/next/src/utils/defaults/theme.js
                // define classes for the elements
                color: 'masala', // this defines vc-color-NUM values
                container: {
                    light: 'vc-text-gray-900 vc-bg-white custom-box-shadow'
                },
                weekdays: {
                    light: 'vc-text-sm vc-font-bold custom-normal-text-color'
                },
                arrows: {
                    light:
                        'vc-text-gray-600 vc-border-2 vc-border-transparent hover:vc-opacity-50 ' +
                        'hover:vc-bg-gray-300 focus:vc-border-gray-300'
                },
                navPopoverContainer: {
                    light:
                        'vc-text-sm vc-font-semibold vc-text-white custom-bg-dark vc-border ' +
                        'vc-border-gray-700 vc-p-1 vc-shadow'
                }
            },
            popoverIsVisible: false,
            isAfterMax: false,
            isBeforeMin: false,
            // values
            invalidValue: null,
            value_: null
        };
    },
    computed: {
        unicodeDateFormat() {
            // see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
            // this only works for simple patterns
            return this.format.replaceAll('Y', 'y').replaceAll('D', 'd');
        }
    },
    watch: {
        value: {
            // validates against min/max and sets appropriate state
            handler(newVal, oldVal) {
                if (this.checkMinMax(newVal)) {
                    this.invalidValue = newVal;
                    // no change of value_
                    this.value_ = this.value_;
                } else {
                    this.value_ = newVal;
                }
            },
            immediate: true
        }
    },
    methods: {
        formatDate(date) {
            return format(date, this.unicodeDateFormat);
        },
        onInput(value) {
            this.$emit('input', value);
        },
        onTextInputChange($event, hidePopoverFunction) {
            // for manual text inputs we accept anything and validate for min/max in the watcher
            // parse date
            let date = parse($event.target.value, this.unicodeDateFormat, new Date());
            // check for invalid min/max
            let value = date;
            if (this.checkMinMax(date)) {
                this.invalidValue = date;
                value = this.value_;
            }
            // hide popover (if open)
            hidePopoverFunction();
            // trigger input event which will set value again and update picker
            // and trigger validation even if the value did not change
            this.onInput(value);
        },
        checkMinMax(date) {
            this.isBeforeMin = isBefore(date, this.min);
            this.isAfterMax = isAfter(date, this.max);
            console.log('checkMinMax', 'this.isBeforeMin', this.isBeforeMin, date, this.min);
            console.log('checkMinMax', 'this.isAfterMax', this.isAfterMax, date, this.max);
            return this.isBeforeMin || this.isAfterMax;
        },
        validate(val) {
            let isValid = true;
            let errorMessage;
            if (this.required && !this.value) {
                isValid = false;
                errorMessage = 'This field requires the input of a valid date';
            }
            if (this.isAfterMax) {
                isValid = false;
                // eslint-disable-next-line max-len
                errorMessage = `${this.formatDate(this.invalidValue)} is after maximum date ${this.formatDate(this.max)}`;
            }
            if (this.isBeforeMin) {
                isValid = false;
                // eslint-disable-next-line max-len
                errorMessage = `${this.formatDate(this.invalidValue)} is before minimum date ${this.formatDate(this.min)}`;
            }
            return {
                isValid,
                errorMessage
            };
        }
    }
};
</script>

<template>
  <div class="wrapper">
    <span
      v-if="!isValid"
      class="invalid-marker"
    />
    <DatePicker
      ref="datePicker"
      :value="value_"
      :theme="theme"
      :popover="{ placement: 'bottom', visibility: 'click'}"
      :masks="{L: format}"
      :max-date="max"
      :min-date="min"
      :is-required="required"
      @popoverWillHide="popoverIsVisible = false"
      @popoverWillShow="popoverIsVisible = true"
      @input="onInput"
    >
      <!--Custom Input Slot-->
      <div slot-scope="{ inputProps, hidePopover }">
        <input
          :id="id"
          v-bind="inputProps"
          @change="onTextInputChange($event, hidePopover)"
        >
        <span :class="['button', {'active': popoverIsVisible}]">
          <CalendarIcon />
        </span>
      </div>
    </DatePicker>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.wrapper {
  /* DateInput */
  --theme-date-input-dark-background-color: var(--knime-masala);
  --theme-date-input-box-shadow-color: var(--knime-masala-semi);

  /* v-calendar */

  /* remove caret and space */
  & >>> .vc-popover-content {
    &.direction-bottom {
      margin-top: 0 !important;
    }
  }

  & >>> .vc-popover-caret {
    display: none;
  }

  /* new styles - see theme object in data */

  & >>> .vc-bg-masala-600 {
    background-color: var(--theme-date-input-dark-background-color);
  }

  & >>> .custom-normal-text-color {
    color: var(--theme-text-normal-color);
  }

  & >>> .custom-box-shadow {
    box-shadow: 0 1px 4px 0 var(--theme-date-input-box-shadow-color);
  }

  & >>> .custom-bg-dark {
    background: var(--theme-date-input-dark-background-color);
  }

  /* end */

  position: relative;
  width: 100%;
  border: 1px solid var(--knime-stone-gray);

  &:focus-within {
    border-color: var(--knime-masala);
  }

  & input {
    font-size: 13px;
    font-weight: 300;
    letter-spacing: inherit;
    height: 40px;
    line-height: normal;
    border: 0;
    margin: 0;
    padding: 0 10px;
    border-radius: 0;
    width: calc(100% - 32px);
    outline: none;
    background-color: transparent;

    /* css3 invalid state */

    &:invalid {
      box-shadow: none; /* override default browser styling */
    }

    &:hover:not(:focus) {
      background-color: var(--knime-silver-sand-semi);
    }
  }

  & .invalid-marker {
    position: absolute;
    display: block;
    width: 3px;
    left: -1px;
    top: 0;
    bottom: 0;
    z-index: 1;
    background-color: var(--theme-color-error);
  }

  & .button {
    position: absolute;
    z-index: 1;
    width: 32px;
    height: 40px;
    padding-left: 10px;
    padding-right: 9px;
    cursor: pointer;

    &:hover {
      background-color: var(--knime-silver-sand-semi);
    }

    & svg {
      width: 100%;
      height: 100%;
      stroke-width: 1.5px;
    }
  }

  & .button:active,
  & .button.active {
    color: var(--knime-white);
    background-color: var(--knime-masala);

    & svg {
      stroke: var(--knime-white);
    }
  }
}
</style>

