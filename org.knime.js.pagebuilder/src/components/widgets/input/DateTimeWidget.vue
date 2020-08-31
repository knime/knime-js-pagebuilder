<script>
import NumberInput from 'webapps-common/ui/components/forms/NumberInput';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import DateInput from '../baseElements/input/DateInput';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Button from 'webapps-common/ui/components/Button';

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
        dateStringAndTimezone() {
            let dateString = this.valuePair[DATA_TYPE];
            return dateString.match(/(.+)\[(.+)]/);
            // TODO: handle errors?
        },
        dateObject() {
            return new Date(this.dateStringAndTimezone[1]);
        },
        timezone() {
            return this.dateStringAndTimezone[2];
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
        }
    },
    methods: {
        onChange(date, timezone) {
            date = date || this.dateObject;
            timezone = timezone || this.timezone;
            let value = `${date.toISOString()}[${timezone}]`;
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        onTimezoneChange(timezone) {
            this.onChange(this.dateObject, timezone);
        },
        nowButtonClicked() {
            this.onChange(new Date(Date.now()));
        },
        validate() {
            let isValid = true;
            let errorMessage;
/*            if (this.viewRep.required) {
                // TOOD: check for value?!
                isValid = false;
                errorMessage = 'Input is required.';
            }*/
            // call validate on date input
            let validateEvent = this.$refs.dateInpu.validate();
            isValid = Boolean(validateEvent.isValid && isValid);
            errorMessage = validateEvent.errorMessage || errorMessage || 'Current input is invalid.';

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
        ref="dateInput"
        :id="labelForId"
        :value="dateObject"
        class="date-input"
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
        />
        <span class="time-colon">:</span>
        <NumberInput
          type="integer"
          :min="0"
          :max="59"
          :value="dateTimeMinutes"
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
        />
      </div>
    </div>
    <div class="zone-wrapper">
      <Dropdown
        v-if="showZone"
        aria-label="Timezone"
        :value="timezone"
        @input="onTimezoneChange"
        class="timezone"
        :possible-values="possibleTimeZones"
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
