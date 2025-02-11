<script>
import { format } from "date-fns-tz";

import { Button, Dropdown, Label } from "@knime/components";
import { DateTimeInput } from "@knime/components/date-time-input";
import { getLocalTimeZone, updateTime } from "@knime/utils";

import { fromZonedTime, toZonedTime } from "../../../util/widgetUtil/dateTime";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

/**
 * DateTimeWidget.
 */
export default {
  components: {
    Button,
    Dropdown,
    Label,
    DateTimeInput,
    ErrorMessage,
  },
  props: {
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return obj.nodeInfo;
      },
    },
    nodeId: {
      required: true,
      type: String,
      validator(nodeId) {
        return nodeId !== "";
      },
    },
    isValid: {
      default: true,
      type: Boolean,
    },
    valuePair: {
      default: () => ({
        datestring: "",
      }),
      type: Object,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  emits: ["updateWidget"],
  data() {
    return {
      // tz database timezones (e.g. Europe/Berlin)
      localTimeZone: getLocalTimeZone(),
      execTime: new Date(),
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
      return String(this.viewRep.type).includes("T");
    },
    showDate() {
      return String(this.viewRep.type).includes("D");
    },
    showZone() {
      return String(this.viewRep.type).includes("Z");
    },
    showNowButton() {
      return this.viewRep.shownowbutton;
    },
    showSeconds() {
      return (
        this.viewRep.granularity === "show_seconds" || this.showMilliseconds
      );
    },
    showMilliseconds() {
      return this.viewRep.granularity === "show_millis";
    },
    dateValue() {
      // if the value has a zonestring we assume its already split up
      // (e.g. if it was created by this widget and not by the backend)
      if (this.value.zonestring) {
        return {
          datestring: this.value.datestring,
          zonestring: this.value.zonestring,
        };
      }
      // Update with FE (local) exec time only on initial execution.
      // Additional re-executions will be skipped by comparing the default and current WizardNode values.
      if (
        this.viewRep.usedefaultexectime &&
        this.value?.datestring === this.viewRep?.defaultValue?.datestring
      ) {
        return {
          datestring: this.formatDate(this.execTime),
          zonestring: this.localTimeZone,
        };
      }
      // still no date, lets parse given string (default value)
      return this.parseKnimeDateString(this.value.datestring);
    },
    dateObject() {
      return fromZonedTime(this.dateValue.datestring, this.timezone);
    },
    timezone() {
      return this.dateValue.zonestring;
    },
    possibleTimeZones() {
      return (this.viewRep.zones || []).map((x) => ({
        id: x,
        text: x,
      }));
    },
    minDate() {
      if (this.viewRep.usemin) {
        const { datestring, zonestring } = this.parseKnimeDateString(
          this.viewRep.min,
        );
        if (this.viewRep.useminexectime) {
          return this.execTime;
        }
        return fromZonedTime(datestring, zonestring);
      }
      return null;
    },
    maxDate() {
      if (this.viewRep.usemax) {
        const { datestring, zonestring } = this.parseKnimeDateString(
          this.viewRep.max,
        );
        if (this.viewRep.usemaxexectime) {
          return this.execTime;
        }
        return fromZonedTime(datestring, zonestring);
      }
      return null;
    },
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
      let match = dateAndZoneString.match(
        /(.+?)(?:Z|[+-]\d\d:?(?:\d\d)?)\[(.+)]/,
      ) || [null, "", ""];
      return {
        datestring: match[1],
        zonestring: match[2],
      };
    },
    formatDate(date) {
      return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
    },
    onChange(date, timezone) {
      let zonedDate = toZonedTime(date, timezone);
      // this.formatDate takes the local timezone into account, so we do not want to use it here
      let value = zonedDate.toISOString().replace("Z", "");
      this.dateValue.datestring = value;
      this.dateValue.zonestring = timezone;
      this.publishUpdate(value, timezone);
    },
    publishUpdate(datestring, zonestring) {
      this.$emit("updateWidget", {
        nodeId: this.nodeId,
        update: {
          "viewRepresentation.currentValue": {
            datestring,
            zonestring,
          },
        },
      });
    },
    onDateChange(date) {
      this.onChange(date, this.timezone);
    },
    onTimezoneChange(timezone) {
      const existingTimeAsZonedTime = toZonedTime(
        this.dateObject,
        this.timezone,
      );
      const shiftedTime = fromZonedTime(existingTimeAsZonedTime, timezone);
      /**
       * Calling
       * this.onChange(this.dateObject, timezone);
       * would instead update the date object with the new timezone, which is not what we want.
       */
      this.onChange(shiftedTime, timezone);
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
      let errorMessage =
        validateDateInputCmp.errorMessage || "Current input is invalid.";

      return {
        isValid,
        errorMessage: isValid ? null : errorMessage,
      };
    },
  },
};
</script>

<template>
  <Label #default="{ labelForId }" class="date-time-label" :text="label" large>
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
        {{ showTime ? "Now" : "Today" }}
      </Button>
    </div>
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style lang="postcss" scoped>
.date-time-label {
  & .timezone {
    width: 100%;
    max-width: 15.3rem;
    margin-right: 20px;
  }

  & .zone-wrapper {
    display: flex;
    margin-top: 10px;

    & .now-button {
      height: 30px;
      align-self: center;
    }
  }
}
</style>
