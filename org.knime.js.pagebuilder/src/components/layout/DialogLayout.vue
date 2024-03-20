<script>
import { mapGetters } from "vuex";

import NodeView from "./NodeView.vue";
import Messages from "webapps-common/ui/components/Messages.vue";
import { UIExtensionPushEvents } from "@knime/ui-extension-service";

export default {
  components: {
    NodeView,
    Messages,
  },
  props: {
    /**
     * Layout configuration as received from the REST API
     */
    layout: {
      default: () => ({}),
      type: Object,
      validate(rowConfig) {
        if (typeof rowConfig !== "object") {
          return false;
        }
        if (!rowConfig.hasOwnProperty("rows")) {
          return false;
        }
        return true;
      },
    },
  },
  data() {
    return {
      dispatchPushEventToView: null,
    };
  },
  computed: {
    ...mapGetters({
      message: "pagebuilder/alert/alertAsMessage",
    }),
    columns() {
      const rowConfig = this.layout.rows[0];
      return rowConfig.columns;
    },
    dialogContent() {
      return this.columns[1].content[0];
    },
    viewContent() {
      return this.columns[0].content[0];
    },
    messages() {
      if (!this.message) {
        return [];
      }
      return [this.message];
    },
    showMessages() {
      return Boolean(this.messages.length);
    },
  },
  methods: {
    /**
     * Event handler for closing the global alert from the alert store. This method takes a parameter passed to
     * the callback function of the global alert which can be used to conditionally clear the notification
     * locally. This enables different behavior e.g. when the user clicks the 'close' button (requesting a true
     * alert dismissal) vs. a click-away or 'minimize' event (where the user just wants to hide the alert).
     *
     * @param {Boolean} remove - the parameter passed to the alert callback function.
     * @returns {undefined}
     */
    onClose(remove) {
      this.$store.dispatch("pagebuilder/alert/closeAlert", remove);
    },
    onRegisterViewPushEventService(dispatchPushEvent) {
      this.dispatchPushEventToView = dispatchPushEvent;
    },
    onPublishDialogData(data) {
      this.dispatchPushEventToView?.({
        eventType: UIExtensionPushEvents.EventTypes.DataEvent,
        payload: data,
      });
    },
  },
};
</script>

<template>
  <div class="layout">
    <div class="item view">
      <NodeView
        class="view-content view-layout"
        :view-config="viewContent"
        @register-push-event-service="onRegisterViewPushEventService"
      />
      <Messages
        v-if="showMessages"
        class="messages"
        :messages="messages"
        @dismiss="onClose"
      />
    </div>
    <div class="item dialog">
      <NodeView
        :view-config="dialogContent"
        @publish-data="onPublishDialogData"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.layout {
  display: flex;
  flex-wrap: wrap;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-basis: 0;
  flex-grow: 1;
  flex-direction: column;

  & .view-content {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    overflow: auto;
  }

  & .messages {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;

    & :deep(.panel) {
      padding-left: 25%;
      margin-left: -25%;
      padding-right: 25%;
      margin-right: -25%;
      width: unset;
      max-width: none;
      display: block;
      position: unset;
    }
  }
}

.dialog {
  flex: 0 0 calc(4 * 100% / 12);
  max-width: calc(4 * 100% / 12);
  background-color: var(--knime-gray-ultra-light);
  border-left: 1px solid var(--knime-silver-sand);
  height: 100vh;
}

.view {
  flex: 0 0 calc(8 * 100% / 12);
  max-width: calc(8 * 100% / 12);

  & :deep(iframe) {
    height: calc(100vh - 10px);
  }
}
</style>
