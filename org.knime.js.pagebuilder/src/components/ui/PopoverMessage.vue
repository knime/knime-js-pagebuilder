<script>
import Label from '~/webapps-common/ui/components/forms/Label.vue';
import Button from '~/webapps-common/ui/components/Button.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';

import SignWarningIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg?inline';
import CircleWarningIcon from '~/webapps-common/ui/assets/img/icons/circle-warning.svg?inline';
import CircleMinus from '~/webapps-common/ui/assets/img/icons/circle-minus.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';
import CopyIcon from '~/webapps-common/ui/assets/img/icons/copy.svg?inline';

import { copyText } from '~/webapps-common/util/copyText';

// Arbitrary length limit to determine if messages should be expandable or displayed initially.
const MAX_EXPANDED_MESSAGE_LENGTH = 280;

/**
 * An absolutely-positioned, centered, expandable message component. This component centers itself inside of the parent
 * container and consists of a title, subtitle, message body, slot for a message body header as well as controls for
 * closing, minimizing, expanding/collapsing and copying the message to the users clipboard.
 *
 * The component offers two style options:
 *  @value error - error icon, red color scheme, expandable message body, minimize button.
 *  @value warn - warn icon, orange color scheme, pre-expanded message body (expansion disabled), no minimize button.
 */
export default {
    components: {
        Label,
        Button,
        FunctionButton,
        SignWarningIcon,
        CircleWarningIcon,
        CircleMinus,
        CloseIcon,
        DropdownIcon,
        CopyIcon
    },
    props: {
        /*
         * Controls the styling and default functionality.
         *
         * @values warn/info, error (default)
         */
        type: {
            type: String,
            default: 'error'
        },
        title: {
            type: String,
            default: ''
        },
        subtitle: {
            type: String,
            default: ''
        },
        messageBody: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            messageExpanded: false
        };
    },
    computed: {
        /**
         * @returns {Boolean} - if the message should be expandable or if it's short enough to be pre-expanded.
         */
        expandable() {
            return this.messageBody?.length > MAX_EXPANDED_MESSAGE_LENGTH;
        },
        expanded() {
            return !this.expandable || this.messageExpanded;
        }
    },
    methods: {
        /**
         * Event handler for closing/minimizing the alert.
         *
         * @param {Boolean} remove - if the close button was used (instead of minimize).
         * @emits {closeAlert} - the event which the parent should use to close/deactivate the alert.
         * @returns {undefined}
         */
        onClose(remove) {
            this.$emit('closeAlert', remove);
        },
        /**
         * Event handler for expanding message of the alert.
         *
         * @returns {undefined}
         */
        expandMessage() {
            this.messageExpanded = !this.messageExpanded;
        },
        /**
         * Event handler for copying the text of the alert. Issues toast for successful copying of text.
         *
         * @returns {undefined}
         */
        copyText() {
            copyText(this.$refs.messageContent.textContent);
            this.$store.dispatch('notification/show', {
                message: 'Text copied!',
                type: 'success',
                autoRemove: true
            }, { root: true });
        }
    }
};
</script>

<template>
  <div :class="['pop-over',{ expanded, expandable }, type]">
    <header>
      <Component
        :is="type === 'error' ? 'SignWarningIcon' : 'CircleWarningIcon'"
        class="icon warn-icon"
      />
      <Label
        :text="title"
        class="label"
      />
      <Button
        v-if="type !== 'warn'"
        title="Minimize"
        class="minimize-button"
        @click="onClose()"
      >
        <CircleMinus class="icon minimize-icon" />
      </Button>
      <Button
        title="Close"
        class="close-button"
        @click="onClose(true)"
      >
        <CloseIcon class="icon" />
      </Button>
    </header>
    <div
      v-if="messageBody"
      class="message-body"
    >
      <div class="expand-controls">
        <span>{{ subtitle }}</span>
        <span
          v-if="expandable"
          class="expand-text"
        >
          (See {{ expanded ? 'less' : 'more' }})
          <Button
            class="expand-button"
            title="Show more"
            @click="expandMessage"
          >
            <DropdownIcon />
          </Button>
        </span>
      </div>
      <transition name="message-fade">
        <div
          v-show="expanded"
          ref="messageContent"
          class="scrollable-message"
        >
          <slot name="messageBodyHeader" />
          <span class="message-block">
            {{ messageBody }}
          </span>
        </div>
      </transition>
      <div class="copy-button-container">
        <FunctionButton
          v-show="expanded"
          :compact="true"
          class="copy-button"
          @click="copyText"
        >
          <CopyIcon />
          Copy Text
        </FunctionButton>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
}

