<script>
import CalendarIcon from '~/webapps-common/ui/assets/img/icons/calendar.svg?inline';
import NumberInput from '~/webapps-common/ui/components/forms/NumberInput';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { parse, isAfter, isBefore, isValid } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
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
        /**
         * @type Date - date time in UTC
         */
        value: {
            type: Date,
            required: true
        },
        /**
         * @type String - id of the <input> element; can be used with Label component
         */
        id: {
            type: String,
            default: null
        },
        /**
         * Date format in unicode, only date not time!
         * @see https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
         */
        dateFormat: {
            type: String,
            default: 'yyyy-MM-dd'
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
        },
        /**
         * @type String - tz db timezone name
         * @see https://www.iana.org/time-zones / https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
         */
        timezone: {
            type: String,
            // eslint-disable-next-line new-cap
            default: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    },
    data() {
        return {
            popoverIsVisible: false,
            isInvalid: false,
            isAfterMax: false,
            isBeforeMin: false,
            // last invalid enterted value (for error message)
            invalidValue: null,
            // internal value guarded by watcher to prevent invalid values (min/max, null etc.)
            // time in the given timezone (default: browser local) for correct display
            localValue: new Date('')
        };
    },
    computed: {
        legacyDateFormat() {
            // see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
            // this only works for simple patterns and turn the unicode format into the moment.js de-facto standard
            return this.dateFormat.toUpperCase();
        },
        dateTimeHours() {
            return this.localValue.getHours();
        },
        dateTimeMinutes() {
            return this.localValue.getMinutes();
        },
        dateTimeSeconds() {
            return this.localValue.getSeconds();
        },
        dateTimeMilliseconds() {
            return this.localValue.getMilliseconds();
        }
    },
    watch: {
        value: {
            // validates against min/max and sets appropriate state
            handler(newVal, oldVal) {
                // update internal value if min/max bounds are kept and value is valid
                if (this.checkMinMax(newVal) && this.checkIsValid(newVal)) {
                    // convert to zoned time
                    this.localValue = utcToZonedTime(newVal, this.timezone);
                }
            },
            immediate: true
        }
    },
    methods: {
        formatDate(date) {
            if (this.showTime) {
                return format(date, `${this.dateFormat} HH:mm:SS`);
            } else {
                return format(date, this.dateFormat);
            }
        },
        emitInput(value) {
            // check min/max
            if (this.checkMinMax(value)) {
                this.$emit('input', value);
            } else {
                // emit the old value again to trigger update of input fields to correct the wrong input
                this.$emit('input', this.localValue);
            }
        },
        onDatePickerInput(date) {
            this.emitInput(updateDate(this.localValue, date));
        },
        onTextInputChange($event, hidePopoverFunction) {
            // parse the input
            let date = parse($event.target.value, this.dateFormat, new Date());

            // ignore invalid or unparseable input
            if (!this.checkIsValid(date)) {
                date = this.localValue;
            }

            // use time set in value
            let value = updateDate(this.localValue, date);

            // hide popover (if open)
            hidePopoverFunction();

            // trigger input event which will set value again and update picker
            // and trigger validation even if the value did not change
            this.onDatePickerInput(value);
        },
        checkIsValid(date) {
            if (isValid(date)) {
                return true;
            }
            this.isInvalid = true;
            this.invalidValue = date;
            return false;
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
            let d = new Date(this.localValue);
            if (Number.isSafeInteger(hours)) {
                d.setHours(hours);
            }
            this.emitInput(d);
        },
        onTimeMinutesChange(minutes) {
            let d = new Date(this.localValue);
            if (Number.isSafeInteger(minutes)) {
                d.setMinutes(minutes);
            }
            this.emitInput(d);
        },
        onTimeSecondsChange(seconds) {
            let d = new Date(this.localValue);
            if (Number.isSafeInteger(seconds)) {
                d.setSeconds(seconds);
            }
            this.emitInput(d);
        },
        onTimeMillisecondsChange(milliseconds) {
            let d = new Date(this.localValue);
            if (Number.isSafeInteger(milliseconds)) {
                d.setMilliseconds(milliseconds);
            }
            this.emitInput(d);
        },
        validate(val) {
            let isValid = true;
            let errorMessage;
            if (this.required && this.isInvalid) {
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
        :value="localValue"
        :is-dark="false"
        color="masala"
        :popover="{ placement: 'bottom', visibility: 'click'}"
        :masks="{L: legacyDateFormat}"
        :max-date="max"
        :min-date="min"
        @popoverWillHide="popoverIsVisible = false"
        @popoverWillShow="popoverIsVisible = true"
        @input="onDatePickerInput"
      >
        <!--Custom Input Slot-->
        <template v-slot="{ inputValue, inputEvents, hidePopover }">
          <div>
            <input
              :id="id"
              v-on="inputEvents"
              :value="inputValue"
              @change="onTextInputChange($event, hidePopover)"
            >
            <span :class="['button', {'active': popoverIsVisible}]">
              <CalendarIcon />
            </span>
          </div>
        </template>
      </DatePicker>
    </div>
    <div
      v-if="showTime"
      class="time"
    >
      <NumberInput
        ref="hours"
        type="integer"
        :min="0"
        :max="23"
        :value="dateTimeHours"
        @input="onTimeHoursChange"
      />
      <span class="time-colon">:</span>
      <NumberInput
        ref="minutes"
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
        ref="seconds"
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
        ref="milliseconds"
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
  --theme-date-input-box-shadow-color: var(--knime-masala-semi);
  --theme-date-input-day-content-background: rgba(192, 196, 198, 0.5);

  --theme-date-input-accent-100: var(--knime-gray-ultra-light);
  --theme-date-input-accent-200: var(--knime-gray-light-semi);
  --theme-date-input-accent-300: var(--knime-silver-sand);
  --theme-date-input-accent-400: var(--knime-stone-gray);
  --theme-date-input-accent-500: var(--knime-gray-dark);
  --theme-date-input-accent-600: var(--knime-masala);
  --theme-date-input-accent-700: var(--knime-masala);
  --theme-date-input-accent-800: var(--knime-black-semi);
  --theme-date-input-accent-900: var(--knime-black);

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
    /* v-calendar theme
       new 1.1+ theme with css-vars see https://github.com/nathanreyes/v-calendar/blob/master/src/styles/base.css */

    /* remove caret (triangle) */
    & >>> .vc-popover-caret {
      display: none;
    }

    /* no space between input and popover */
    & >>> .vc-popover-content-wrapper {
      --popover-vertical-content-offset: 0;
      --popover-horizontal-content-offset: 0;
    }

    & >>> .vc-container {
      /* remove roundness */
      --rounded: 0;
      --rounded-lg: 0;

      /* popover box shadow */
      --shadow-lg: 0 1px 4px 0 var(--theme-date-input-box-shadow-color);

      /* color prop value (in our case 'masala' see above) and vc-COLOR-PROP-NAME need to be defined */
      --masala-100: var(--theme-date-input-accent-100);
      --masala-200: var(--theme-date-input-accent-200);
      --masala-300: var(--theme-date-input-accent-300);
      --masala-400: var(--theme-date-input-accent-400);
      --masala-500: var(--theme-date-input-accent-500);
      --masala-600: var(--theme-date-input-accent-600);
      --masala-700: var(--theme-date-input-accent-700);
      --masala-800: var(--theme-date-input-accent-800);
      --masala-900: var(--theme-date-input-accent-900);

      &.vc-masala {
        --accent-100: var(--masala-100);
        --accent-200: var(--masala-200);
        --accent-300: var(--masala-300);
        --accent-400: var(--masala-400);
        --accent-500: var(--masala-500);
        --accent-600: var(--masala-600);
        --accent-700: var(--masala-700);
        --accent-800: var(--masala-800);
        --accent-900: var(--masala-900);
      }

      /* not themed items */
      & .vc-day-content:hover {
        background: var(--theme-date-input-day-content-background);
      }

      /* non "color" prop colors which are used regardless of color prop value */
      --white: var(--knime-white);
      --black: var(--knime-black);

      --gray-100: var(--theme-date-input-accent-100);
      --gray-200: var(--knime-silver-sand-semi); /* arrow hover background color */
      --gray-300: var(--theme-date-input-accent-300);
      --gray-400: var(--theme-date-input-accent-400);
      --gray-500: var(--knime-masala); /* weekday font color */
      --gray-600: var(--knime-masala); /* color arrow */
      --gray-700: var(--theme-date-input-accent-700);
      --gray-800: var(--knime-masala); /* background of month/year popout and font color title */
      --gray-900: var(--knime-black-semi); /* hover background of month/year in popout */
    }

    /* -- end v-calendar 'theme' */

    /* input wrapper style */
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

