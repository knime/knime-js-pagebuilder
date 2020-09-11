<script>
import CalendarIcon from 'webapps-common/ui/assets/img/icons/calendar.svg?inline';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';

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
            popoverIsVisible: false
        };
    },
    methods: {
        onInput(value) {
            this.$emit('input', value);
        },
        validate(val) {
            let isValid = true;
            let errorMessage;
            if (this.required && !this.value) {
                isValid = false;
                errorMessage = 'Please enter a valid date';
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
      :value="value"
      :min-date="min"
      :theme="theme"
      :max-date="max"
      :popover="{ placement: 'bottom', visibility: 'click'}"
      :masks="{L: format}"
      @popoverWillHide="popoverIsVisible = false"
      @popoverWillShow="popoverIsVisible = true"
      @input="onInput"
    >
      <!--Custom Input Slot-->
      <div slot-scope="{ inputProps, inputEvents }">
        <input
          :id="id"
          v-bind="inputProps"
          v-on="inputEvents"
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

    &.hover:not(:focus) { /* not native :hover because of WEBP-297 */
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

