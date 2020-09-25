<script>
import CalendarIcon from 'webapps-common/ui/assets/img/icons/calendar.svg?inline';
import NumberInput from 'webapps-common/ui/components/forms/NumberInput';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { format, parse, isAfter, isBefore } from 'date-fns';
import updateDate from '@/util/updateDate';

/**
 * DateTime component shows input field with a button and a popover calendar to choose the date. Time is represented
 * with multiple NumberInputs for hour, minute etc.
 * Uses DatePicker (<v-date-picker>) from v-calendar. See: https://vcalendar.io/
 */
export default {
    components: {
        CalendarIcon,
        DatePicker,
        NumberInput
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
        showSeconds: {
            default: true,
            type: Boolean
        },
        showMilliseconds: {
            default: false,
            type: Boolean
        },
        showTime: {
            default: true,
            type: Boolean
        },
        showDate: {
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
            // last invalid enterted value (for error message)
            invalidValue: null,
            // internal value guarded by watcher to prevent invalid values (min/max, null etc.)
            value_: new Date('')
        };
    },
    computed: {
        unicodeDateFormat() {
            // see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
            // this only works for simple patterns
            return this.format.replaceAll('Y', 'y').replaceAll('D', 'd');
        },
        dateTimeHours() {
            return this.value_.getHours();
        },
        dateTimeMinutes() {
            return this.value_.getMinutes();
        },
        dateTimeSeconds() {
            return this.value_.getSeconds();
        },
        dateTimeMilliseconds() {
            return this.value_.getMilliseconds();
        }
    },
    watch: {
        value: {
            // validates against min/max and sets appropriate state
            handler(newVal, oldVal) {
                // update internal value if min/max bounds are kept
                if (this.checkMinMax(newVal)) {
                    this.value_ = newVal;
                }
            },
            immediate: true
        }
    },
    methods: {
        formatDate(date) {
            if (this.showTime) {
                return format(date, `${this.unicodeDateFormat} HH:mm:SS`);
            } else {
                return format(date, this.unicodeDateFormat);
            }
        },
        emitInput(value) {
            // check min/max
            if (this.checkMinMax(value)) {
                this.$emit('input', value);
            } else {
                // emit the old value again to trigger update of input fields to correct the wrong input
                this.$emit('input', this.value_);
            }
        },
        onDatePickerInput(date) {
            this.emitInput(updateDate(this.value_, date));
        },
        onTextInputChange($event, hidePopoverFunction) {
            // parse the input
            let date = parse($event.target.value, this.unicodeDateFormat, new Date());

            // use time set in value
            let datetime = updateDate(this.value_, date);

            // check for invalid min/max use input if ok, current date otherwise
            let value = this.value_;
            if (this.checkMinMax(datetime)) {
                value = datetime;
            }
            // hide popover (if open)
            hidePopoverFunction();

            // trigger input event which will set value again and update picker
            // and trigger validation even if the value did not change
            this.onDatePickerInput(value);
        },
        checkMinMax(date) {
            // skip check if no min and max is set
            if (!this.min && !this.max) {
                return true;
            }
            this.isBeforeMin = isBefore(date, this.min);
            this.isAfterMax = isAfter(date, this.max);
            if (this.isBeforeMin || this.isAfterMax) {
                this.invalidValue = date;
                return false;
            }
            return true;
        },
        onTimeHoursChange(hours) {
            let d = new Date(this.value_);
            if (Number.isSafeInteger(hours)) {
                d.setHours(hours);
            }
            this.emitInput(d);
        },
        onTimeMinutesChange(minutes) {
            let d = new Date(this.value_);
            if (Number.isSafeInteger(minutes)) {
                d.setMinutes(minutes);
            }
            this.emitInput(d);
        },
        onTimeSecondsChange(seconds) {
            let d = new Date(this.value_);
            if (Number.isSafeInteger(seconds)) {
                d.setSeconds(seconds);
            }
            this.emitInput(d);
        },
        onTimeMillisecondsChange(milliseconds) {
            let d = new Date(this.value_);
            if (Number.isSafeInteger(milliseconds)) {
                d.setMilliseconds(milliseconds);
            }
            this.emitInput(d);
        },
        validate(val) {
            let isValid = true;
            let errorMessage;
            if (this.required && !this.value) {
                isValid = false;
                errorMessage = 'Please input a valid date';
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
  <div class="date-time-input">
    <div
      v-if="showDate"
      class="date-picker"
    >
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
        @popoverWillHide="popoverIsVisible = false"
        @popoverWillShow="popoverIsVisible = true"
        @input="onDatePickerInput"
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
    <div
      v-if="showTime"
      class="time"
    >
      <NumberInput
        type="integer"
        :min="0"
        :max="23"
        :value="dateTimeHours"
        @input="onTimeHoursChange"
      />
      <span class="time-colon">:</span>
      <NumberInput
        type="integer"
        :min="0"
        :max="59"
        :value="dateTimeMinutes"
        @input="onTimeMinutesChange"
      />
      <span
        v-if="showSeconds"
        class="time-colon"
      >:</span>
      <NumberInput
        v-if="showSeconds"
        type="integer"
        :min="0"
        :max="59"
        :value="dateTimeSeconds"
        @input="onTimeSecondsChange"
      />
      <span
        v-if="showMilliseconds"
        class="time-colon"
      >.</span>
      <NumberInput
        v-if="showMilliseconds"
        type="integer"
        :min="0"
        :max="999"
        :value="dateTimeMilliseconds"
        @input="onTimeMillisecondsChange"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.date-time-input {
  /* DateInput */
  --theme-date-input-dark-background-color: var(--knime-masala);
  --theme-date-input-box-shadow-color: var(--knime-masala-semi);

  display: flex;
  width: 100%;

  /* time */
  & .time {
    display: flex;
    width: auto;
    flex-wrap: nowrap;

    & >>> .wrapper {
      width: 5rem;
    }

    & .time-colon {
      padding: 5px;
    }

    & span {
      display: flex;
      width: auto;
      flex-wrap: nowrap;
    }
  }

  & .date-picker {
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

    max-width: 9rem;
    min-width: 7.5rem;
    margin-right: 20px;
    position: relative;
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
}
</style>