.pop-over {
  max-width: 50%;
  min-width: var(--grid-min-width);
  max-height: 100px;
  height: unset;
  transition: max-height 0.3s ease-in;
  margin: auto 25%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 0 20px 0 rgb(0 0 0 / 50%);

  & header {
    position: relative;
    padding: 8px 80px 8px 50px;

    & .label >>> label.label-text {
      color: white;
      margin: 6px 0 4px;
      line-height: 24px;
      max-width: 100%;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
    }

    & .icon {
      stroke-width: calc(32px / 24);
      stroke: white;

      &.warn-icon {
        position: absolute;
        left: 16px;
        top: 13px;
        width: 24px;
        height: 24px;
      }
    }

    & .close-button {
      top: 0;
      right: 0;
    }

    & .minimize-button {
      top: 0;
      right: 40px;
    }

    & .close-button,
    & .minimize-button {
      position: absolute;
      margin: 10px;
      z-index: 2;
      padding: 6px;
      border-radius: 50%;

      &:hover {
        background-color: var(--theme-button-function-background-color-hover);
      }

      &:focus {
        background-color: var(--theme-button-function-background-color-focus);
      }

      & svg {
        margin: 0;
        top: -1px;
      }
    }
  }

  & .message-body {
    height: calc(100% - 50px);
    position: relative;
    display: block;
    max-height: 75%;
    overflow-y: hidden;
    box-sizing: content-box;
    background-color: var(--knime-white);

    & .scrollable-message {
      padding: 0 0 0 16px;
      white-space: pre-line;
      overflow-x: hidden;
      width: calc(100% - 16px);
      height: calc(100% - 85px);
      position: absolute;

      & .info-header {
        font-weight: bold;
      }

      & .message-block {
        overflow-x: hidden;
        width: 100%;
        text-overflow: ellipsis;
        position: relative;
        display: inline-block;
      }
    }
  }

  &.expanded {
    max-height: 75%;
    transition: max-height 0.3s ease-out;

    & .expand-button >>> svg {
      transform: scaleY(-1);
    }

    & .message-body {
      height: calc(100% - 50px);
      max-height: 100%;
      box-sizing: content-box;

      & .scrollable-message {
        position: relative;
      }
    }

    & .copy-button-container {
      display: flex;
      justify-content: center;

      & .copy-button {
        margin-top: 2.5px;
        margin-bottom: 2.5px;
      }
    }
  }

  & .expand-controls {
    line-height: 18px;
    min-height: 50px;
    padding: 16px;
    margin: auto;

    & .expand-text {
      float: right;
      margin-right: 26px;
    }

    & .expand-button {
      position: absolute;
      margin: 10px;
      top: 0;
      right: 0;
      z-index: 2;
      padding: 6px;
      border-radius: 50%;
      line-height: unset;
      height: 30px;

      & svg {
        transition: transform 0.3s ease-in-out;
        margin: 0;
        top: 0;
        vertical-align: baseline;
      }

      &:hover {
        color: var(--theme-button-function-foreground-color-hover);
        background-color: var(--theme-button-function-background-color-hover);

        & >>> svg {
          stroke: var(--theme-button-function-foreground-color-hover);
        }
      }

      &:focus {
        color: var(--theme-button-function-foreground-color-focus);
        background-color: var(--theme-button-function-background-color-focus);

        & >>> svg {
          stroke: var(--theme-button-function-foreground-color-focus);
        }
      }
    }
  }

  &.error header {
    background-color: var(--theme-color-error);
  }

  &.warn header {
    background-color: var(--theme-color-action-required);
  }

  &.info header {
    background-color: var(--theme-color-info);
  }

  &:not(.expandable) {
    &.expanded {
      display: flex;
      flex-direction: column;
      height: fit-content; /* firefox does not support yet; causes non-expandable message to always be 50% height */
      max-height: 50%;
      overflow-y: hidden;

      & .message-body {
        height: 100%;

        /* autoprefixer: ignore next */
        height: fit-content;
        min-height: 115px;

        & .scrollable-message {
          max-height: calc(50vh - 135px);
          height: calc(100% - 85px);
        }
      }

      &.error {
        & .message-body {
          min-height: 150px;
        }
      }
    }
  }
}
</style>
