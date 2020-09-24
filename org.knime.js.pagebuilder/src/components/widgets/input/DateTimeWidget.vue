<script>
import NumberInput from 'webapps-common/ui/components/forms/NumberInput';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import DateInput from '../baseElements/input/DateInput';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Button from 'webapps-common/ui/components/Button';

import { format } from 'date-fns-tz';

const DATA_TYPE = 'datestring';

/**
 * DateTimeWidget
 */
export default {
    components: {
        Button,
        Dropdown,
        Label,
        NumberInput,
        DateInput,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE]: ''
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        description() {
            return this.viewRep.description || null;
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        showTime() {
            return String(this.viewRep.type).includes('T');
        },
        showDate() {
            return String(this.viewRep.type).includes('D');
        },
        showZone() {
            return String(this.viewRep.type).includes('Z');
        },
        showNowButton() {
            return this.viewRep.shownowbutton;
        },
        showSeconds() {
            return this.viewRep.granularity === 'show_seconds' || this.showMilliseconds;
        },
        showMilliseconds() {
            return this.viewRep.granularity === 'show_millis';
        },
        dateValue() {
            return this.parseDateString(this.valuePair[DATA_TYPE]);
        },
        dateObject() {
            // display time without offset
            return this.isoToDateObjectIgnoreTimezone(this.dateValue.isoDate);
        },
        timezone() {
            return this.dateValue.timezone;
        },
        possibleTimeZones() {
            return (this.viewRep.zones || []).map(x => ({
                id: x,
                text: x
            }));
        },
        dateTimeHours() {
            return this.dateObject.getHours();
        },
        dateTimeMinutes() {
            return this.dateObject.getMinutes();
        },
        dateTimeSeconds() {
            return this.dateObject.getSeconds();
        },
        dateTimeMilliseconds() {
            return this.dateObject.getMilliseconds();
        },
        minDate() {
            if (this.viewRep.usemin) {
                return this.isoToDateObjectIgnoreTimezone(this.parseDateString(this.viewRep.min).isoDate);
            }
            return null;
        },
        maxDate() {
            if (this.viewRep.usemax) {
                return this.isoToDateObjectIgnoreTimezone(this.parseDateString(this.viewRep.max).isoDate);
            }
            return null;
        }
    },
    methods: {
        parseDateString(dateString) {
            let match = dateString.match(/(.+)\[(.+)]/);
            return {
                isoDate: match[1],
                timezone: match[2]
            };
        },
        isoToDateObjectIgnoreTimezone(isoDate) {
            return new Date(isoDate.split('+')[0]);
        },
        onChange(date, timezone) {
            timezone = timezone || this.timezone;
            let value = `${format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone: timezone })}[${timezone}]`;
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value
            };
            console.log('updateWidget', changeEventObj);
            this.$emit('updateWidget', changeEventObj);
        },
        onDateChange(date) {
            let d = new Date(this.dateObject);
            // datepicker gives null if date is invalid, we just play back the current value
            if (date) {
                d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            }
            this.onChange(d);
        },
        onTimeHoursChange(hours) {
            let d = new Date(this.dateObject);
            if (Number.isSafeInteger(hours)) {
                d.setHours(hours);
            }
            this.onChange(d);
        },
        onTimeMinutesChange(minutes) {
            let d = new Date(this.dateObject);
            if (Number.isSafeInteger(minutes)) {
                d.setMinutes(minutes);
            }
            this.onChange(d);
        },
        onTimeSecondsChange(seconds) {
            let d = new Date(this.dateObject);
            if (Number.isSafeInteger(seconds)) {
                d.setSeconds(seconds);
            }
            this.onChange(d);
        },
        onTimeMillisecondsChange(milliseconds) {
            let d = new Date(this.dateObject);
            if (Number.isSafeInteger(milliseconds)) {
                d.setMilliseconds(milliseconds);
            }
            this.onChange(d);
        },
        onTimezoneChange(timezone) {
            this.onChange(this.dateObject, timezone);
        },
        nowButtonClicked() {
            // eslint-disable-next-line new-cap
            this.onChange(new Date(Date.now()), Intl.DateTimeFormat().resolvedOptions().timeZone);
        },
        validate() {
            let isValid = true;
            let errorMessage;
            // call validate on date input
            let validateDateInputCmp = this.$refs.dateInput.validate();
            isValid = Boolean(validateDateInputCmp.isValid && isValid);
            errorMessage = validateDateInputCmp.errorMessage || errorMessage || 'Current input is invalid.';

            return {
                isValid,
                errorMessage: isValid ? null : errorMessage
            };
        }
    }
};
</script>

<template>
  <Label
    v-slot="{ labelForId }"
    class="date-time-label"
    :text="label"
  >
    <div class="date-time">
      <DateInput
        v-if="showDate"
        :id="labelForId"
        ref="dateInput"
        :value="dateObject"
        :required="viewRep.required"
        :min="minDate"
        :max="maxDate"
        class="date-input"
        @input="onDateChange"
      />
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
    <div class="zone-wrapper">
      <Dropdown
        v-if="showZone"
        aria-label="Timezone"
        :value="timezone"
        class="timezone"
        :possible-values="possibleTimeZones"
        @input="onTimezoneChange"
      />
      <Button
        v-if="showNowButton"
        primary
        compact
        class="now-button"
        @click="nowButtonClicked"
      >
        {{ showTime ? 'Now' : 'Today' }}
      </Button>
    </div>
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style lang="postcss" scoped>
.date-time-label {
  & .date-input {
    max-width: 15rem;
    margin-right: 20px;
  }

  & .date-time {
    display: flex;
    width: auto;
  }

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

  & .timezone {
    width: 100%;
    max-width: 15rem;
    margin-right: 20px;
  }

  & .zone-wrapper {
    display: flex;
    margin-top: 10px;
    vertical-align: center;

    & .now-button {
      height: 30px;
      align-self: center;
    }
  }
}
</style>
