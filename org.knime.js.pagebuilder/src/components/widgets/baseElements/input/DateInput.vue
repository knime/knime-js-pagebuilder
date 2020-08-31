<script>
import CalendarIcon from 'webapps-common/ui/assets/img/icons/calendar.svg?inline';

/**
 * Date component shows input field with a button and a popover calendar to choose the date. Only date no time.
 */
export default {
    components: {
        CalendarIcon
    },
    props: {
        value: {
            default: new Date(0),
            type: Date
        },
        id: {
            type: String,
            default: null
        },
        format: {
            type: String,
            default: 'YYY-MM-DD'
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
        }
    },
    computed: {
        formattedValue() {
            // TODO: use proper formatting lib? e.g. date-fns
            return [this.value.getFullYear(),
                String(this.value.getMonth() + 1).padStart(2, '0'),
                String(this.value.getDate()).padStart(2, '0')].join('-');
        }
    },
    methods: {
        getValue() {
            let inputValue = this.$refs.input.value;
            let d = new Date();
            inputValue.split('-');
            // TODO: handle input errors?
            d.setFullYear(Number(inputValue[0]));
            d.setMonth(Number(inputValue[1]), Number(inputValue[2]));
            return d;
        },
        onInput() {
            this.$emit('input', this.getValue());
        },
        validate(val) {
            let isValid = true;
            let errorMessage;
            // TODO: impl
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
    <input
      :id="id"
      ref="input"
      type="text"
      :value="formattedValue"
      :min="min"
      :max="max"
      @input="onInput"
    >
    <span
      class="button"
    >
      <CalendarIcon />
    </span>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.wrapper {
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

  & .button:active {
    color: var(--knime-white);
    background-color: var(--knime-masala);

    & svg {
      stroke: var(--knime-white);
    }
  }
}
</style>

