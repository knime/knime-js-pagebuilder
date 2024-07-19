<script>
import { mapState } from "vuex";

import { Label, Button } from "@knime/components";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const REFRESH_COUNTER_KEY = "refreshCounter";
const TIME_STAMP_KEY = "refreshTimestamp";

const DATA_TYPE = REFRESH_COUNTER_KEY;

/**
 * Refresh button widget.
 *
 * @emits updateWidget event to trigger a partial re-execution of the component.
 */
export default {
  components: {
    Button,
    Label,
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
    valuePair: {
      default: () => ({
        [DATA_TYPE]: 0,
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
      counter: this.valuePair[DATA_TYPE],
      date: new Date(),
    };
  },
  computed: {
    ...mapState("pagebuilder", ["nodesReExecuting"]),
    viewRep() {
      return this.nodeConfig.viewRepresentation;
    },
    isExecuting() {
      return Boolean(this.nodesReExecuting?.length);
    },
    isoFormattedDate() {
      return this.date.toISOString();
    },
  },
  methods: {
    onChange() {
      this.counter++;
      this.date = new Date();
      let update = {};
      update[`viewRepresentation.currentValue.${REFRESH_COUNTER_KEY}`] =
        this.counter;
      update[`viewRepresentation.currentValue.${TIME_STAMP_KEY}`] =
        this.isoFormattedDate;

      this.$emit("updateWidget", {
        nodeId: this.nodeId,
        update,
      });
    },
  },
};
</script>

<template>
  <Label :text="viewRep.label" :title="viewRep.description" large>
    <Button
      primary
      compact
      class="refresh-button"
      :disabled="isExecuting"
      @click="onChange"
    >
      {{ viewRep.buttonText }}
    </Button>
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>
