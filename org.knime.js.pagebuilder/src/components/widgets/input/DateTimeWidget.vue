<script>
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';
import DateTimeInput from 'webapps-common/ui/components/forms/DateTimeInput.vue';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown.vue';
import Button from 'webapps-common/ui/components/Button.vue';
import updateTime from 'webapps-common/util/updateTime';
import getLocalTimeZone from 'webapps-common/util/localTimezone';

import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * DateTimeWidget.
 */
export default {
    components: {
        Button,
        Dropdown,
        Label,
        DateTimeInput,
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
                datestring: ''
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    emits: ['updateWidget'],
    data() {
        return {
            // tz database timezones (e.g. Europe/Berlin)
            localTimeZone: getLocalTimeZone(),
            execTime: new Date()
        };
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        value() {
            return this.valuePair;
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
            // if the value has a zonestring we assume its already split up
            // (e.g. if it was created by this widget and not by the backend)
            if (this.value.zonestring) {
                return {
                    datestring: this.value.datestring,
                    zonestring: this.value.zonestring
                };
            }
            // Update with FE (local) exec time only on initial execution.
            // Additional re-executions will be skipped by comparing the default and current WizardNode values.
            if (this.viewRep.usedefaultexectime && this.value?.datestring === this.viewRep?.defaultValue?.datestring) {
                return {
                    datestring: this.formatDate(this.execTime),
                    zonestring: this.localTimeZone
                };
            }
            // still no date, lets parse given string (default value)
            return this.parseKnimeDateString(this.value.datestring);
        },
        dateObject() {
            return zonedTimeToUtc(this.dateValue.datestring, this.timezone);
        },
        timezone() {
            return this.dateValue.zonestring;
        },
        possibleTimeZones() {
            return (this.viewRep.zones || []).map(x => ({
                id: x,
                text: x
            }));
        },
        minDate() {
            if (this.viewRep.usemin) {
                const { datestring, zonestring } = this.parseKnimeDateString(this.viewRep.min);
                if (this.viewRep.useminexectime) {
                    return zonedTimeToUtc(this.execTime, this.localTimeZone);
                }
                return zonedTimeToUtc(datestring, zonestring);
            }
            return null;
        },
        maxDate() {
            if (this.viewRep.usemax) {
                const { datestring, zonestring } = this.parseKnimeDateString(this.viewRep.max);
                if (this.viewRep.usemaxexectime) {
                    return zonedTimeToUtc(this.execTime, this.localTimeZone);
                }
                return zonedTimeToUtc(datestring, zonestring);
            }
            return null;
        }
    },
    mounted() {
        const { datestring: inDateStr, zonestring: inZoneStr } = this.value || {};
        const { datestring, zonestring } = this.dateValue;
        // Check and publish locally updated values on mount. Reasons for update include "use execution time" setting
        // or local parsing of timezone.
        if (datestring !== inDateStr || zonestring !== inZoneStr) {
            this.publishUpdate(datestring, zonestring);
        }
    },
    methods: {
        /**
         * Parse proprietary date and timezone combination string.
         * @param {String} dateAndZoneString - DATE[TIMEZONE] e.g. "2020-05-03T09:54:55+02:00[Europe/Rome]".
         * @returns {{zonestring: String, datestring: String}}
         */
        parseKnimeDateString(dateAndZoneString) {
            let match = dateAndZoneString.match(/(.+)\[(.+)]/) || [null, '', ''];
            return {
                datestring: match[1],
                zonestring: match[2]
            };
        },
        formatDate(date) {
            return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
        },
        onChange(date, timezone) {
            let zonedDate = utcToZonedTime(date, timezone);
            let value = this.formatDate(zonedDate);
            this.publishUpdate(value, timezone);
        },
        publishUpdate(datestring, zonestring) {
            this.$emit('updateWidget', {
                nodeId: this.nodeId,
                update: {
                    'viewRepresentation.currentValue': {
                        datestring,
                        zonestring
                    }
                }
            });
        },
        onDateChange(date) {
            this.onChange(date, this.timezone);
        },
        onTimezoneChange(timezone) {
            this.onChange(this.dateObject, timezone);
        },
        nowButtonClicked() {
            let now = new Date(Date.now());
            // update only time if date picker is not visible
            if (!this.showDate) {
                now = updateTime(this.dateObject, now);
            }
            this.onChange(now, this.localTimeZone);
        },
        validate() {
            // call validate on date input
            let validateDateInputCmp = this.$refs.dateInput.validate();
            let isValid = Boolean(validateDateInputCmp.isValid);
            let errorMessage = validateDateInputCmp.errorMessage || 'Current input is invalid.';

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
    #default="{ labelForId }"
    class="date-time-label"
    :text="label"
    large
  >
    <DateTimeInput
      :id="labelForId"
      ref="dateInput"
      :model-value="dateObject"
      :required="viewRep.required"
      :min="minDate"
      :max="maxDate"
      :show-date="showDate"
      :show-time="showTime"
      :show-seconds="showSeconds"
      :show-milliseconds="showMilliseconds"
      :is-valid="isValid"
      :timezone="showZone ? timezone : localTimeZone"
      @update:model-value="onDateChange"
    />
    <div class="zone-wrapper">
      <Dropdown
        v-if="showZone"
        ref="timezone"
        aria-label="Timezone"
        :model-value="timezone"
        class="timezone"
        :possible-values="possibleTimeZones"
        @update:model-value="onTimezoneChange"
      />
      <Button
        v-if="showNowButton"
        ref="nowButton"
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
  /* remove the 10px label margin - they are provided by DateTimeInput which is required to have working
  wrapping with margin */
  & :deep(label) {
    margin-bottom: 0;
  }

  & .timezone {
    width: 100%;
    max-width: 15.3rem;
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
