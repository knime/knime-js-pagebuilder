<script>
import { mapGetters } from 'vuex';
import Popover from './Popover';
import PopoverMessage from './PopoverMessage';

/**
 * This is the PageBuilder top level alert/error management component. It relies on the global alert store and
 * is **always** full screen and fixed in position. Its main use is to replace the native browser `alert`. It
 * is composed of a full screen overlay which blocks mouse events and an expandable message body displaying a
 * message.
 */
export default {
    components: {
        Popover,
        PopoverMessage
    },
    computed: {
        /*
         * Controls the message content and @see PopoverMessage styling.
         *
         * @values warn, error (default)
         */
        type() {
            return this.alert && this.alert.type ? this.alert.type : 'error';
        },
        isError() {
            return this.type === 'error';
        },
        nodeId() {
            return this.alert && this.alert.nodeId ? this.alert.nodeId : '';
        },
        nodeInfo() {
            return this.alert && this.alert.nodeInfo ? this.alert.nodeInfo : {};
        },
        nodeName() {
            return this.nodeInfo.nodeName || 'Missing node';
        },
        title() {
            return `${this.isError ? 'ERROR' : 'WARNING'}: ${this.nodeName}`;
        },
        subtitle() {
            return this.isError ? 'Sorry, a problem occurred:' : 'Message(s) on node:';
        },
        messageText() {
            return this.alert && this.alert.message
                ? this.alert.message
                : 'No further information available. Please check the workflow configuration.';
        },
        ...mapGetters({
            alert: 'pagebuilder/alert/currentAlert'
        })
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
            this.$store.dispatch('pagebuilder/alert/closeAlert', remove);
        }
    }
};
</script>

<template>
  <Popover
    class="container"
    :active="Boolean(alert)"
    :level="'global'"
    @clickAway="onClose(!isError)"
  >
    <template #popoverContent>
      <PopoverMessage
        :type="type"
        :title="title"
        :subtitle="subtitle"
        :message-body="messageText"
        @closeAlert="remove => onClose(remove)"
      >
        <template #messageBodyHeader>
          <span v-if="isError">
            <!-- This "header" is shown inside the expandable message body above the main content of the message. -->
            <span class="info-header">Node:</span>
            {{ `${nodeId} ${nodeInfo.nodeAnnotation ? '(' + nodeInfo.nodeAnnotation + ')' : ''}\n` }}
            <span class="info-header">Message:</span>
          </span>
        </template>
      </PopoverMessage>
    </template>
  </Popover>
</template>

<style lang="postcss" scoped>
.info-header {
  font-weight: bold;
}
</style>
